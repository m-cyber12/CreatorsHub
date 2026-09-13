import { ALL_TOOLS } from '@/data/tools';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import type { PriceChangePoint } from '@/lib/updates';

/**
 * Server-only helper: recent recorded price changes across the catalog.
 *
 * Reads the `price_history` table (migration 0004, written by
 * scripts/record-price.mjs), groups consecutive points per tool, and emits
 * one change event per price difference — newest first.
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
    const seen = new Map<string, string | null>();
    const changes: PriceChangePoint[] = [];

    // Rows are newest-first; `seen` tracks the newest price per tool so a
    // second row with a different price marks the from→to boundary.
    for (const row of data as { tool_slug: string; starting_price: string | null; noticed_at: string }[]) {
      const slug = row.tool_slug;
      const price = row.starting_price;
      if (!seen.has(slug)) {
        seen.set(slug, price);
        continue;
      }
      const newest = seen.get(slug);
      if (newest !== price) {
        changes.push({
          slug,
          toolName: names.get(slug) ?? slug,
          from: price,
          to: newest ?? null,
          date: row.noticed_at.slice(0, 10),
        });
        // Keep scanning older rows: a tool may have changed twice.
        seen.set(slug, price);
      }
      if (changes.length >= limit) break;
    }
    return changes;
  } catch {
    return [];
  }
}
