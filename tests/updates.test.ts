import { describe, it, expect } from 'vitest';
import {
  buildCatalogUpdates,
  buildPersonalUpdates,
  countUnread,
  getUpdatesLastSeen,
  setUpdatesLastSeen,
  stackToolSlugs,
  workflowToolSlugs,
  type UpdateEvent,
} from '@/lib/updates';
import { saveTool, saveStackEntry, saveWorkflowEntry } from '@/lib/workspace';
import { ALL_TOOLS, type Tool } from '@/data/tools';

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

function tool(over: Partial<Tool> & { slug: string; name: string }): Tool {
  return {
    category: 'video',
    pricingModel: 'paid',
    startingPrice: '$10',
    verificationLevel: 'listed-only',
    ...over,
  } as Tool;
}

describe('buildCatalogUpdates', () => {
  it('emits tool-added only for isNew tools with a real date', () => {
    const events = buildCatalogUpdates({
      tools: [
        tool({ slug: 'a', name: 'A', isNew: true, cataloguedAt: '2026-09-01' }),
        tool({ slug: 'b', name: 'B', isNew: true }), // no date → no event
        tool({ slug: 'c', name: 'C', cataloguedAt: '2026-09-01' }), // not flagged → no event
      ],
      graveyard: [],
      benchmarks: [],
      priceChanges: [],
    });
    expect(events.map((e) => e.id)).toEqual(['tool-added:a:2026-09-01']);
  });

  it('emits verification-upgraded only when dated', () => {
    const events = buildCatalogUpdates({
      tools: [
        tool({ slug: 'a', name: 'A', verificationLevel: 'hands-on-tested', testedAt: '2026-08-20' }),
        tool({ slug: 'b', name: 'B', verificationLevel: 'pricing-verified' }), // undated → silent
      ],
      graveyard: [],
      benchmarks: [],
      priceChanges: [],
    });
    expect(events).toHaveLength(1);
    expect(events[0].kind).toBe('verification-upgraded');
    expect(events[0].detail).toBe('hands-on-tested');
  });

  it('sorts newest-first and caps the feed', () => {
    const tools = Array.from({ length: 200 }, (_, i) =>
      tool({ slug: `t${i}`, name: `T${i}`, isNew: true, cataloguedAt: `2026-01-${String((i % 28) + 1).padStart(2, '0')}` })
    );
    const events = buildCatalogUpdates({ tools, graveyard: [], benchmarks: [], priceChanges: [] });
    expect(events.length).toBeLessThanOrEqual(120);
    for (let i = 1; i < events.length; i++) {
      expect(events[i - 1].date >= events[i].date).toBe(true);
    }
  });

  it('is empty-safe: no dated data means an empty feed', () => {
    expect(buildCatalogUpdates({ tools: [], graveyard: [], benchmarks: [], priceChanges: [] })).toEqual([]);
  });

  it('turns price changes into dated events with from→to detail', () => {
    const events = buildCatalogUpdates({
      tools: [],
      graveyard: [],
      benchmarks: [],
      priceChanges: [{ slug: 'x', toolName: 'X', from: '$15', to: '$20', date: '2026-09-10' }],
    });
    expect(events[0]).toMatchObject({ kind: 'price-changed', detail: '$15 → $20', href: '/tool/x' });
  });
});

describe('buildPersonalUpdates', () => {
  const catalog: UpdateEvent[] = [
    { id: '1', kind: 'price-changed', date: '2026-09-10', slug: 'alpha', toolName: 'Alpha', href: '/tool/alpha' },
    { id: '2', kind: 'tool-retired', date: '2026-09-09', slug: 'beta', toolName: 'Beta', href: '/graveyard' },
    { id: '3', kind: 'tool-added', date: '2026-09-11', slug: 'gamma', toolName: 'Gamma', href: '/tool/gamma' },
  ];

  it('matches events against saved tools, stack members and workflow tools', () => {
    const s = memStorage();
    saveTool('alpha', s);
    saveStackEntry({ name: 'S', goal: 'test', budget: 'free', picks: { 0: 'beta' } }, s);
    saveWorkflowEntry({ slug: 'custom', name: 'W', picks: { step1: 'gamma' }, steps: [] }, s);

    const personal = buildPersonalUpdates(catalog, s);
    expect(personal.toolEvents.map((e) => e.id).sort()).toEqual(['1', '2', '3']);
    expect(personal.stackGroups).toHaveLength(1);
    expect(personal.stackGroups[0].stackName).toBe('S');
    expect(personal.stackGroups[0].events.map((e) => e.id)).toEqual(['2']);
  });

  it('returns empty groups when the workspace is empty', () => {
    const personal = buildPersonalUpdates(catalog, memStorage());
    expect(personal.toolEvents).toEqual([]);
    expect(personal.stackGroups).toEqual([]);
    expect(personal.openAlerts).toEqual([]);
  });

  it('surfaces benchmark publications that name a watched tool', () => {
    const s = memStorage();
    saveTool('alpha', s);
    const bench: UpdateEvent = {
      id: 'b1',
      kind: 'benchmark-published',
      date: '2026-09-12',
      toolName: 'Voice test',
      detail: 'alpha, other',
      href: '/benchmark',
    };
    const personal = buildPersonalUpdates([bench], s);
    expect(personal.toolEvents.map((e) => e.id)).toEqual(['b1']);
  });
});

describe('slug pickers', () => {
  it('stackToolSlugs returns picks in position order', () => {
    expect(stackToolSlugs({ picks: { 2: 'c', 0: 'a', 1: 'b' } } as never)).toEqual(['a', 'b', 'c']);
  });

  it('workflowToolSlugs unions picks and custom step tools', () => {
    const slugs = workflowToolSlugs({ picks: { s1: 'a' }, steps: [{ toolSlug: 'b' }, {}] } as never);
    expect(slugs.sort()).toEqual(['a', 'b']);
  });
});

describe('read state', () => {
  it('counts events strictly newer than the last-seen day', () => {
    const events: UpdateEvent[] = [
      { id: '1', kind: 'tool-added', date: '2026-09-10', toolName: 'A', href: '/x' },
      { id: '2', kind: 'tool-added', date: '2026-09-11', toolName: 'B', href: '/x' },
    ];
    expect(countUnread(events, null)).toBe(2);
    expect(countUnread(events, '2026-09-10T23:59:59.000Z')).toBe(1);
    expect(countUnread(events, '2026-09-11T00:00:00.000Z')).toBe(0);
  });

  it('round-trips last-seen through storage', () => {
    const s = memStorage();
    expect(getUpdatesLastSeen(s)).toBeNull();
    setUpdatesLastSeen('2026-09-12T00:00:00.000Z', s);
    expect(getUpdatesLastSeen(s)).toBe('2026-09-12T00:00:00.000Z');
  });
});

describe('real catalog sanity', () => {
  it('builds a bounded, sorted feed with no invented dates', () => {
    const events = buildCatalogUpdates({ tools: ALL_TOOLS });
    expect(events.length).toBeLessThanOrEqual(120);
    for (let i = 1; i < events.length; i++) {
      expect(events[i - 1].date >= events[i].date).toBe(true);
    }
    for (const e of events) {
      expect(e.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(e.href.length).toBeGreaterThan(1);
    }
  });
});
