import { ALL_TOOLS } from '@/data/tools';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { extractPriceChanges, type PriceChangePoint, type PriceHistoryRow } from '@/lib/updates';

/**
 * Server-only helper: recent recorded price changes across the catalog.
 *
 * Reads the `price_history` table (migration 0004, written by
 * scripts/record-price.mjs) and groups consecutive points per tool.
 *
 * Honest by construction: unconfigured Supabase or an empty table yields
 * an empty list, never synthetic changes.
 */
export async function getRecentPriceChanges(limit = 50): Promise<PriceChangePoint[]> {
  if (!supabaseAdmin) return [];
  try {
    const { data, error } = await supabaseAdmin
      .from('price_history')
      .select('tool_slug, starting_price, noticed_at')
      .order('noticed_at', { ascending: false })
      .limit(400);
    if (error || !data) return [];
    const names = new Map(ALL_TOOLS.map((t) => [t.slug, t.name]));
    return extractPriceChanges(data as PriceHistoryRow[], names, limit);
  } catch {
    return [];
  }
}
