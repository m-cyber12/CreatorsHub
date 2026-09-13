/**
 * Benchmark Lab results (roadmap §42 #14 / Phase 6).
 *
 * HARD RULE (roadmap "Important"): Do not publish fake precision.
 * `BENCHMARK_RESULTS` must contain REAL, hands-on test results only.
 * While it is empty, /benchmark renders its honest "testing has not
 * started" state — no fabricated numbers, ever.
 *
 * When a test is run, add one entry per published benchmark with the full
 * Evidence Pack the roadmap requires. Every tool slug is validated against
 * the catalog by scripts/validate-data.mjs.
 */

import { BENCHMARK_WEIGHTS as CANONICAL_WEIGHTS } from '@/lib/benchmarkWeights';

export const BENCHMARK_METRICS = ['quality', 'speed', 'value', 'ease', 'export'] as const;
export type BenchmarkMetric = (typeof BENCHMARK_METRICS)[number];

/**
 * Public scoring weights — derived from the canonical source
 * (src/lib/benchmarkWeights.ts). Canonical: Quality 35 / Speed 20 /
 * Value 20 / Ease 15 / Export 10. Never edit here; change the source.
 */
export const BENCHMARK_WEIGHTS: Record<BenchmarkMetric, number> = {
  quality: CANONICAL_WEIGHTS.outputQuality,
  speed: CANONICAL_WEIGHTS.speed,
  value: CANONICAL_WEIGHTS.valueForMoney,
  ease: CANONICAL_WEIGHTS.easeOfUse,
  export: CANONICAL_WEIGHTS.exportFreedom,
};

export interface BenchmarkToolResult {
  /** Must exist in the catalog. */
  slug: string;
  /** Model/version used, e.g. "Gen-4 Turbo" — required for reproducibility. */
  modelVersion?: string;
  /** Per-metric scores, 0–10, on the public methodology. */
  scores: Partial<Record<BenchmarkMetric, number>>;
  /** Weighted overall, 0–10, one decimal (never fake precision beyond it). */
  overall: number;
  /** Raw output, if public. */
  outputUrl?: string;
  notes?: string;
}

export interface BenchmarkResult {
  id: string;
  /** Brief id published on /benchmark (b1…b5) so input/task stay canonical. */
  briefId: string;
  title: string;
  /** Full input used, verbatim. */
  input: string;
  task: string;
  methodology: string;
  tools: BenchmarkToolResult[];
  /** ISO date the test was run. */
  date: string;
  /** Who ran/evaluated it. */
  evaluator: string;
  /** How scores were assigned (must match BENCHMARK_WEIGHTS). */
  scoring: string;
  /** What the test cannot tell us — mandatory honesty field. */
  limitations: string;
}

export const BENCHMARK_RESULTS: BenchmarkResult[] = [];

/** Results that include a given tool (for tool-page cross-links). */
export function benchmarksForTool(slug: string): BenchmarkResult[] {
  return BENCHMARK_RESULTS.filter((r) => r.tools.some((t) => t.slug === slug));
}

/** Weighted overall from per-metric scores, one decimal. */
export function weightedOverall(scores: Partial<Record<BenchmarkMetric, number>>): number {
  let sum = 0;
  let weightUsed = 0;
  for (const m of BENCHMARK_METRICS) {
    const v = scores[m];
    if (typeof v === 'number') {
      sum += v * BENCHMARK_WEIGHTS[m];
      weightUsed += BENCHMARK_WEIGHTS[m];
    }
  }
  return weightUsed === 0 ? 0 : Math.round((sum / weightUsed) * 10) / 10;
}
