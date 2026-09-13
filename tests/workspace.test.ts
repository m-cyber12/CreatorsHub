import { describe, it, expect, beforeEach } from 'vitest';
import {
  getSavedTools,
  saveTool,
  removeTool,
  toggleSavedTool,
  setToolNote,
  setToolStatus,
  getSavedStacks,
  saveStackEntry,
  renameStackEntry,
  duplicateStackEntry,
  removeStackEntry,
  getSavedWorkflows,
  saveWorkflowEntry,
  duplicateWorkflowEntry,
  removeWorkflowEntry,
  getSavedComparisons,
  saveComparison,
  removeComparison,
  getExperiments,
  saveExperiment,
  updateExperiment,
  removeExperiment,
  savePreferences,
  getPreferences,
  computeAlerts,
  findStackOverlaps,
  parsePriceNumber,
  SAVED_TOOLS_KEY,
} from '@/lib/workspace';
import { ALL_TOOLS } from '@/data/tools';

function memStorage(): Storage {
  const map = new Map<string, string>();
  return {
    getItem: (k: string) => (map.has(k) ? map.get(k)! : null),
    setItem: (k: string, v: string) => void map.set(k, v),
    removeItem: (k: string) => void map.delete(k),
    clear: () => map.clear(),
    key: (i: number) => [...map.keys()][i] ?? null,
    get length() {
      return map.size;
    },
  } as Storage;
}

const SLUG_A = ALL_TOOLS[0].slug;
const SLUG_B = ALL_TOOLS[1].slug;

describe('saved tools', () => {
  let s: Storage;
  beforeEach(() => {
    s = memStorage();
  });

  it('saves idempotently with a catalog snapshot', () => {
    saveTool(SLUG_A, s);
    saveTool(SLUG_A, s);
    const list = getSavedTools(s);
    expect(list).toHaveLength(1);
    expect(list[0].status).toBe('interested');
    expect(list[0].priceAtSave).toBe(ALL_TOOLS[0].startingPrice);
    expect(list[0].history).toHaveLength(1);
  });

  it('migrates legacy bookmark arrays without duplication', () => {
    s.setItem('noxifera_bookmarks', JSON.stringify([SLUG_A, SLUG_B]));
    saveTool(SLUG_A, s);
    const list = getSavedTools(s);
    expect(list.map((t) => t.slug).sort()).toEqual([SLUG_A, SLUG_B].sort());
  });

  it('toggles, notes, and tracks status history', () => {
    expect(toggleSavedTool(SLUG_A, s).saved).toBe(true);
    setToolNote(SLUG_A, 'try for shorts', s);
    setToolStatus(SLUG_A, 'testing', undefined, s);
    setToolStatus(SLUG_A, 'using', 'paying now', s);
    const t = getSavedTools(s)[0];
    expect(t.note).toBe('try for shorts');
    expect(t.status).toBe('using');
    expect(t.history.map((h) => h.status)).toEqual(['interested', 'testing', 'using']);
    expect(toggleSavedTool(SLUG_A, s).saved).toBe(false);
    expect(getSavedTools(s)).toHaveLength(0);
  });

  it('rejects invalid statuses and caps note length', () => {
    saveTool(SLUG_A, s);
    setToolStatus(SLUG_A, 'bogus' as never, undefined, s);
    expect(getSavedTools(s)[0].status).toBe('interested');
    setToolNote(SLUG_A, 'x'.repeat(1000), s);
    expect(getSavedTools(s)[0].note).toHaveLength(500);
  });

  it('keeps entries for slugs that left the catalog (never silently drops)', () => {
    s.setItem(SAVED_TOOLS_KEY, JSON.stringify([{ slug: 'ghost-tool', status: 'using' }]));
    expect(getSavedTools(s).map((t) => t.slug)).toContain('ghost-tool');
  });

  it('removes tools', () => {
    saveTool(SLUG_A, s);
    saveTool(SLUG_B, s);
    removeTool(SLUG_A, s);
    expect(getSavedTools(s).map((t) => t.slug)).toEqual([SLUG_B]);
  });
});

