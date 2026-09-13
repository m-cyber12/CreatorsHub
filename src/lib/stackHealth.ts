import { ALL_TOOLS, CATEGORIES, type Tool } from '@/data/tools';
import { getWorkflow, workflowNodeCost } from '@/data/workflows';

/**
 * Personal Dashboard (roadmap §42 #12 / Phase 18 "Stack Health").
 *
 * Pure, deterministic computation over the user's locally-saved data:
 * bookmarks (slugs), saved stacks (index → slug picks), saved workflows
 * (nodeId → slug overrides on top of the template's primary tools).
 * No backend, no randomness — the same saved data always yields the same
 * numbers, which keeps the dashboard honest and SSR-safe (it only ever
 * renders after hydration, from localStorage).
 */

export interface StackHealthInput {
  /** Tool slugs from bookmarks. */
  savedToolSlugs: string[];
  /** Saved stacks: `picks` maps stage index → tool slug ('' = empty slot). */
  savedStacks: Array<{ picks: Record<number, string> }>;
  /** Saved workflows: `picks` maps nodeId → override slug; absent = template primary. */
  savedWorkflows: Array<{ slug: string; picks: Record<string, string> }>;
  /** Number of saved advisor plans. */
  savedPlanCount: number;
}

export interface RedundantGroup {
  category: string;
  tools: Array<{ slug: string; name: string }>;
}

export interface GapRecommendation {
  category: string;
  tool: Tool;
}

export interface StackHealth {
  /** Unique catalog tools across bookmarks + stacks + workflows. */
  tools: Tool[];
  /** Sum of monthly costs (platform cost convention: Free→0, one-time excluded, $/yr→/12). */
  monthlyCost: number;
  /** Covered categories in canonical CATEGORIES order. */
  categoriesCovered: string[];
  totalCategories: number;
  /** 0–100: share of the 17 categories covered. */
  coverage: number;
  /** 0–100: share of the user's tools that sit in a category with ≥2 of their tools. */
  redundancy: number;
  /** Categories where the user has 2+ tools (sorted by group size desc). */
  redundantGroups: RedundantGroup[];
  /** 0–100: workflows 40 + stacks 25 + advisor plans 20 + ≥5 saved tools 15. */
  maturity: number;
  maturityFlags: {
    hasWorkflows: boolean;
    hasStacks: boolean;
    hasPlans: boolean;
    hasSavedTools: boolean;
  };
  /** Categories the system doesn't cover yet, in canonical order. */
  gapCategories: string[];
  /** Best catalog tool for up to 4 gap categories. */
  recommended: GapRecommendation[];
}

export const REAL_CATEGORIES: string[] = CATEGORIES.filter((c) => c !== 'All');

/** Union of every tool slug the user has committed to, validated against the catalog. */
export function resolveStackTools(input: StackHealthInput): string[] {
  const slugs = new Set<string>();

  for (const s of input.savedToolSlugs ?? []) if (s) slugs.add(s);

  for (const stack of input.savedStacks ?? []) {
    for (const v of Object.values(stack.picks ?? {})) if (v) slugs.add(v);
  }

  for (const wf of input.savedWorkflows ?? []) {
    const template = getWorkflow(wf.slug);
    if (!template) continue;
    for (const node of template.nodes) {
      const slug = wf.picks?.[node.id] ?? node.tool;
      if (slug) slugs.add(slug);
    }
  }

  return [...slugs].filter((s) => ALL_TOOLS.some((t) => t.slug === s));
}

function pickBestInCategory(category: string): Tool | undefined {
  const pool = ALL_TOOLS.filter((t) => t.category === category);
  if (pool.length === 0) return undefined;
  return [...pool].sort((a, b) =>
    Number(b.isEditorsChoice) - Number(a.isEditorsChoice) ||
    Number(b.isFeatured) - Number(a.isFeatured) ||
    b.rating - a.rating ||
    b.reviewsCount - a.reviewsCount
  )[0];
}

export function computeStackHealth(input: StackHealthInput): StackHealth {
  const tools = resolveStackTools(input)
    .map((s) => ALL_TOOLS.find((t) => t.slug === s))
    .filter((t): t is Tool => Boolean(t));

  const monthlyCost =
    Math.round(tools.reduce((sum, t) => sum + workflowNodeCost(t.slug), 0) * 100) / 100;

  const byCategory = new Map<string, Tool[]>();
  for (const t of tools) {
    const arr = byCategory.get(t.category) ?? [];
    arr.push(t);
    byCategory.set(t.category, arr);
  }

  const categoriesCovered = REAL_CATEGORIES.filter((c) => byCategory.has(c));
  const coverage =
    tools.length > 0 ? Math.round((categoriesCovered.length / REAL_CATEGORIES.length) * 100) : 0;

  const redundantGroups: RedundantGroup[] = [...byCategory.entries()]
    .filter(([, ts]) => ts.length >= 2)
    .map(([category, ts]) => ({
      category,
      tools: ts.map((t) => ({ slug: t.slug, name: t.name })),
    }))
    .sort((a, b) => b.tools.length - a.tools.length);

  const redundancy =
    tools.length > 0
      ? Math.round(
          (tools.filter((t) => (byCategory.get(t.category)?.length ?? 0) >= 2).length /
            tools.length) *
            100
        )
      : 0;

  const maturityFlags = {
    hasWorkflows: (input.savedWorkflows?.length ?? 0) > 0,
    hasStacks: (input.savedStacks?.length ?? 0) > 0,
    hasPlans: (input.savedPlanCount ?? 0) > 0,
    hasSavedTools: tools.length >= 5,
  };
  const maturity = Math.min(
    100,
    (maturityFlags.hasWorkflows ? 40 : 0) +
      (maturityFlags.hasStacks ? 25 : 0) +
      (maturityFlags.hasPlans ? 20 : 0) +
      (maturityFlags.hasSavedTools ? 15 : 0)
  );

  const gapCategories = REAL_CATEGORIES.filter((c) => !byCategory.has(c));
  const recommended: GapRecommendation[] = gapCategories
    .map((category) => {
      const tool = pickBestInCategory(category);
      return tool ? { category, tool } : null;
    })
    .filter((x): x is GapRecommendation => Boolean(x))
    .slice(0, 4);

  return {
    tools,
    monthlyCost,
    categoriesCovered,
    totalCategories: REAL_CATEGORIES.length,
    coverage,
    redundancy,
    redundantGroups,
    maturity,
    maturityFlags,
    gapCategories,
    recommended,
  };
}
