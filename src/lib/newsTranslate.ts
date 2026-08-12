import 'server-only';

/**
 * News i18n — on-demand translation (v3.3).
 *
 * Ingest-time translation (autoTranslateNews) covers the first few new items
 * per refresh. This module adds the safety net for everything else: when a
 * visitor opens an article in a non-English locale, the missing fields
 * (title / excerpt / content / category) are translated on demand with the
 * configured provider and cached in `content_translations`, so the FIRST
 * viewer in each language pays the latency and everyone after is instant.
 *
 * Free-tier reality: if the provider is rate-limited or not configured the
 * call no-ops and the page renders English — the read path (localizeNews)
 * already falls back gracefully.
 */

import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { buildNewsEntities, translateEntity } from '@/lib/i18n/translateContent';
import { isEngineConfiguredFull } from '@/lib/i18n/engine';
import type { NewsItem } from '@/data/news';

/** Dedupe concurrent on-demand requests for the same article+locale. */
const inFlight = new Map<string, Promise<void>>();

export async function ensureNewsTranslation(
  item: NewsItem,
  locale: string,
  opts: { includeContent?: boolean } = {}
): Promise<void> {
  if (!locale || locale === 'en') return;
  const key = `${locale}:${item.slug}`;
  const pending = inFlight.get(key);
  if (pending) return pending;
  const run = doEnsure(item, locale, opts).finally(() => inFlight.delete(key));
  inFlight.set(key, run);
  return run;
}

async function doEnsure(
  item: NewsItem,
  locale: string,
  opts: { includeContent?: boolean }
): Promise<void> {
  try {
    if (!(await isEngineConfiguredFull())) return;

    // Which fields are already translated (snapshot or DB)?
    const existing = new Set<string>();
    if (supabaseAdmin) {
      const { data } = await supabaseAdmin
        .from('content_translations')
        .select('field')
        .eq('locale', locale)
        .eq('entity_type', 'news')
        .eq('entity_id', item.slug);
      for (const row of data ?? []) existing.add(row.field);
    }

    const wanted: string[] = opts.includeContent
      ? ['title', 'excerpt', 'content', 'categoryLabel']
      : ['title', 'excerpt', 'categoryLabel'];

    const missing: Record<string, string> = {};
    for (const field of wanted) {
      if (existing.has(field)) continue;
      const text = field === 'categoryLabel' ? item.category : (item as unknown as Record<string, string>)[field];
      if (text && text.trim()) missing[field] = text;
    }
    if (Object.keys(missing).length === 0) return;

    const source = buildNewsEntities([item])[0];
    await translateEntity(locale, { source, missing });
  } catch {
    // Never break the page render because of a translation attempt.
  }
}
