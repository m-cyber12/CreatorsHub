import type { Tool } from '@/data/tools';
import { ALL_TOOLS, CATEGORIES } from '@/data/tools';
import type { WorkflowTemplate } from '@/data/workflows';
import { workflowNodeCost } from '@/data/workflows';
import { benchmarksForTool } from '@/data/benchmarks';

/**
 * AI Arena / Tool Battles (roadmap §42 #15 / Phase 7).
 *
 * Head-to-head battles built ONLY from real catalog data:
 *
 *   - Score      → catalog rating, labelled honestly (Editorial vs Community)
 *   - Value      → transparent formula, documented in the UI footnote:
 *                  rating × 10 × cost factor (Free ×1.0, <$10 ×0.9,
 *                  <$30 ×0.8, <$100 ×0.65, ≥$100 ×0.5), on a 0–100 scale
 *   - Lab        → real benchmark result (src/data/benchmarks.ts) when one
 *                  exists; otherwise the UI shows "no lab data yet" — never
 *                  a fabricated number
 *   - Best for   → the tool's editorial `bestFor` statement, verbatim
 *
 * Two battle modes:
 *   - Category battle: top-3 tools of a category (rating, reviews, name)
 *   - Workflow battles: per-node primary tool vs its listed alternatives
 *
 * The Battle of the Week is deterministic: ISO week → category rotation,
 * so every visitor sees the same featured battle for that week (no backend).
 */

export interface Battleant {
  tool: Tool;
  cost: number;
  valueScore: number;
  labScore: number | null;
  scoreLabel: 'editorial' | 'community';
}

export interface Verdicts {
  cheapest?: string;
  topRated?: string;
  bestValue?: string;
  verified?: string;
  freeTier?: string;
}

export interface CategoryBattle {
  category: string;
  battleants: Battleant[];
  verdicts: Verdicts;
}

export interface NodeBattle {
  nodeId: string;
  label: string;
  minutes: number;
  primary: Tool | null;
  manual: boolean;
  alternatives: Tool[];
}

export const ARENA_CATEGORIES: string[] = CATEGORIES.filter((c) => c !== 'All');

export function toolCost(slug: string): number {
  return workflowNodeCost(slug);
}

/** Transparent value formula — see module doc. 0–100. */
export function valueScore(tool: Tool): number {
  const cost = workflowNodeCost(tool.slug);
  const factor = cost <= 0 ? 1 : cost < 10 ? 0.9 : cost < 30 ? 0.8 : cost < 100 ? 0.65 : 0.5;
  return Math.round(tool.rating * 10 * factor);
}

export function toBattleant(tool: Tool): Battleant {
  const lab = benchmarksForTool(tool.slug)[0]?.tools.find((t) => t.slug === tool.slug)?.overall ?? null;
  return {
    tool,
    cost: workflowNodeCost(tool.slug),
    valueScore: valueScore(tool),
    labScore: lab,
    scoreLabel: tool.ratingLabel === 'Community Score' ? 'community' : 'editorial',
  };
}

const byRatingThenReviewsThenName = (a: Tool, b: Tool) =>
  b.rating - a.rating || b.reviewsCount - a.reviewsCount || a.name.localeCompare(b.name);

/** Top-3 battle for a category, with deterministic verdicts. */
export function buildCategoryBattle(category: string, catalog: Tool[] = ALL_TOOLS): CategoryBattle | null {
  const pool = catalog.filter((t) => t.category === category).sort(byRatingThenReviewsThenName).slice(0, 3);
  if (pool.length < 2) return null;

  const battleants = pool.map(toBattleant);
  const firstMax = (key: (a: Battleant) => number) => {
    let best: Battleant | null = null;
    for (const a of battleants) {
      if (!best || key(a) > key(best)) best = a;
    }
    return best ? best.tool.slug : undefined;
  };
  const firstOf = (pred: (a: Battleant) => boolean) =>
    battleants
      .filter(pred)
      .sort((a, b) => byRatingThenReviewsThenName(a.tool, b.tool))[0]?.tool.slug;

  const verdicts: Verdicts = {
    cheapest: firstMax((a) => -a.cost),
    topRated: firstMax((a) => a.tool.rating),
    bestValue: firstMax((a) => a.valueScore),
    verified: firstOf((a) => a.tool.verificationLevel === 'pricing-verified'),
    freeTier: firstOf((a) => a.tool.pricing === 'Free' || a.tool.pricing === 'Freemium' || a.tool.pricing === 'Free Trial'),
  };

  return { category, battleants, verdicts };
}

/** ISO week number (for the deterministic Battle of the Week). */
export function isoWeek(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

/** Same week → same featured battle, for everyone, without a backend. */
export function battleOfTheWeek(now: Date, catalog: Tool[] = ALL_TOOLS): CategoryBattle | null {
  const week = isoWeek(now);
  const category = ARENA_CATEGORIES[week % ARENA_CATEGORIES.length];
  return buildCategoryBattle(category, catalog);
}

/** Per-node battles for a workflow: primary tool vs listed alternatives. */
export function buildWorkflowBattles(wf: WorkflowTemplate, catalog: Tool[] = ALL_TOOLS): NodeBattle[] {
  const find = (slug?: string) => (slug ? catalog.find((t) => t.slug === slug) : undefined);
  const out: NodeBattle[] = [];
  for (const node of wf.nodes) {
    const primary = find(node.tool) ?? null;
    const alternatives = (node.alternatives ?? []).map((s) => find(s)).filter((t): t is Tool => Boolean(t));
    if (!primary && alternatives.length === 0) continue;
    out.push({
      nodeId: node.id,
      label: node.label,
      minutes: node.minutes ?? 0,
      primary,
      manual: Boolean(node.manual),
      alternatives,
    });
  }
  return out;
}

/** Shareable markdown report for a category battle. */
export function battleReport(category: string, battleants: Battleant[], verdicts: Verdicts): string {
  const name = (slug?: string) => battleants.find((a) => a.tool.slug === slug)?.tool.name ?? slug ?? '—';
  const lines = [
    `# Noxifera Arena — ${category}`,
    '',
    ...battleants.map(
      (a, i) =>
        `${i + 1}. **${a.tool.name}** — ${a.tool.pricing}${a.cost > 0 ? ` (from $${a.cost}/mo)` : ''} · score ${a.tool.rating.toFixed(1)} (${a.scoreLabel}) · value ${a.valueScore}/100`
    ),
    '',
    '- Cheapest: ' + name(verdicts.cheapest),
    '- Top rated: ' + name(verdicts.topRated),
    '- Best value: ' + name(verdicts.bestValue),
    verdicts.verified ? '- Price verified: ' + name(verdicts.verified) : null,
    verdicts.freeTier ? '- Free tier: ' + name(verdicts.freeTier) : null,
    '',
    'Value score = rating × 10 × cost factor (Free ×1.0, <$10 ×0.9, <$30 ×0.8, <$100 ×0.65, ≥$100 ×0.5).',
  ];
  return lines.filter((l): l is string => l !== null).join('\n');
}
