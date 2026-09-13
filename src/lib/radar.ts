import type { Tool } from '@/data/tools';
import { ALL_TOOLS } from '@/data/tools';
import type { WorkflowTemplate } from '@/data/workflows';
import { WORKFLOWS, workflowMinutes } from '@/data/workflows';

/**
 * Personal AI Radar (roadmap §42 #13 / Phase 8) — the retention feature.
 *
 * Users follow categories, tools and workflows. The radar feed is computed
 * from that follow list plus the catalog's editorial signals:
 *
 *   - new tools    → `isNew` flag (editorial "new to the platform")
 *   - trending     → `isTrending` flag
 *   - price watch  → current catalog pricing/verification for followed tools
 *   - workflows    → followed workflow templates
 *
 * Honesty rules (no fake signals):
 *   - There is no price history in the catalog, so the radar never claims
 *     "price changed" — it only shows the current verified price.
 *   - There is no community yet, so no "discussions" section.
 *   - `testedAt`/`descriptionUpdatedAt` are not selective signals in the
 *     current data, so they are not used as feed triggers.
 *
 * Pure and deterministic: data and clock are injectable for tests; the same
 * follows + catalog + date always produce the same feed.
 */

export interface RadarFollows {
  categories: string[];
  tools: string[];
  workflows: string[];
}

export const EMPTY_FOLLOWS: RadarFollows = { categories: [], tools: [], workflows: [] };

export interface RadarToolEntry {
  tool: Tool;
  reason: 'new' | 'trending' | 'watch';
}

export interface RadarWorkflowEntry {
  workflow: WorkflowTemplate;
  minutes: number;
}

export interface RadarFeed {
  newTools: RadarToolEntry[];
  trending: RadarToolEntry[];
  watch: RadarToolEntry[];
  workflows: RadarWorkflowEntry[];
  /** True when the user follows ≥1 category, tool or workflow. */
  scoped: boolean;
  totalFollows: number;
}

export const RADAR_FOLLOWS_KEY = 'noxifera_follows';

export const MAX_PER_SECTION = 8;

export function loadFollows(storage: Storage = globalThis.localStorage): RadarFollows {
  try {
    const raw = storage.getItem(RADAR_FOLLOWS_KEY);
    if (!raw) return { ...EMPTY_FOLLOWS };
    const p = JSON.parse(raw) as Partial<RadarFollows>;
    const list = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []);
    return { categories: list(p.categories), tools: list(p.tools), workflows: list(p.workflows) };
  } catch {
    return { ...EMPTY_FOLLOWS };
  }
}

export function saveFollows(follows: RadarFollows, storage: Storage = globalThis.localStorage): void {
  try {
    storage.setItem(RADAR_FOLLOWS_KEY, JSON.stringify(follows));
  } catch {
    /* storage full/blocked — radar degrades to session-only */
  }
}

export function toggleFollow<T extends string>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((x) => x !== value) : [...list, value];
}

/** Deterministic order: rating desc, then name asc. */
function byRatingThenName(a: Tool, b: Tool): number {
  return b.rating - a.rating || a.name.localeCompare(b.name);
}

export function computeRadar(
  follows: RadarFollows,
  now: Date,
  catalog: Tool[] = ALL_TOOLS,
  workflowList: WorkflowTemplate[] = WORKFLOWS
): RadarFeed {
  void now; // clock reserved for future time-windowed signals; unused while flags drive the feed.
  const valid = new Set(catalog.map((t) => t.slug));
  const followedTools = follows.tools.filter((s) => valid.has(s));
  const followedCategories = new Set(follows.categories);
  const scoped = followedTools.length > 0 || followedCategories.size > 0 || follows.workflows.length > 0;

  // New/trending scope = followed categories; no category follows → global
  // digest (the feed is never empty). Followed tools live in their own
  // "watch" section, so they are deliberately excluded here (no duplicates).
  const categoryScoped = followedCategories.size > 0;
  const inScope = (t: Tool) => !categoryScoped || followedCategories.has(t.category);

  const newTools: RadarToolEntry[] = catalog
    .filter((t) => t.isNew && inScope(t))
    .sort(byRatingThenName)
    .slice(0, MAX_PER_SECTION)
    .map((tool) => ({ tool, reason: 'new' as const }));

  const trending: RadarToolEntry[] = catalog
    .filter((t) => t.isTrending && !t.isNew && inScope(t))
    .sort(byRatingThenName)
    .slice(0, MAX_PER_SECTION)
    .map((tool) => ({ tool, reason: 'trending' as const }));

  const watch: RadarToolEntry[] = followedTools
    .map((s) => catalog.find((t) => t.slug === s))
    .filter((t): t is Tool => Boolean(t))
    .sort(byRatingThenName)
    .slice(0, MAX_PER_SECTION)
    .map((tool) => ({ tool, reason: 'watch' as const }));

  const workflows: RadarWorkflowEntry[] = workflowList
    .filter((w) => follows.workflows.includes(w.slug))
    .map((workflow) => ({ workflow, minutes: workflowMinutes(workflow) }));

  return {
    newTools,
    trending,
    watch,
    workflows,
    scoped,
    totalFollows: followedCategories.size + followedTools.length + follows.workflows.length,
  };
}
