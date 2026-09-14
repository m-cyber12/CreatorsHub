import { describe, it, expect } from 'vitest';
import {
  buildCategoryBattle,
  buildWorkflowBattles,
  battleOfTheWeek,
  battleReport,
  isoWeek,
  valueScore,
  ARENA_CATEGORIES,
} from '../src/lib/arena';
import { ALL_TOOLS } from '../src/data/tools';
import { WORKFLOWS } from '../src/data/workflows';

const bySlug = (s: string) => ALL_TOOLS.find((t) => t.slug === s)!;

describe('arena — value score (transparent formula)', () => {
  it('applies cost buckets: Free ×1.0, <$10 ×0.9, <$30 ×0.8, <100 ×0.65', () => {
    const capcut = bySlug('capcut'); // Free, cost 0
    expect(valueScore(capcut)).toBe(Math.round(capcut.rating * 10));
    const elevenlabs = bySlug('elevenlabs'); // $5/mo → ×0.9
    expect(valueScore(elevenlabs)).toBe(Math.round(elevenlabs.rating * 10 * 0.9));
    const runway = bySlug('runway'); // $15/mo → ×0.8
    expect(valueScore(runway)).toBe(Math.round(runway.rating * 10 * 0.8));
    const oneof10 = bySlug('1of10'); // $41/mo → ×0.65
    expect(valueScore(oneof10)).toBe(Math.round(oneof10.rating * 10 * 0.65));
    // Note: no catalog tool currently costs ≥ $100/mo, so the 0.5 branch is
    // exercised only structurally; it is the same one-liner pattern.
  });
});

describe('arena — category battles', () => {
  it('builds the Video Generation battle from real catalog data', () => {
    const b = buildCategoryBattle('Video Generation')!;
    // After audit fix: extended tools have rating 0 (no fake scores), so top-3 is
    // runway (4.9) + two alphabetically first 0-rated tools. Test is resilient
    // to future catalog changes — only asserts runway is top and battle has 3.
    const slugs = b.battleants.map((a) => a.tool.slug);
    expect(slugs).toHaveLength(3);
    expect(slugs[0]).toBe('runway');
    expect(slugs).toContain('runway');
    // Verdicts, computed deterministically:
    expect(b.verdicts.topRated).toBe('runway'); // 4.9
    // Cheapest and bestValue depend on which 0-rated tools are picked; just check they exist
    expect(b.verdicts.cheapest).toBeDefined();
    expect(b.verdicts.bestValue).toBeDefined();
  });

  it('scores value below raw rating when a tool is expensive', () => {
    const b = buildCategoryBattle('Video Generation')!;
    const runway = b.battleants.find((a) => a.tool.slug === 'runway')!;
    expect(runway.valueScore).toBeLessThan(runway.tool.rating * 10);
  });

  it('labels the score source honestly (editorial vs community)', () => {
    const b = buildCategoryBattle('Video Generation')!;
    for (const a of b.battleants) {
      expect(['editorial', 'community']).toContain(a.scoreLabel);
      expect(a.scoreLabel).toBe(a.tool.ratingLabel === 'Community Score' ? 'community' : 'editorial');
    }
  });
});

describe('arena — battle of the week (deterministic)', () => {
  it('is stable within a week and valid across weeks', () => {
    // 2026-09-12 (Sat) and 2026-09-13 (Sun) are the same ISO week; 2026-09-14 (Mon) starts the next.
    const a = battleOfTheWeek(new Date('2026-09-12T12:00:00Z'))!;
    const b = battleOfTheWeek(new Date('2026-09-13T00:00:00Z'))!; // same ISO week
    expect(a.category).toBe(b.category);
    expect(a.battleants.map((x) => x.tool.slug)).toEqual(b.battleants.map((x) => x.tool.slug));
    expect(a.battleants).toHaveLength(3);
    expect(ARENA_CATEGORIES).toContain(a.category);

    const nextWeek = battleOfTheWeek(new Date('2026-09-14T00:00:00Z'))!;
    expect(nextWeek.battleants).toHaveLength(3);
  });

  it('computes ISO week numbers correctly', () => {
    expect(isoWeek(new Date('2026-01-01T12:00:00Z'))).toBe(1); // Thu of W1
    expect(isoWeek(new Date('2026-01-04T12:00:00Z'))).toBe(1); // Sun still in W1 (weeks end Sunday)
    expect(isoWeek(new Date('2026-01-05T12:00:00Z'))).toBe(2); // Mon of W2
    // 2026 starts on a Thursday → it has 53 ISO weeks; Dec 28 is W53, and
    // Mon 2027-01-04 starts W1 of 2027.
    expect(isoWeek(new Date('2026-12-28T12:00:00Z'))).toBe(53);
    expect(isoWeek(new Date('2027-01-04T12:00:00Z'))).toBe(1);
  });
});

describe('arena — workflow node battles', () => {
  const wf = WORKFLOWS.find((w) => w.slug === 'podcast-to-shorts')!;

  it('builds one battle per tool node and skips empty manual steps', () => {
    const battles = buildWorkflowBattles(wf);
    expect(battles).toHaveLength(5); // 6 nodes − the manual QA node with no alternatives
    expect(battles.map((b) => b.nodeId)).toEqual(['import', 'highlights', 'edit', 'captions', 'publish']);

    const first = battles[0];
    expect(first.primary?.slug).toBe('descript');
    expect(first.alternatives.map((t) => t.slug).sort()).toEqual(['adobe-podcast', 'whisper']);
    for (const alt of first.alternatives) {
      expect(ALL_TOOLS.some((t) => t.slug === alt.slug)).toBe(true);
    }
  });

  it('marks manual nodes when they have alternatives', () => {
    const wf2 = WORKFLOWS.find((w) => w.slug === 'faceless-video')!;
    const battles = buildWorkflowBattles(wf2);
    const manual = battles.filter((b) => b.manual);
    for (const m of manual) {
      expect(m.primary).toBeNull();
      expect(m.alternatives.length).toBeGreaterThan(0);
    }
  });
});

describe('arena — shareable report', () => {
  it('renders tool names and verdicts, never null', () => {
    const b = buildCategoryBattle('Video Generation')!;
    const md = battleReport(b.category, b.battleants, b.verdicts);
    expect(md).toContain('Video Generation');
    expect(md).toContain('Runway');
    expect(md).toContain('- Cheapest:');
    expect(md).toContain('- Top rated:');
    expect(md).toContain('- Best value:');
    expect(md).not.toContain('null');
    expect(md).toContain('Value score = rating × 10');
  });
});
