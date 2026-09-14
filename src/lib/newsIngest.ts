import 'server-only';
import { fetchLiveNews, enrichMany } from '@/lib/news';
import { filterRelevant } from '@/lib/newsRelevance';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import type { NewsItem } from '@/data/news';

/**
 * Shared ingestion pipeline (v2.8): used by the hourly cron
 * (/api/news/refresh) AND by the admin panel's "Ingest now" button
 * (/api/admin/news/refresh).
 *
 * Fetch → creator-relevance gate → FULL-TEXT ENRICHMENT → insert as LIVE
 * (approved = true). v3 (2026-08-08): the manual approval gate was removed —
 * items that pass the automated relevance gate publish automatically.
 * v3.4: now enriches full text at ingest time (not just at read time) and
 * updates existing short rows when a longer version is available.
 */

export interface IngestResult {
  ok: boolean;
  fetched: number;
  kept: number;
  insertedNew: number;
  updated: number;
  /** The items that passed the gate this run (i18n: auto-translate hook). */
  items?: NewsItem[];
  aiSummarized: number;
  note: string;
}

export async function runNewsIngest(): Promise<IngestResult> {
  const live = await fetchLiveNews();
  if (live.length === 0) {
    return {
      ok: false,
      fetched: 0,
      kept: 0,
      insertedNew: 0,
      updated: 0,
      aiSummarized: 0,
      note: 'No live news could be fetched from the configured sources.',
    };
  }

  const relevantLive = filterRelevant(live);
  if (relevantLive.length === 0) {
    return {
      ok: false,
      fetched: live.length,
      kept: 0,
      insertedNew: 0,
      updated: 0,
      aiSummarized: 0,
      note: 'Feeds fetched, but nothing passed the creator-relevance gate.',
    };
  }

  // v3.4: ENRICH at ingest time - this is the fix for incomplete news
  // Previously enrichment only happened in getNews() live mode, so supabase
  // rows were stored with 240-char excerpts forever.
  // Now we enrich up to 50 newest items with full article text.
  let enrichedItems: NewsItem[];
  try {
    enrichedItems = await enrichMany(relevantLive, 50);
  } catch {
    enrichedItems = relevantLive;
  }

  const items = enrichedItems.map((item) => ({ ...item, aiSummarized: false }));

  if (!supabaseAdmin) {
    return {
      ok: false,
      fetched: items.length,
      kept: relevantLive.length,
      insertedNew: 0,
      updated: 0,
      aiSummarized: 0,
      note: 'SUPABASE_SERVICE_ROLE_KEY is not configured — nothing was persisted.',
    };
  }

  const rows = items.map((i) => ({
    slug: i.slug,
    title: i.title,
    excerpt: i.excerpt,
    content: i.content,
    source: i.source,
    source_url: i.sourceUrl,
    published_at: i.publishedAt,
    iso_date: i.isoDate,
    category: i.category,
    image: i.image || null,
    ai_summarized: i.aiSummarized,
    approved: true,
  }));

  let insertedNew = 0;
  let updated = 0;

  // v3.4: Two-phase upsert - first try to insert new, then update short existing rows
  // Phase 1: Insert new slugs only (ignore duplicates)
  for (let i = 0; i < rows.length; i += 50) {
    const chunk = rows.slice(i, i + 50);
    const { data, error } = await supabaseAdmin
      .from('news_items')
      .upsert(chunk, { onConflict: 'slug', ignoreDuplicates: true })
      .select('slug');
    if (error) {
      return {
        ok: false,
        fetched: items.length,
        kept: relevantLive.length,
        insertedNew,
        updated,
        aiSummarized: 0,
        note: error.message,
      };
    }
    insertedNew += data?.length ?? 0;
  }

  // Phase 2: For existing rows that are short (<800 chars), update if we have longer content
  // This heals old incomplete rows
  try {
    const existingSlugs = rows.map((r) => r.slug);
    // Fetch existing short rows
    const { data: existingRows } = await supabaseAdmin
      .from('news_items')
      .select('slug, content')
      .in('slug', existingSlugs);

    if (existingRows && existingRows.length > 0) {
      const shortExisting = new Map<string, number>();
      for (const er of existingRows) {
        const len = String(er.content || '').length;
        if (len < 800) shortExisting.set(er.slug, len);
      }

      const toUpdate = rows.filter((r) => {
        const oldLen = shortExisting.get(r.slug);
        return oldLen !== undefined && r.content.length > oldLen + 200;
      });

      for (let i = 0; i < toUpdate.length; i += 20) {
        const chunk = toUpdate.slice(i, i + 20);
        for (const row of chunk) {
          const { error } = await supabaseAdmin
            .from('news_items')
            .update({
              content: row.content,
              excerpt: row.excerpt,
              title: row.title,
            })
            .eq('slug', row.slug);
          if (!error) updated++;
        }
      }
    }
  } catch {
    // Non-critical - don't fail ingest if update phase fails
  }

  return {
    ok: true,
    fetched: items.length,
    kept: relevantLive.length,
    insertedNew,
    updated,
    items,
    aiSummarized: 0,
    note: `New: ${insertedNew}, Updated short rows: ${updated}. Full text enriched via @extractus/article-extractor + fallback raw fetch.`,
  };
}
