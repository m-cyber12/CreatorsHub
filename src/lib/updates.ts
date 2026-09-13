import { GRAVEYARD, type DeadTool } from '@/data/graveyard';
import { BENCHMARK_RESULTS, type BenchmarkResult } from '@/data/benchmarks';
import type { Tool } from '@/data/tools';
import {
  computeAlerts,
  getSavedTools,
  getSavedStacks,
  getSavedWorkflows,
  type SavedTool,
  type SavedStackEntry,
  type SavedWorkflowEntry,
  type WorkspaceAlert,
} from '@/lib/workspace';

/**
 * "What Changed" — the return loop (P1).
 *
 * Two feeds, both deterministic and honest:
 *
 *  1. Catalog feed — dated events derived from committed data only:
 *     newly added tools (isNew + cataloguedAt), verifications with a real
 *     date (testedAt / pricingCheckedAt), retirements (graveyard diedAt),
 *     recorded price changes (price_history rows), benchmark publications.
 *     Undated facts never appear as dated events.
 *
 *  2. Personal feed — for the visitor's own workspace:
 *     a) Open alerts (current-state diffs from saved snapshots — undated,
 *        because we only know they differ *now*, not when it happened).
 *     b) Dated catalog events touching saved tools, stack members, and
 *        workflow tools, grouped per stack where useful.
 *
 * No email, no push, no account. Unread state is a localStorage timestamp.
 */

export type UpdateKind =
  | 'price-changed'
  | 'pricing-model-changed'
  | 'verification-upgraded'
  | 'tool-added'
  | 'tool-retired'
  | 'tool-unlisted'
  | 'benchmark-published';

export const UPDATE_KINDS: UpdateKind[] = [
  'price-changed',
  'pricing-model-changed',
  'verification-upgraded',
  'tool-added',
  'tool-retired',
  'tool-unlisted',
  'benchmark-published',
];

export interface UpdateEvent {
  id: string;
  kind: UpdateKind;
  /** ISO date (day precision is enough; never invent a time). */
  date: string;
  slug?: string;
  toolName: string;
  /** Verbatim detail, e.g. "$15 → $20" or "listed-only → hands-on-tested". */
  detail?: string;
  href: string;
}

export interface PriceChangePoint {
  slug: string;
  toolName: string;
  from: string | null;
  to: string | null;
  date: string;
}

export interface PriceHistoryRow {
  tool_slug: string;
  starting_price: string | null;
  noticed_at: string;
}

/**
 * Pure grouping: newest-first `price_history` rows → one change event per
 * price difference. A change is dated at its DETECTION row (the newer
 * point): the day editors recorded the new price. Equal consecutive
 * prices and single points emit nothing — a change claim always maps to
 * two real recorded rows. Lives here (not in priceChanges.ts) so the
 * vitest suite, which cannot import `server-only` modules, can pin it.
 */
export function extractPriceChanges(
  rows: PriceHistoryRow[],
  names: Map<string, string>,
  limit = 50
): PriceChangePoint[] {
  const seen = new Map<string, { price: string | null; date: string }>();
  const changes: PriceChangePoint[] = [];

  for (const row of rows) {
    const slug = row.tool_slug;
    const price = row.starting_price;
    const prev = seen.get(slug);
    if (!prev) {
      seen.set(slug, { price, date: row.noticed_at.slice(0, 10) });
      continue;
    }
    if (prev.price !== price) {
      changes.push({
        slug,
        toolName: names.get(slug) ?? slug,
        from: price,
        to: prev.price,
        date: prev.date,
      });
      // Keep scanning older rows: a tool may have changed twice.
      seen.set(slug, { price, date: row.noticed_at.slice(0, 10) });
    }
    if (changes.length >= limit) break;
  }
  return changes;
}

const MAX_CATALOG_EVENTS = 120;

function dayOf(iso: string): string {
  return iso.length >= 10 ? iso.slice(0, 10) : iso;
}

/**
 * Dated catalog events, newest first. Every source is optional and
 * empty-safe: with no dated data the feed is honestly empty.
 */
