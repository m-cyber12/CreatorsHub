import { describe, it, expect } from 'vitest';
import { computeStackHealth, resolveStackTools, REAL_CATEGORIES, type StackHealthInput } from '../src/lib/stackHealth';

const empty: StackHealthInput = {
  savedToolSlugs: [],
  savedStacks: [],
  savedWorkflows: [],
  savedPlanCount: 0,
};

describe('stackHealth', () => {
  it('exposes 17 real categories (no "All")', () => {
    expect(REAL_CATEGORIES).toHaveLength(17);
    expect(REAL_CATEGORIES).not.toContain('All');
  });

  it('returns zeros for an empty stack', () => {
    const h = computeStackHealth(empty);
    expect(h.tools).toHaveLength(0);
    expect(h.monthlyCost).toBe(0);
    expect(h.coverage).toBe(0);
    expect(h.redundancy).toBe(0);
    expect(h.maturity).toBe(0);
    expect(h.categoriesCovered).toHaveLength(0);
    expect(h.gapCategories).toHaveLength(17);
    // Even an empty stack gets recommendations to fill gaps.
    expect(h.recommended.length).toBeGreaterThan(0);
    expect(h.recommended.length).toBeLessThanOrEqual(4);
    for (const rec of h.recommended) {
      expect(rec.category).toBe(rec.tool.category);
    }
  });

  it('dedupes tools and sums monthly cost using the platform cost convention', () => {
    const h = computeStackHealth({
      ...empty,
      savedToolSlugs: ['opusclip', 'opusclip', 'munch', 'runway', 'elevenlabs', 'canva', 'vidiq'],
    });
    // opusclip counted once; vidiq is Freemium ("Free ($10/mo Pro)") → counted at the Pro price.
    expect(h.tools).toHaveLength(6);
    expect(h.monthlyCost).toBeCloseTo(15 + 49 + 15 + 5 + 12.99 + 10, 2);
  });

  it('flags redundant categories and computes redundancy share', () => {
    const h = computeStackHealth({
      ...empty,
      savedToolSlugs: ['opusclip', 'munch', 'runway', 'elevenlabs', 'canva', 'vidiq'],
    });
    expect(h.redundantGroups).toHaveLength(1);
    expect(h.redundantGroups[0].category).toBe('Video Repurposing');
    expect(h.redundantGroups[0].tools.map((t) => t.slug).sort()).toEqual(['munch', 'opusclip']);
    // 2 of 6 tools overlap.
    expect(h.redundancy).toBe(33);
    expect(h.coverage).toBe(Math.round((5 / 17) * 100));
  });

  it('computes maturity from workflows, stacks, plans and saved tools', () => {
    expect(computeStackHealth(empty).maturity).toBe(0);
    const withAll: StackHealthInput = {
      savedToolSlugs: ['opusclip', 'munch', 'runway', 'elevenlabs', 'canva'],
      savedStacks: [{ picks: { 0: 'descript' } }],
      savedWorkflows: [{ slug: 'podcast-to-shorts', picks: {} }],
      savedPlanCount: 1,
    };
    expect(computeStackHealth(withAll).maturity).toBe(100);

    // The workflow alone resolves 5 tools → workflows(40) + ≥5 tools(15).
    const onlyWorkflow: StackHealthInput = { ...empty, savedWorkflows: [{ slug: 'podcast-to-shorts', picks: {} }] };
    expect(computeStackHealth(onlyWorkflow).maturity).toBe(55);
  });

  it('resolves workflow tools from template primaries and per-node overrides', () => {
    // podcast-to-shorts primaries: descript, opusclip, capcut, captions, tubebuddy (qa is manual).
    const base = resolveStackTools({ ...empty, savedWorkflows: [{ slug: 'podcast-to-shorts', picks: {} }] });
    for (const slug of ['descript', 'opusclip', 'capcut', 'captions', 'tubebuddy']) {
      expect(base).toContain(slug);
    }
    expect(base).toHaveLength(5);

    // Overriding the highlights node swaps opusclip for munch.
    const overridden = resolveStackTools({
      ...empty,
      savedWorkflows: [{ slug: 'podcast-to-shorts', picks: { highlights: 'munch' } }],
    });
    expect(overridden).toContain('munch');
    expect(overridden).not.toContain('opusclip');
    expect(overridden).toHaveLength(5);
  });

  it('ignores empty stack slots and unknown slugs', () => {
    const slugs = resolveStackTools({
      ...empty,
      savedToolSlugs: ['', 'not-a-real-tool'],
      savedStacks: [{ picks: { 0: '', 1: 'elevenlabs' } }],
    });
    expect(slugs).toEqual(['elevenlabs']);
  });

  it('ignores saved workflows with unknown slugs', () => {
    const slugs = resolveStackTools({
      ...empty,
      savedWorkflows: [{ slug: 'does-not-exist', picks: {} }],
    });
    expect(slugs).toHaveLength(0);
  });

  it('recommends tools only for uncovered categories', () => {
    const h = computeStackHealth({ ...empty, savedToolSlugs: ['opusclip', 'munch'] });
    expect(h.gapCategories).not.toContain('Video Repurposing');
    for (const rec of h.recommended) {
      expect(h.gapCategories).toContain(rec.category);
    }
    // Both saved tools are Video Repurposing, so the group is redundant.
    expect(h.redundancy).toBe(100);
  });
});