describe('stacks / workflows / comparisons', () => {
  let s: Storage;
  beforeEach(() => {
    s = memStorage();
  });

  it('renames and duplicates stacks', () => {
    saveStackEntry({ name: 'A', goal: 'shorts', budget: 'budget', picks: { 0: SLUG_A } }, s);
    const [first] = getSavedStacks(s);
    renameStackEntry(first.id, 'Renamed', s);
    duplicateStackEntry(first.id, s);
    const all = getSavedStacks(s);
    expect(all).toHaveLength(2);
    expect(all.map((x) => x.name).sort()).toEqual(['Renamed', 'Renamed (copy)'].sort());
    removeStackEntry(first.id, s);
    expect(getSavedStacks(s)).toHaveLength(1);
  });

  it('duplicates and removes workflows', () => {
    saveWorkflowEntry({ name: 'W', slug: 'podcast-to-shorts', picks: {} }, s);
    const [first] = getSavedWorkflows(s);
    duplicateWorkflowEntry(first.id, s);
    expect(getSavedWorkflows(s)).toHaveLength(2);
    removeWorkflowEntry(first.id, s);
    expect(getSavedWorkflows(s)).toHaveLength(1);
  });

  it('saves comparisons with at least 2 tools', () => {
    expect(saveComparison('x', [SLUG_A], s)).toHaveLength(0);
    saveComparison('A vs B', [SLUG_A, SLUG_B], s);
    const list = getSavedComparisons(s);
    expect(list).toHaveLength(1);
    removeComparison(list[0].id, s);
    expect(getSavedComparisons(s)).toHaveLength(0);
  });
});

describe('experiments & preferences', () => {
  let s: Storage;
  beforeEach(() => {
    s = memStorage();
  });

  it('CRUDs experiments', () => {
    expect(saveExperiment({ title: '  ' }, s)).toHaveLength(0);
    saveExperiment({ title: 'Test captions', toolSlug: SLUG_A, hypothesis: 'faster' }, s);
    const [e] = getExperiments(s);
    expect(e.status).toBe('idea');
    updateExperiment(e.id, { status: 'running', result: 'looks good' }, s);
    expect(getExperiments(s)[0].status).toBe('running');
    removeExperiment(e.id, s);
    expect(getExperiments(s)).toHaveLength(0);
  });

  it('stores preferences with validated tool slugs', () => {
    savePreferences({ creatorType: 'YouTuber', budget: 'under50', currentTools: [SLUG_A, 'nope'] }, s);
    const p = getPreferences(s);
    expect(p.creatorType).toBe('YouTuber');
    expect(p.currentTools).toEqual([SLUG_A]);
  });
});

describe('alerts & overlaps', () => {
  it('detects verbatim price changes only', () => {
    const tool = ALL_TOOLS.find((t) => t.startingPrice) ?? ALL_TOOLS[0];
    const alerts = computeAlerts([
      {
        slug: tool.slug,
        savedAt: '',
        updatedAt: '',
        note: '',
        status: 'interested',
        history: [],
        priceAtSave: 'WRONG-PRICE-SNAPSHOT',
        pricingAtSave: tool.pricing,
        verificationAtSave: tool.verificationLevel,
      },
    ]);
    expect(alerts.some((a) => a.kind === 'price-changed')).toBe(true);
    const quiet = computeAlerts([
      {
        slug: tool.slug,
        savedAt: '',
        updatedAt: '',
        note: '',
        status: 'interested',
        history: [],
        priceAtSave: tool.startingPrice,
        pricingAtSave: tool.pricing,
        verificationAtSave: tool.verificationLevel,
      },
    ]);
    expect(quiet).toHaveLength(0);
  });

  it('flags retired tools via the graveyard', () => {
    const alerts = computeAlerts([
      { slug: 'definitely-not-a-tool', savedAt: '', updatedAt: '', note: '', status: 'using', history: [] },
    ]);
    expect(alerts[0].kind).toBe('tool-unlisted');
  });

  it('groups overlaps by shared category', () => {
    const same = ALL_TOOLS.filter((t) => t.category === ALL_TOOLS[0].category).slice(0, 3);
    if (same.length >= 2) {
      const groups = findStackOverlaps(same.map((t) => t.slug));
      expect(groups.some((g) => g.kind === 'category' && g.slugs.length >= 2)).toBe(true);
    }
  });

  it('parses prices conservatively', () => {
    expect(parsePriceNumber('$29/mo')).toBe(29);
    expect(parsePriceNumber('Free')).toBe(null);
    expect(parsePriceNumber(undefined)).toBe(null);
  });
});