export function buildCatalogUpdates(input: {
  tools: Tool[];
  graveyard?: DeadTool[];
  benchmarks?: BenchmarkResult[];
  priceChanges?: PriceChangePoint[];
}): UpdateEvent[] {
  const { tools, graveyard = GRAVEYARD, benchmarks = BENCHMARK_RESULTS, priceChanges = [] } = input;
  const events: UpdateEvent[] = [];

  for (const t of tools) {
    // "Added" only for editorially-flagged new tools with a real date —
    // bulk-import dates would flood the feed with 161 same-day events.
    if (t.isNew && t.cataloguedAt) {
      events.push({
        id: `tool-added:${t.slug}:${t.cataloguedAt}`,
        kind: 'tool-added',
        date: dayOf(t.cataloguedAt),
        slug: t.slug,
        toolName: t.name,
        detail: t.category,
        href: `/tool/${t.slug}`,
      });
    }
    const verifiedAt = t.testedAt ?? t.pricingCheckedAt;
    if (t.verificationLevel !== 'listed-only' && verifiedAt) {
      events.push({
        id: `verification-upgraded:${t.slug}:${dayOf(verifiedAt)}`,
        kind: 'verification-upgraded',
        date: dayOf(verifiedAt),
        slug: t.slug,
        toolName: t.name,
        detail: t.verificationLevel,
        href: `/tool/${t.slug}`,
      });
    }
  }

  for (const g of graveyard) {
    events.push({
      id: `tool-retired:${g.slug}:${g.diedAt}`,
      kind: 'tool-retired',
      date: dayOf(g.diedAt),
      slug: g.slug,
      toolName: g.name,
      detail: g.cause,
      href: '/graveyard',
    });
  }

  for (const b of benchmarks) {
    const names = b.tools.map((r) => r.slug).join(', ');
    events.push({
      id: `benchmark-published:${b.id}:${b.date}`,
      kind: 'benchmark-published',
      date: dayOf(b.date),
      toolName: b.title,
      detail: names,
      href: '/benchmark',
    });
  }

  for (const p of priceChanges) {
    events.push({
      id: `price-changed:${p.slug}:${p.date}:${p.from ?? ''}:${p.to ?? ''}`,
      kind: 'price-changed',
      date: dayOf(p.date),
      slug: p.slug,
      toolName: p.toolName,
      detail: `${p.from ?? '—'} → ${p.to ?? '—'}`,
      href: `/tool/${p.slug}`,
    });
  }

  events.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.id < b.id ? -1 : 1));
  return events.slice(0, MAX_CATALOG_EVENTS);
}

/** Tool slugs a workflow actually uses (custom steps + playbook picks). */
export function workflowToolSlugs(w: SavedWorkflowEntry): string[] {
  const out = new Set<string>();
  for (const s of Object.values(w.picks ?? {})) {
    if (typeof s === 'string' && s) out.add(s);
  }
  for (const step of w.steps ?? []) {
    if (step.toolSlug) out.add(step.toolSlug);
  }
  return [...out];
}

/** Tool slugs in a stack, in position order. */
export function stackToolSlugs(s: SavedStackEntry): string[] {
  return Object.keys(s.picks ?? {})
    .map(Number)
    .filter((n) => Number.isFinite(n))
    .sort((a, b) => a - b)
    .map((n) => s.picks[n])
    .filter((v): v is string => typeof v === 'string' && v.length > 0);
}

export interface StackUpdateGroup {
  stackId: string;
  stackName: string;
  events: UpdateEvent[];
}

export interface PersonalUpdates {
  /** Current-state diffs (undated by construction). */
  openAlerts: WorkspaceAlert[];
  /** Dated catalog events touching anything in the workspace. */
  toolEvents: UpdateEvent[];
  /** Dated events grouped by stack membership. */
  stackGroups: StackUpdateGroup[];
  savedTools: SavedTool[];
}

export function buildPersonalUpdates(
  catalogEvents: UpdateEvent[],
  storage?: Storage | null
): PersonalUpdates {
  // `undefined` falls through to the workspace safeStorage(); explicit null
  // (SSR) behaves the same because safeStorage() returns null off-browser.
  const store = storage ?? undefined;
  const saved = getSavedTools(store);
  const stacks = getSavedStacks(store);
  const workflows = getSavedWorkflows(store);

  const openAlerts = computeAlerts(saved);

  const watched = new Set<string>(saved.map((s) => s.slug));
  for (const st of stacks) for (const slug of stackToolSlugs(st)) watched.add(slug);
  for (const w of workflows) for (const slug of workflowToolSlugs(w)) watched.add(slug);

  const toolEvents = catalogEvents.filter((e) => {
    if (e.slug && watched.has(e.slug)) return true;
    // Benchmark publications name slugs in `detail` ("slug, slug").
    if (e.kind === 'benchmark-published' && e.detail) {
      return e.detail.split(',').map((s) => s.trim()).some((s) => watched.has(s));
    }
    return false;
  });

  const stackGroups: StackUpdateGroup[] = [];
  for (const st of stacks) {
    const members = new Set(stackToolSlugs(st));
    if (members.size === 0) continue;
    const events = catalogEvents.filter((e) => e.slug && members.has(e.slug));
    if (events.length > 0) stackGroups.push({ stackId: st.id, stackName: st.name, events });
  }

  return { openAlerts, toolEvents, stackGroups, savedTools: saved };
}

/* ── Read state (local-first) ─────────────────────────────────────────── */

const LAST_SEEN_KEY = 'noxifera_updates_seen';

export function getUpdatesLastSeen(storage: Storage | null = null): string | null {
  try {
    const s = storage ?? (typeof localStorage !== 'undefined' ? localStorage : null);
    return s?.getItem(LAST_SEEN_KEY) ?? null;
  } catch {
    return null;
  }
}

export function setUpdatesLastSeen(when: string = new Date().toISOString(), storage: Storage | null = null): void {
  try {
    const s = storage ?? (typeof localStorage !== 'undefined' ? localStorage : null);
    s?.setItem(LAST_SEEN_KEY, when);
  } catch {
    // private mode — read state simply doesn't persist
  }
}

/** Dated events strictly newer than the last visit (day precision). */
export function countUnread(events: UpdateEvent[], lastSeen: string | null): number {
  if (!lastSeen) return events.length;
  const day = dayOf(lastSeen);
  return events.filter((e) => e.date > day).length;
}
