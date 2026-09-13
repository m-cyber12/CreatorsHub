import { NextResponse } from 'next/server';
import { getRecentPriceChanges } from '@/lib/priceChanges';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { rateLimit, clientIp } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/updates/price-changes
 *
 * Return loop (P1): the global price-change feed. Powers the "price changes"
 * filter on /updates and any future watcher. Backed by the `price_history`
 * table (migration 0004); honest-empty when unconfigured.
 */
export async function GET(request: Request) {
  if (!rateLimit(`pricechanges:${clientIp(request)}`, 60, 60_000)) {
    return NextResponse.json({ error: 'Rate limit exceeded.' }, { status: 429 });
  }
  const changes = await getRecentPriceChanges(50);
  return NextResponse.json(
    {
      configured: supabaseAdmin !== null,
      count: changes.length,
      changes,
      note:
        changes.length === 0
          ? 'No recorded price changes yet. Prices are re-checked by editors; nothing is synthesized.'
          : undefined,
    },
    { status: 200 }
  );
}
