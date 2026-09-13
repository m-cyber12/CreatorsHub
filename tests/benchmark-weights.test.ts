import { describe, it, expect } from 'vitest';
import {
  BENCHMARK_WEIGHTS,
  BENCHMARK_DIMENSIONS,
  computeWeightedOverall,
  weightLabel,
} from '@/lib/benchmarkWeights';
import { computeOverall, type ToolScores } from '@/data/tools';
import { BENCHMARK_WEIGHTS as LAB_WEIGHTS, weightedOverall } from '@/data/benchmarks';

/**
 * Canonical benchmark weights — divergence guard.
 *
 * The Methodology page, Benchmark Lab page, and computeOverall() previously
 * hardcoded three different weight sets. All consumers must derive from
 * src/lib/benchmarkWeights.ts; these tests fail CI on any drift.
 */

describe('canonical benchmark weights', () => {
  it('matches the published methodology split (35/20/20/15/10)', () => {
    expect(BENCHMARK_WEIGHTS).toEqual({
      outputQuality: 0.35,
      speed: 0.2,
      valueForMoney: 0.2,
      easeOfUse: 0.15,
      exportFreedom: 0.1,
    });
  });

  it('sums to exactly 1', () => {
    const sum = Object.values(BENCHMARK_WEIGHTS).reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1, 10);
  });

  it('dimensions render in canonical order with matching percents', () => {
    expect(BENCHMARK_DIMENSIONS.map((d) => d.key)).toEqual([
      'outputQuality',
      'speed',
      'valueForMoney',
      'easeOfUse',
      'exportFreedom',
    ]);
    for (const d of BENCHMARK_DIMENSIONS) {
      expect(d.percent).toBe(Math.round(BENCHMARK_WEIGHTS[d.key] * 100));
      expect(weightLabel(d.key)).toBe(`${d.percent}%`);
    }
  });

  it('computeOverall() uses the canonical weights', () => {
    const scores: ToolScores = {
      outputQuality: 8,
      speed: 6,
      valueForMoney: 7,
      easeOfUse: 4,
      exportFreedom: 10,
    };
    // 8*.35 + 6*.2 + 7*.2 + 4*.15 + 10*.1 = 7.0
    expect(computeOverall(scores)).toBe(7.0);
    expect(computeOverall(scores)).toBe(computeWeightedOverall(scores));
  });

  it('benchmark-lab weights mirror the canonical weights', () => {
    expect(LAB_WEIGHTS).toEqual({
      quality: BENCHMARK_WEIGHTS.outputQuality,
      speed: BENCHMARK_WEIGHTS.speed,
      value: BENCHMARK_WEIGHTS.valueForMoney,
      ease: BENCHMARK_WEIGHTS.easeOfUse,
      export: BENCHMARK_WEIGHTS.exportFreedom,
    });
  });

  it('weightedOverall() agrees with computeOverall() on full score sets', () => {
    const lab = { quality: 8, speed: 6, value: 7, ease: 4, export: 10 };
    const tool: ToolScores = {
      outputQuality: 8,
      speed: 6,
      valueForMoney: 7,
      easeOfUse: 4,
      exportFreedom: 10,
    };
    expect(weightedOverall(lab)).toBe(computeOverall(tool));
  });

  it('user-facing overallNote copy states the canonical split in every locale', async () => {
    // The ScoreBreakdown footnote once had speed/ease swapped (20/15) in all
    // 8 locales while the engine used 15/20. The copy lists dimensions in
    // canonical order, so the percentages must appear as 35,20,20,15,10.
    for (const locale of ['en', 'de', 'fr', 'es', 'pt', 'ar', 'fa', 'zh']) {
      const messages = (await import(`../messages/${locale}.json`)).default;
      const note: string = messages.components.scoreBreakdown.overallNote;
      // % (U+0025), ٪ (U+066A Arabic) and ％ (U+FF05 fullwidth) all occur.
      const percents = [...note.matchAll(/(\d+)\s?[%٪％]/g)].map((m) => Number(m[1]));
      expect(percents, `overallNote weights in ${locale}`).toEqual([35, 20, 20, 15, 10]);
    }
  });
});
