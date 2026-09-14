import 'server-only';
import { SITE_URL } from '@/config/site';
import { ALL_NEWS_SOURCES, type NewsSource } from '@/data/news-sources';
import { newsSlug, type NewsItem } from '@/data/news';
import { parseFeed, type ParsedFeedEntry } from '@/lib/rss';
import { extract } from '@extractus/article-extractor';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { supabase } from '@/lib/supabase';
import { filterRelevant } from '@/lib/newsRelevance';
import { isNewsEnabled } from '@/lib/newsSettings';

/**
 * Live news ingestion for the auto-aggregator (idea #13).
 *
 * getNews() is the single entry point the /news pages use. Its behaviour is
 * deliberately fail-safe so the site always builds and the page always
 * renders:
 *
 *   1. If a cron-refreshed snapshot exists in Supabase (news_items), serve it
 *      — this is the "auto-published with AI summaries" production path.
 *   2. Otherwise attempt a live fetch of NEWS_SOURCES with a short timeout.
 *   3. On any failure, fall back to the hand-written CURATED_NEWS.
 *
 * AI summarization is intentionally NOT done here on every render (slow +
 * costly). It happens once per refresh in /api/news/refresh, which persists
 * the summarized snapshot. Live/fallback items therefore keep
 * aiSummarized: false and stay honest about it.
 */

const FETCH_TIMEOUT_MS = 6_000;
const ENRICH_TIMEOUT_MS = 12_000;
// v3: deeper archive — pull as much 2026 news as the feeds provide so the
// archive reaches back to the start of the year (feeds only serve recent
// items; the daily cron keeps accumulating older ones in Supabase).
const MAX_LIVE_ITEMS = 200;
const MAX_SOURCE_ITEMS = 40;

function entryToNewsItem(entry: ParsedFeedEntry, source: NewsSource): NewsItem | null {
  const slug = newsSlug(entry.title);
  if (!slug) return null;
  // Keep only 2026+ stories — the archive starts at the beginning of 2026.
  const publishedAt = entry.publishedAt || new Date().toISOString();
  if (publishedAt < '2026-01-01') return null;
  return {
    slug,
    title: entry.title,
    excerpt: entry.description.slice(0, 240),
    content: entry.content || entry.description || entry.title,
    source: source.name,
    sourceUrl: entry.link,
    publishedAt,
    isoDate: publishedAt.slice(0, 10),
    category: entry.categories[0] || source.category,
    aiSummarized: false,
  };
}

/**
 * In-process full-text cache (v3.2). RSS feeds usually give only a short
 * excerpt; when a story's body is too short we fetch the actual article and
 * extract the full text with @extractus/article-extractor (lightweight,
 * no browser — safe for serverless). Cached per process so re-renders never
 * re-fetch.
 */
const fullTextCache = new Map<string, string>();

