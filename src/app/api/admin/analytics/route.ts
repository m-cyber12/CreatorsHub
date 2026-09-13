import { NextResponse } from 'next/server';
import { isAdminAuthorized } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { ALL_TOOLS } from '@/data/tools';
import { parseIntent } from '@/lib/intent';

export const dynamic = 'force-dynamic';

const WINDOW_DAYS = 30;
const SEARCH_SAMPLE = 500;
const TOOL_VIEW_SAMPLE = 5000;

/** Dashboard headline events — per-event totals come from cheap head counts. */
const HEADLINE_EVENTS = [
  'tool_view',
  'advisor_completed',
  'comparison_saved',
  'comparison_opened',
  'compare_opened',
  'stack_created',
  'stack_saved',
  'workflow_opened',
  'workflow_saved',
  'workflow_duplicated',
  'tool_saved',
  'saved_tool_revisited',
  'updates_visit',
  'updates_return_visit',
  'question_created',
  'answer_created',
  'helpful_vote',
] as const;

interface IntentTally {
  searches: number;
  budget: number;
  free: number;
  cheap: number;
  versus: number;
  stack: number;
  outcome: number;
  noSignal: number;
  topOutcomes: { slug: string; count: number }[];
}

/**
 * GET /api/admin/analytics — activity dashboard payload (P4).
 *
 * Aggregates first-party data only: analytics_events (beacon), search_log,
 * and server-side intent parsing of recent searches. Every section degrades
 * to an empty, labeled shape when Supabase or a table is missing — the UI
 * tells the admin exactly what to run (migration 0020) instead of guessing.
 */
