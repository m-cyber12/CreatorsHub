import { describe, it, expect } from 'vitest';
import {
  computeRadar,
  loadFollows,
  saveFollows,
  toggleFollow,
  EMPTY_FOLLOWS,
  RADAR_FOLLOWS_KEY,
  MAX_PER_SECTION,
  type RadarFollows,
} from '../src/lib/radar';
import { ALL_TOOLS } from '../src/data/tools';
import { WORKFLOWS, workflowMinutes } from '../src/data/workflows';

const NOW = new Date('2026-09-12T12:00:00Z');
const none: RadarFollows = { categories: [], tools: [], workflows: [] };

class MemStorage implements Storage {
  private m = new Map<string, string>();
  getItem(k: string) { return this.m.get(k) ?? null; }
  setItem(k: string, v: string) { this.m.set(k, v); }
  removeItem(k: string) { this.m.delete(k); }
  clear() { this.m.clear(); }
  key(i: number) { return [...this.m.keys()][i] ?? null; }
  get length() { return this.m.size; }
}

describe('radar — feed computation (real catalog)', () => {
  it('shows the global digest when nothing is followed', () => {
    const feed = computeRadar(none, NOW);
    expect(feed.scoped).toBe(false);
    // Catalog has 29 isNew and 26 trending-only tools (3 dual-flagged count once, under New).
    expect(feed.newTools.length).toBe(MAX_PER_SECTION);
    expect(feed.trending.length).toBe(MAX_PER_SECTION);
    expect(feed.watch).toHaveLength(0);
    expect(feed.workflows).toHaveLength(0);
    for (const e of feed.newTools) expect(e.tool.isNew).toBe(true);
    for (const e of feed.trending) {
      expect(e.tool.isTrending).toBe(true);
      expect(e.tool.isNew).toBe(false); // dual-flagged tools appear once, under New
    }
  });

  it('orders deterministically by rating desc then name asc', () => {
    const { newTools } = computeRadar(none, NOW);
    for (let i = 1; i < newTools.length; i++) {
      const a = newTools[i - 1].tool;
      const b = newTools[i].tool;
      expect(b.rating - a.rating || a.name.localeCompare(b.name)).toBeLessThanOrEqual(0);
    }
  });

  it('scopes new/trending to followed categories only', () => {
    const feed = computeRadar({ ...none, categories: ['Voice & Audio'] }, NOW);
    expect(feed.scoped).toBe(true);
    expect(feed.newTools.length).toBeGreaterThan(0);
    for (const e of [...feed.newTools, ...feed.trending]) {
      expect(e.tool.category).toBe('Voice & Audio');
    }
    // autoshorts (Faceless Video, isNew) must NOT leak into a Voice & Audio scope
    expect(feed.newTools.map((e) => e.tool.slug)).not.toContain('autoshorts');
    expect(feed.newTools.map((e) => e.tool.slug)).toContain('cleanvoice');
  });

  it('keeps the global digest when only tools/workflows are followed (no categories)', () => {
    const feed = computeRadar({ ...none, tools: ['opusclip'], workflows: ['podcast-to-shorts'] }, NOW);
    expect(feed.scoped).toBe(true);
    expect(feed.newTools.length).toBe(MAX_PER_SECTION); // still global
    expect(feed.watch.map((e) => e.tool.slug)).toEqual(['opusclip']);
    expect(feed.workflows).toHaveLength(1);
    expect(feed.workflows[0].workflow.slug).toBe('podcast-to-shorts');
    expect(feed.workflows[0].minutes).toBe(workflowMinutes(WORKFLOWS.find((w) => w.slug === 'podcast-to-shorts')!));
  });

  it('lists only followed workflows, in catalog order', () => {
    const feed = computeRadar(
      { ...none, workflows: ['ugc-ads', 'podcast-to-shorts', 'nope-does-not-exist'] },
      NOW
    );
    expect(feed.workflows.map((w) => w.workflow.slug)).toEqual(['podcast-to-shorts', 'ugc-ads']);
  });

  it('filters followed tools that are not in the catalog', () => {
    const feed = computeRadar({ ...none, tools: ['not-a-tool', 'elevenlabs'] }, NOW);
    expect(feed.watch.map((e) => e.tool.slug)).toEqual(['elevenlabs']);
    // watch entry carries current catalog price data for the price-watch row
    const tool = feed.watch[0].tool;
    expect(typeof tool.pricing).toBe('string');
  });
});

describe('radar — persistence & helpers', () => {
  it('round-trips follows through storage', () => {
    const s = new MemStorage();
    const f = { categories: ['SEO & Analytics'], tools: ['runway'], workflows: ['faceless-video'] };
    saveFollows(f, s);
    expect(loadFollows(s)).toEqual(f);
  });

  it('returns empty follows for missing or corrupted storage', () => {
    const s = new MemStorage();
    expect(loadFollows(s)).toEqual(EMPTY_FOLLOWS);
    s.setItem(RADAR_FOLLOWS_KEY, '{corrupted json');
    expect(loadFollows(s)).toEqual(EMPTY_FOLLOWS);
    s.setItem(RADAR_FOLLOWS_KEY, '{"categories":"nope","tools":[1,2],"workflows":[]}');
    expect(loadFollows(s)).toEqual({ categories: [], tools: [], workflows: [] });
  });

  it('toggles values in and out', () => {
    expect(toggleFollow([], 'a')).toEqual(['a']);
    expect(toggleFollow(['a'], 'a')).toEqual([]);
    expect(toggleFollow(['a'], 'b')).toEqual(['a', 'b']);
  });

  it('never exceeds the per-section cap', () => {
    const feed = computeRadar(none, NOW);
    expect(feed.newTools.length).toBeLessThanOrEqual(MAX_PER_SECTION);
    expect(feed.trending.length).toBeLessThanOrEqual(MAX_PER_SECTION);
    expect(feed.watch.length).toBeLessThanOrEqual(MAX_PER_SECTION);
    expect(ALL_TOOLS.length).toBeGreaterThan(MAX_PER_SECTION); // sanity: cap is meaningful
  });
});