/** Convert extracted HTML into plain paragraphs (\n\n separated). */
function htmlToPlain(html: string): string {
  if (!html) return '';
  let s = html;
  // Remove unwanted sections first
  s = s.replace(/<script[\s\S]*?<\/script>/gi, ' ');
  s = s.replace(/<style[\s\S]*?<\/style>/gi, ' ');
  s = s.replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ');
  s = s.replace(/<!--[\s\S]*?-->/g, ' ');
  // Try to keep structure
  s = s.replace(/<\/(p|div|h[1-6]|li|blockquote|tr)>/gi, '\n\n');
  s = s.replace(/<(br|hr)[^>]*>/gi, '\n');
  s = s.replace(/<li[^>]*>/gi, '\n• ');
  // Strip remaining tags
  s = s.replace(/<[^>]+>/g, ' ');
  // Decode entities
  s = s.replace(/&nbsp;|&#160;|&#xA0;/gi, ' ');
  s = s.replace(/&amp;/g, '&');
  s = s.replace(/&lt;/g, '<');
  s = s.replace(/&gt;/g, '>');
  s = s.replace(/&quot;/g, '"');
  s = s.replace(/&#0?39;|&apos;|&#x27;/g, "'");
  s = s.replace(/&#822[01];/g, '"');
  s = s.replace(/&#821[67];/g, "'");
  s = s.replace(/&#8211;/g, '–');
  s = s.replace(/&#8212;/g, '—');
  s = s.replace(/&#8230;/g, '…');
  // Collapse whitespace but keep paragraph breaks
  s = s.replace(/[ \t]+/g, ' ');
  s = s.replace(/\n[ \t]+/g, '\n');
  s = s.replace(/\n{3,}/g, '\n\n');
  // Remove boilerplate lines like "The article ... appeared first on"
  s = s.replace(/The article .* appeared first on .*\.?/gi, '');
  s = s.replace(/This story originally appeared on .*\.?/gi, '');
  s = s.replace(/Read more at .*$/gim, '');
  return s.trim();
}

/** Fallback raw fetch + heuristic extraction when @extractus fails */
async function fetchRawArticleText(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(ENRICH_TIMEOUT_MS),
      headers: {
        'user-agent': `Noxifera-NewsBot/1.0 (+${SITE_URL}/about)`,
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'accept-language': 'en-US,en;q=0.9',
      },
      cache: 'no-store',
    });
    if (!res.ok) return '';
    const html = await res.text();
    if (!html || html.length < 500) return '';

    // Heuristic: try to extract <article>...</article> first
    const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
    let candidate = articleMatch ? articleMatch[1] : '';

    // If no article tag, try common content containers
    if (!candidate) {
      const contentDiv = html.match(
        /<div[^>]*class=["'][^"']*(?:post-content|entry-content|article-content|story-content|content-body|td-post-content)[^"']*["'][^>]*>([\s\S]*?)<\/div>/i
      );
      if (contentDiv) candidate = contentDiv[1];
    }

    // Fallback to body
    if (!candidate) {
      const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      candidate = bodyMatch ? bodyMatch[1] : html;
    }

    const plain = htmlToPlain(candidate);
    // Filter out very short or nav-heavy results
    if (plain.length < 300) return '';
    // Remove excessive repeated lines (often nav)
    const lines = plain.split('\n').filter((l) => l.trim().length > 20);
    if (lines.length < 2) return '';
    return plain;
  } catch {
    return '';
  }
}

/**
 * If the item body is too short to be a real article (<800 chars), fetch the
 * source URL and extract the full text. Never throws — returns the item
 * unchanged on failure. Runs at ingest/live-fetch time, not per page view.
 */
const FULL_TEXT_MIN = 800;

export async function enrichFullText(item: NewsItem): Promise<NewsItem> {
  if (item.content.length >= FULL_TEXT_MIN) return item;
  const cached = fullTextCache.get(item.sourceUrl);
  if (cached) {
    if (cached.length > item.content.length) {
      item.content = cached;
      if (item.excerpt.length < 120) item.excerpt = cached.slice(0, 320);
    }
    return item;
  }

  // 1) Try @extractus
  try {
    const art = await extract(item.sourceUrl);
    const text = art?.content ? htmlToPlain(art.content) : '';
    if (text.length > 300 && text.length > item.content.length) {
      fullTextCache.set(item.sourceUrl, text);
      item.content = text;
      if (item.excerpt.length < 120) item.excerpt = text.slice(0, 320);
      if (text.length >= FULL_TEXT_MIN) return item;
    }
  } catch {
    // continue to fallback
  }

  // 2) Fallback raw fetch
  try {
    const rawText = await fetchRawArticleText(item.sourceUrl);
    if (rawText.length > 300 && rawText.length > item.content.length) {
      fullTextCache.set(item.sourceUrl, rawText);
      item.content = rawText;
      if (item.excerpt.length < 120) item.excerpt = rawText.slice(0, 320);
    }
  } catch {
    // keep original
  }

  return item;
}

/**
 * Best-effort: enrich up to `max` items with full text, bounded so a page
 * render can never hang on many slow fetches. Runs with concurrency.
 */
export async function enrichMany(items: NewsItem[], max = 25): Promise<NewsItem[]> {
  const toEnrich = items.slice(0, max);
  const rest = items.slice(max);

  // Concurrency limited parallel enrichment
  const CONCURRENCY = 4;
  const enriched: NewsItem[] = [];
  let idx = 0;

  async function worker() {
    while (idx < toEnrich.length) {
      const current = idx++;
      const item = toEnrich[current];
      // Only enrich short ones
      if (item.content.length >= FULL_TEXT_MIN) {
        enriched[current] = item;
        continue;
      }
      try {
        const enrichedItem = await enrichFullText(item);
        enriched[current] = enrichedItem;
      } catch {
        enriched[current] = item;
      }
      // Polite delay between fetches per worker
      await new Promise((r) => setTimeout(r, 200));
    }
  }

  const workers = Array.from({ length: Math.min(CONCURRENCY, toEnrich.length) }, () => worker());
  await Promise.all(workers);

  // Fill any gaps (if worker didn't run due to concurrency race)
  for (let i = 0; i < toEnrich.length; i++) {
    if (!enriched[i]) enriched[i] = toEnrich[i];
  }

  return [...enriched, ...rest];
}

/** Fetch one feed, returning normalized items (never throws). */
async function fetchSource(source: NewsSource): Promise<NewsItem[]> {
  try {
    const res = await fetch(source.url, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: {
        'user-agent': `Noxifera-NewsBot/1.0 (+${SITE_URL}/about)`,
        accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*',
      },
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const xml = await res.text();
    const feed = parseFeed(xml);
    return feed.entries
      .map((e) => entryToNewsItem(e, source))
      .filter((n): n is NewsItem => n !== null)
      .slice(0, MAX_SOURCE_ITEMS);
  } catch {
    return [];
  }
}

/**
 * v3 backfill: fetch AI news from GNews with a date range back to the start
 * of 2026 (free tier: 100 requests/day, ~10 items per request). Optional —
 * enabled by setting GNES_API_KEY (https://gnews.io free key). Gives the
 * archive real stories from January 2026 onward, not just the latest feed
 * items. Never throws; returns [] on any failure.
 */
const GNES_KEY = () => process.env.GNEWS_API_KEY || '';

async function fetchGNewsBackfill(): Promise<NewsItem[]> {
  const apiKey = GNES_KEY();
  if (!apiKey) return [];

  const queries = [
    '"AI video" OR "AI video generation" OR "AI video editor"',
    '"AI voice" OR "AI dubbing" OR "text to speech"',
    '"AI tools" OR "AI for creators" OR "AI content creation"',
    '"AI video generator" OR "AI avatar" OR "AI podcast"',
  ];
  const out: NewsItem[] = [];
  const from = '2026-01-01T00:00:00Z';
  const to = new Date().toISOString();

  for (const q of queries) {
    try {
      const url =
        'https://gnews.io/api/v4/search?lang=en&max=10&from=' +
        encodeURIComponent(from) +
        '&to=' +
        encodeURIComponent(to) +
        '&q=' +
        encodeURIComponent(q) +
        '&apikey=' +
        apiKey;
      const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
      if (!res.ok) continue;
      const data = (await res.json()) as {
        articles?: {
          title?: string;
          description?: string;
          content?: string;
          url?: string;
          image?: string;
          publishedAt?: string;
          source?: { name?: string };
        }[];
      };
      for (const a of data.articles ?? []) {
        if (!a.title || !a.url) continue;
        const publishedAt = a.publishedAt || new Date().toISOString();
        if (publishedAt < '2026-01-01') continue;
        const slug = newsSlug(a.title);
        if (!slug) continue;
        out.push({
          slug,
          title: a.title.trim(),
          excerpt: (a.description || a.content || '').slice(0, 240),
          content: a.content || a.description || a.title,
          source: a.source?.name || 'GNews',
          sourceUrl: a.url,
          publishedAt,
          isoDate: publishedAt.slice(0, 10),
          category: 'Industry',
          image: a.image || undefined,
          aiSummarized: false,
        });
      }
      // Free tier: be polite between queries.
      await new Promise((r) => setTimeout(r, 300));
    } catch {
      // continue with next query
    }
  }
  return out;
}

export async function fetchLiveNews(): Promise<NewsItem[]> {
  const [perSource, gnews] = await Promise.all([
    Promise.all(ALL_NEWS_SOURCES.map(fetchSource)),
    fetchGNewsBackfill(),
  ]);
  const bySlug = new Map<string, NewsItem>();
  for (const items of [...perSource, gnews]) {
    for (const item of items) {
      if (!bySlug.has(item.slug)) bySlug.set(item.slug, item);
    }
  }
  return [...bySlug.values()]
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, MAX_LIVE_ITEMS);
}

/** Try the persisted snapshot, then live, then curated fallback.
 * v2 real-site fix:
 * - respects news_enabled toggle (if disabled -> empty)
 * - if Supabase is configured, DB is source of truth: empty DB means empty site (no live fallback) so "Delete All" actually clears the site
 * - live fallback only when Supabase not configured (local dev without keys)
 */
export async function getNews(): Promise<{ items: NewsItem[]; mode: 'supabase' | 'live' | 'empty' }> {
  // 0) Respect admin toggle
  try {
    if (!(await isNewsEnabled())) {
      return { items: [], mode: 'empty' };
    }
  } catch {
    // if toggle check fails, continue
  }

  // 1) Persisted snapshot from the cron refresh (the production "auto" path).
  const hasSupabase = !!supabaseAdmin || !!supabase;
  if (supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin
        .from('news_items')
        .select('*')
        .eq('approved', true)
        .order('published_at', { ascending: false })
        .limit(MAX_LIVE_ITEMS);
      if (!error) {
        if (data && data.length > 0) {
          const items: NewsItem[] = data.map((r) => ({
            slug: r.slug,
            title: String(r.title).replace(/<!\[CDATA\[|\]\]>/g, '').trim(),
            excerpt: r.excerpt,
            content: r.content,
            source: r.source,
            sourceUrl: r.source_url,
            publishedAt: r.published_at,
            isoDate: r.iso_date || r.published_at.slice(0, 10),
            category: r.category,
            image: r.image || undefined,
            aiSummarized: r.ai_summarized === true,
          }));
          const relevant = filterRelevant(items);
          if (relevant.length > 0) {
            const shortCount = relevant.slice(0, 15).filter((i) => i.content.length < FULL_TEXT_MIN).length;
            if (shortCount > 0) {
              try {
                const enriched = await enrichMany(relevant.slice(0, 15), Math.min(shortCount, 8));
                const enrichedMap = new Map(enriched.map((e) => [e.slug, e]));
                const merged = relevant.map((orig) => enrichedMap.get(orig.slug) || orig);
                return { items: merged, mode: 'supabase' };
              } catch {
                // fall through
              }
            }
            return { items: relevant, mode: 'supabase' };
          }
          // DB had rows but none passed relevance -> treat as empty (don't fallback to live when DB configured)
          return { items: [], mode: 'empty' };
        }
        // DB configured but empty -> user deleted all or no data yet -> empty, NOT live fallback
        if (hasSupabase) {
          return { items: [], mode: 'empty' };
        }
      }
    } catch {
      // fall through
    }
  }

  // If Supabase is configured (even via anon key), we already returned empty above when no rows.
  // Only fallback to live when Supabase is NOT configured at all (local dev without keys)
  if (hasSupabase) {
    return { items: [], mode: 'empty' };
  }

  // 2) Live RSS fetch (only when Supabase not configured)
  try {
    const live = filterRelevant(await fetchLiveNews());
    if (live.length > 0) {
      const sorted = await enrichMany(dedupeSort(live).slice(0, 30), 20);
      return { items: sorted, mode: 'live' };
    }
  } catch {
    // fall through
  }

  // 3) Honest empty state
  return { items: [], mode: 'empty' };
}

export function dedupeSort(items: NewsItem[]): NewsItem[] {
  const seen = new Set<string>();
  const out: NewsItem[] = [];
  for (const item of [...items].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))) {
    if (seen.has(item.slug)) continue;
    seen.add(item.slug);
    out.push(item);
  }
  return out;
}

/** Group a set of news items by category, preserving a stable order. */
export function groupNewsByCategory(items: NewsItem[]): Map<string, NewsItem[]> {
  const order = [
    'Launches',
    'Video Generation',
    'Video Editing & VFX',
    'Video Repurposing',
    'Voice & Audio',
    'Music & Audio',
    'AI Avatars',
    'Automation',
    'Pricing',
    'Technology',
    'Industry',
  ];
  const map = new Map<string, NewsItem[]>();
  for (const item of items) {
    const cat = item.category || 'Industry';
    const list = map.get(cat) ?? [];
    list.push(item);
    map.set(cat, list);
  }
  const keys = [...map.keys()].sort((a, b) => {
    const ia = order.indexOf(a);
    const ib = order.indexOf(b);
    if (ia !== -1 || ib !== -1) return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
    return a.localeCompare(b);
  });
  const sorted = new Map<string, NewsItem[]>();
  for (const key of keys) sorted.set(key, map.get(key)!);
  return sorted;
}
