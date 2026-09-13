import { describe, it, expect } from 'vitest';
import {
  loadBenchRequests,
  saveBenchRequests,
  toggleBenchRequest,
  BENCH_REQUESTS_KEY,
  MAX_BENCH_REQUESTS,
} from '../src/lib/benchRequests';
import { ALL_TOOLS } from '../src/data/tools';

class MemStorage implements Storage {
  private m = new Map<string, string>();
  getItem(k: string) { return this.m.get(k) ?? null; }
  setItem(k: string, v: string) { this.m.set(k, v); }
  removeItem(k: string) { this.m.delete(k); }
  clear() { this.m.clear(); }
  key(i: number) { return [...this.m.keys()][i] ?? null; }
  get length() { return this.m.size; }
}

describe('benchRequests', () => {
  it('toggles a valid slug in and out', () => {
    const s = new MemStorage();
    expect(toggleBenchRequest('runway', s)).toEqual(['runway']);
    expect(loadBenchRequests(s)).toEqual(['runway']);
    expect(toggleBenchRequest('runway', s)).toEqual([]);
  });

  it('ignores unknown slugs', () => {
    const s = new MemStorage();
    expect(toggleBenchRequest('not-a-real-tool', s)).toEqual([]);
    expect(loadBenchRequests(s)).toHaveLength(0);
  });

  it('dedupes and caps at the max', () => {
    const s = new MemStorage();
    // Real catalog slugs: far more than the cap, plus duplicates.
    const slugs = ALL_TOOLS.map((t) => t.slug);
    saveBenchRequests([...slugs, slugs[0], slugs[0]], s);
    const loaded = loadBenchRequests(s);
    expect(loaded.length).toBe(MAX_BENCH_REQUESTS);
    expect(new Set(loaded).size).toBe(loaded.length); // no duplicates
  });

  it('returns [] for missing or corrupted storage', () => {
    const s = new MemStorage();
    expect(loadBenchRequests(s)).toEqual([]);
    s.setItem(BENCH_REQUESTS_KEY, 'not json');
    expect(loadBenchRequests(s)).toEqual([]);
    s.setItem(BENCH_REQUESTS_KEY, '{"a":1}');
    expect(loadBenchRequests(s)).toEqual([]);
    s.setItem(BENCH_REQUESTS_KEY, '["runway", 42, null, "runway"]');
    expect(loadBenchRequests(s)).toEqual(['runway']);
  });
});
