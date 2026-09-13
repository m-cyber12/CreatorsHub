/**
 * NOXIFERA benchmark scoring weights — THE single source of truth.
 *
 * Trust fix (2026-09): the Methodology page, the Benchmark Lab page, and the
 * `computeOverall()` scoring function each hardcoded their own weights, and
 * they disagreed (Speed 20 / Ease 15 vs. Speed 15 / Ease 20). Every consumer
 * below must import from this module — never re-declare weights inline:
 *
 *   - src/data/tools.ts → computeOverall()
 *   - src/data/benchmarks.ts → BENCHMARK_WEIGHTS
 *   - src/app/[locale]/methodology/page.tsx → rubric table
 *   - src/app/[locale]/benchmark/page.tsx → scoring section
 *   - src/components/ScoreBreakdown.tsx → per-dimension display
 *
 * Canonical weights (product decision, 2026-09-13):
 *
 *   Output Quality:  35%
 *   Speed:           20%
 *   Value for Money: 20%
 *   Ease of Use:     15%
 *   Export Freedom:  10%
 *
 * Guarded by tests/benchmark-weights.test.ts — CI fails on any divergence.
 */

export type BenchmarkDimensionKey =
  | 'outputQuality'
  | 'speed'
  | 'valueForMoney'
  | 'easeOfUse'
  | 'exportFreedom';

/** Canonical per-dimension weights as fractions. Must sum to exactly 1. */
export const BENCHMARK_WEIGHTS: Record<BenchmarkDimensionKey, number> = {
  outputQuality: 0.35,
  speed: 0.2,
  valueForMoney: 0.2,
  easeOfUse: 0.15,
  exportFreedom: 0.1,
} as const;

export interface BenchmarkDimension {
  key: BenchmarkDimensionKey;
  /** Short metric id used by src/data/benchmarks.ts. */
  metric: 'quality' | 'speed' | 'value' | 'ease' | 'export';
  /** Key inside ToolScores (src/data/tools.ts). */
  scoreKey: BenchmarkDimensionKey;
  label: string;
  /** Whole percent, e.g. 35. */
  percent: number;
  description: string;
}

/** Ordered dimensions for rubric/scoring UI. Order = display order. */
export const BENCHMARK_DIMENSIONS: BenchmarkDimension[] = [
  {
    key: 'outputQuality',
    metric: 'quality',
    scoreKey: 'outputQuality',
    label: 'Output Quality',
    percent: 35,
    description:
      'Resolution fidelity, temporal consistency, artifacting, lip-sync accuracy, caption correctness, and professional finish.',
  },
  {
    key: 'speed',
    metric: 'speed',
    scoreKey: 'speed',
    label: 'Speed',
    percent: 20,
    description:
      'Wall-clock time from prompt/upload to downloadable file. Measured on a standard consumer connection (100 Mbps).',
  },
  {
    key: 'valueForMoney',
    metric: 'value',
    scoreKey: 'valueForMoney',
    label: 'Value for Money',
    percent: 20,
    description:
      'Cost per usable output, free-tier generosity, credit expiry policies, and hidden upsells.',
  },
  {
    key: 'easeOfUse',
    metric: 'ease',
    scoreKey: 'easeOfUse',
    label: 'Ease of Use',
    percent: 15,
    description:
      'Onboarding friction, UI clarity, documentation quality, and error message helpfulness.',
  },
  {
    key: 'exportFreedom',
    metric: 'export',
    scoreKey: 'exportFreedom',
    label: 'Export Freedom',
    percent: 10,
    description:
      'Watermark status, commercial rights, resolution caps, format options, and API availability.',
  },
];

/** Weighted overall score, 0–10, one decimal. Never hand-authored. */
export function computeWeightedOverall(
  scores: Record<BenchmarkDimensionKey, number>
): number {
  const weighted =
    scores.outputQuality * BENCHMARK_WEIGHTS.outputQuality +
    scores.speed * BENCHMARK_WEIGHTS.speed +
    scores.valueForMoney * BENCHMARK_WEIGHTS.valueForMoney +
    scores.easeOfUse * BENCHMARK_WEIGHTS.easeOfUse +
    scores.exportFreedom * BENCHMARK_WEIGHTS.exportFreedom;
  return Math.round(weighted * 10) / 10;
}

/** '35%' style label for a dimension. */
export function weightLabel(key: BenchmarkDimensionKey): string {
  return `${Math.round(BENCHMARK_WEIGHTS[key] * 100)}%`;
}
