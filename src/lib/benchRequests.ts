import { ALL_TOOLS } from '@/data/tools';

/**
 * Benchmark Lab (roadmap §42 #14) — local benchmark requests.
 *
 * The lab runs on the editor's test schedule; there is no backend for
 * community voting, so requests are stored per browser (localStorage) and
 * surfaced on the queue as "your requests". We deliberately do NOT render
 * fake vote counts or global queue positions.
 */

export const BENCH_REQUESTS_KEY = 'noxifera_bench_requests';
export const MAX_BENCH_REQUESTS = 20;

const VALID_SLUGS = new Set(ALL_TOOLS.map((t) => t.slug));

export function loadBenchRequests(storage: Storage = globalThis.localStorage): string[] {
  try {
    const raw = storage.getItem(BENCH_REQUESTS_KEY);
    if (!raw) return [];
    const p = JSON.parse(raw);
    if (!Array.isArray(p)) return [];
    const seen = new Set<string>();
    const out: string[] = [];
    for (const v of p) {
      if (typeof v === 'string' && VALID_SLUGS.has(v) && !seen.has(v) && out.length < MAX_BENCH_REQUESTS) {
        seen.add(v);
        out.push(v);
      }
    }
    return out;
  } catch {
    return [];
  }
}

export function saveBenchRequests(slugs: string[], storage: Storage = globalThis.localStorage): void {
  try {
    storage.setItem(BENCH_REQUESTS_KEY, JSON.stringify(slugs));
  } catch {
    /* storage full/blocked — requests degrade to session-only */
  }
}

/** Add or remove a slug; returns the new list. Unknown slugs are a no-op. */
export function toggleBenchRequest(slug: string, storage: Storage = globalThis.localStorage): string[] {
  if (!VALID_SLUGS.has(slug)) return loadBenchRequests(storage);
  const cur = loadBenchRequests(storage);
  const next = cur.includes(slug) ? cur.filter((s) => s !== slug) : [...cur, slug];
  const capped = next.slice(0, MAX_BENCH_REQUESTS);
  saveBenchRequests(capped, storage);
  return capped;
}
