import { NextResponse } from 'next/server';
import { isAdminAuthorized } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { ALL_TOOLS } from '@/data/tools';

export const dynamic = 'force-dynamic';

const STALE_AFTER_DAYS = 90;
const SAMPLE = 50;

/**
 * GET /api/admin/health — catalog health queues (P4):
 * broken outbound links (link_health_latest), stale pricing data (computed
 * live from the catalog — no DB needed), price-tracking coverage, and a
 * review-needed rollup pointing at the moderation tabs.
 */
export async function GET() {
  if (!(await isAdminAuthorized())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = Date.now();
  const staleCutoff = new Date(now - STALE_AFTER_DAYS * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const neverChecked: { slug: string; name: string }[] = [];
  const stale: { slug: string; name: string; checkedAt: string }[] = [];
  let missingSource = 0;
  for (const t of ALL_TOOLS) {
    if (!t.pricingCheckedAt) {
      if (neverChecked.length < SAMPLE) neverChecked.push({ slug: t.slug, name: t.name });
    } else if (t.pricingCheckedAt.slice(0, 10) < staleCutoff) {
      if (stale.length < SAMPLE) stale.push({ slug: t.slug, name: t.name, checkedAt: t.pricingCheckedAt.slice(0, 10) });
    }
    if (!t.pricingSourceUrl) missingSource += 1;
  }
  const neverCheckedCount = ALL_TOOLS.filter((t) => !t.pricingCheckedAt).length;
  const staleCount = ALL_TOOLS.filter(
    (t) => t.pricingCheckedAt && t.pricingCheckedAt.slice(0, 10) < staleCutoff
  ).length;

  const payload = {
    configured: Boolean(supabaseAdmin),
    staleAfterDays: STALE_AFTER_DAYS,
    brokenLinks: {
      available: false,
      lastRun: null as string | null,
      broken: [] as { toolSlug: string; url: string; statusCode: number; error: string | null; checkedAt: string }[],
    },
    stalePricing: {
      catalogTotal: ALL_TOOLS.length,
      neverCheckedCount,
      neverCheckedSample: neverChecked,
      staleCount,
      staleSample: stale,
      missingSourceCount: missingSource,
    },
    priceTracking: {
      available: false,
      toolsTracked: 0,
      pointsRecorded: 0,
      lastRecordedAt: null as string | null,
    },
    reviewNeeded: { communityPending: 0, communityReports: 0, reviewsPending: 0 },
  };

  if (!supabaseAdmin) return NextResponse.json(payload, { status: 200 });
  const db = supabaseAdmin;

  try {
    const { data: broken } = await db
      .from('link_health_latest')
      .select('tool_slug, url, status_code, error, checked_at')
      .eq('ok', false)
      .order('checked_at', { ascending: false })
      .limit(100);
    const rows = (broken ?? []) as { tool_slug: string; url: string; status_code: number; error: string | null; checked_at: string }[];
    const { data: latest } = await db.from('link_health').select('checked_at').order('checked_at', { ascending: false }).limit(1);
    payload.brokenLinks = {
      available: true,
      lastRun: (latest?.[0] as { checked_at?: string } | undefined)?.checked_at ?? null,
      broken: rows.map((r) => ({
        toolSlug: r.tool_slug,
        url: r.url,
        statusCode: r.status_code,
        error: r.error,
        checkedAt: r.checked_at,
      })),
    };
  } catch {
    // link_health tables predate this feature; leave unavailable-labeled.
  }

  try {
    const [{ data: points }, { count: pointCount }] = await Promise.all([
      db.from('price_history').select('tool_slug, noticed_at').order('noticed_at', { ascending: false }).limit(2000),
      db.from('price_history').select('id', { count: 'exact', head: true }),
    ]);
    const list = (points ?? []) as { tool_slug: string; noticed_at: string }[];
    payload.priceTracking = {
      available: true,
      toolsTracked: new Set(list.map((p) => p.tool_slug)).size,
      pointsRecorded: pointCount ?? list.length,
      lastRecordedAt: list[0]?.noticed_at ?? null,
    };
  } catch {
    // price_history missing — stays unavailable-labeled.
  }

  try {
    const count = async (table: string, col: string, val: unknown) => {
      const { count: n } = await db.from(table).select('id', { count: 'exact', head: true }).eq(col, val);
      return n ?? 0;
    };
    const [{ count: reports }, communityPending, reviewsPending] = await Promise.all([
      db.from('community_reports').select('id', { count: 'exact', head: true }),
      count('community_posts', 'status', 'pending'),
      count('reviews', 'status', 'pending'),
    ]);
    payload.reviewNeeded = { communityPending, communityReports: reports ?? 0, reviewsPending };
  } catch {
    // Queues stay zero-labeled; community tab shows the underlying state.
  }

  return NextResponse.json(payload, { status: 200 });
}