export async function GET() {
  if (!(await isAdminAuthorized())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const since = new Date(Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const emptyIntent: IntentTally = {
    searches: 0, budget: 0, free: 0, cheap: 0, versus: 0, stack: 0, outcome: 0, noSignal: 0, topOutcomes: [],
  };
  const payload = {
    configured: Boolean(supabaseAdmin),
    eventsAvailable: false,
    searchesAvailable: false,
    windowDays: WINDOW_DAYS,
    events: { totals30d: {} as Record<string, number>, daily: [] as { day: string; event: string; total: number }[] },
    searches: {
      total30d: 0,
      top: [] as { query: string; searches: number; zeroResultHits: number; lastSearched: string }[],
      zeroResult: [] as { query: string; searches: number; lastSearched: string }[],
    },
    intent: emptyIntent as IntentTally,
    tools: { total30d: 0, truncated: false, top: [] as { slug: string; name: string; views: number }[] },
  };

  if (!supabaseAdmin) return NextResponse.json(payload, { status: 200 });
  const db = supabaseAdmin;

  // ── Events (analytics_daily view from migration 0020) ──
  try {
    const { data: daily, error: dailyError } = await db
      .from('analytics_daily')
      .select('day, event, total')
      .limit(2000);
    if (!dailyError && daily) {
      payload.eventsAvailable = true;
      const rows = daily as { day: string; event: string; total: number }[];
      payload.events.daily = rows
        .map((r) => ({ day: String(r.day).slice(0, 10), event: r.event, total: Number(r.total) }))
        .sort((a, b) => (a.day < b.day ? 1 : a.day > b.day ? -1 : b.total - a.total));
      const totals: Record<string, number> = {};
      for (const r of payload.events.daily) totals[r.event] = (totals[r.event] ?? 0) + r.total;
      payload.events.totals30d = totals;
    }
  } catch {
    // View/table missing — eventsAvailable stays false, UI shows the fix.
  }

  // ── Searches (search_log + search_trends view from migration 0004) ──
  try {
    const { count: total30d } = await db
      .from('search_log')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', since);
    payload.searches.total30d = total30d ?? 0;
    payload.searchesAvailable = true;

    const { data: trends } = await db.from('search_trends').select('*').limit(20);
    if (trends) {
      payload.searches.top = (trends as { query: string; searches: number; zero_result_hits: number; last_searched: string }[]).map(
        (r) => ({
          query: r.query,
          searches: Number(r.searches),
          zeroResultHits: Number(r.zero_result_hits),
          lastSearched: r.last_searched,
        })
      );
    }

    // Zero-result queries, including one-offs the trends view excludes.
    const { data: zeroRows } = await db
      .from('search_log')
      .select('query, created_at')
      .eq('results', 0)
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(500);
    if (zeroRows) {
      const tally = new Map<string, { searches: number; lastSearched: string }>();
      for (const r of zeroRows as { query: string; created_at: string }[]) {
        const q = r.query.trim().toLowerCase().slice(0, 80);
        if (q.length < 2) continue;
        const prev = tally.get(q);
        if (prev) prev.searches += 1;
        else tally.set(q, { searches: 1, lastSearched: r.created_at });
      }
      payload.searches.zeroResult = [...tally.entries()]
        .map(([query, v]) => ({ query, ...v }))
        .sort((a, b) => b.searches - a.searches)
        .slice(0, 20);
    }
  } catch {
    payload.searchesAvailable = false;
  }

  // ── Intent breakdown: parse recent searches server-side (no schema change) ──
  try {
    const { data: recent } = await db
      .from('search_log')
      .select('query')
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(SEARCH_SAMPLE);
    if (recent) {
      const tally: IntentTally = { ...emptyIntent, topOutcomes: [] };
      const outcomeCounts = new Map<string, number>();
      for (const r of recent as { query: string }[]) {
        const q = String(r.query ?? '').slice(0, 80);
        if (!q.trim()) continue;
        tally.searches += 1;
        const intent = parseIntent(q, ALL_TOOLS);
        let signaled = false;
        if (intent.priceCap) { tally.budget += 1; signaled = true; }
        if (intent.freeOnly) { tally.free += 1; signaled = true; }
        if (intent.cheapFirst) { tally.cheap += 1; signaled = true; }
        if (intent.versus) { tally.versus += 1; signaled = true; }
        if (intent.stackIntent) { tally.stack += 1; signaled = true; }
        if (intent.outcomes.length > 0) {
          tally.outcome += 1;
          signaled = true;
          for (const o of intent.outcomes) outcomeCounts.set(o.slug, (outcomeCounts.get(o.slug) ?? 0) + 1);
        }
        if (!signaled) tally.noSignal += 1;
      }
      tally.topOutcomes = [...outcomeCounts.entries()]
        .map(([slug, count]) => ({ slug, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);
      payload.intent = tally;
    }
  } catch {
    // Intent stays empty — searches section already reports availability.
  }

  // ── Top viewed tools (tool_view props carry the slug) ──
  if (payload.eventsAvailable) {
    try {
      const { data: views } = await db
        .from('analytics_events')
        .select('props')
        .eq('event', 'tool_view')
        .gte('created_at', since)
        .limit(TOOL_VIEW_SAMPLE);
      if (views) {
        payload.tools.truncated = views.length >= TOOL_VIEW_SAMPLE;
        const names = new Map(ALL_TOOLS.map((t) => [t.slug, t.name]));
        const counts = new Map<string, number>();
        for (const v of views as { props: { slug?: unknown } }[]) {
          const slug = v.props?.slug;
          if (typeof slug !== 'string' || !slug) continue;
          counts.set(slug, (counts.get(slug) ?? 0) + 1);
        }
        payload.tools.total30d = [...counts.values()].reduce((a, b) => a + b, 0);
        payload.tools.top = [...counts.entries()]
          .map(([slug, viewCount]) => ({ slug, name: names.get(slug) ?? slug, views: viewCount }))
          .sort((a, b) => b.views - a.views)
          .slice(0, 15);
      }
    } catch {
      // Tools stay empty.
    }
  }

  // Headline row, in dashboard order — every event present, zeros included,
  // so the UI never has to guess which metrics exist.
  const headlines = HEADLINE_EVENTS.map((event) => ({
    event,
    total: payload.events.totals30d[event] ?? 0,
  }));

  return NextResponse.json({ ...payload, headlines }, { status: 200 });
}
