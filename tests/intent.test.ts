import { describe, it, expect } from 'vitest';
import { intentSearch, parseIntent, priceMonthlyEquivalent } from '@/lib/intent';
import { ALL_TOOLS } from '@/data/tools';
import { OUTCOMES } from '@/data/outcomes';

describe('priceMonthlyEquivalent', () => {
  it('parses monthly, yearly and free prices', () => {
    expect(priceMonthlyEquivalent('$15/mo')).toBe(15);
    expect(priceMonthlyEquivalent('$139/yr')).toBeCloseTo(139 / 12, 5);
    expect(priceMonthlyEquivalent('Free')).toBe(0);
    expect(priceMonthlyEquivalent('$1,299')).toBe(1299);
  });

  it('returns null for usage-based, custom and unknown prices', () => {
    expect(priceMonthlyEquivalent('$0.25/min')).toBeNull();
    expect(priceMonthlyEquivalent('$0.025/img')).toBeNull();
    expect(priceMonthlyEquivalent('Custom')).toBeNull();
    expect(priceMonthlyEquivalent(undefined)).toBeNull();
    expect(priceMonthlyEquivalent('')).toBeNull();
  });
});

describe('parseIntent budgets', () => {
  it('parses "under $30" style caps', () => {
    for (const q of ['AI dubbing under $30', 'below €50', '< $20', 'max $100', 'up to $10']) {
      const intent = parseIntent(q, ALL_TOOLS);
      expect(intent.priceCap, q).toBeDefined();
      expect(intent.hasSignal, q).toBe(true);
    }
    expect(parseIntent('AI dubbing under $30', ALL_TOOLS).priceCap).toMatchObject({
      amount: 30,
      currency: '$',
    });
    expect(parseIntent('below €50', ALL_TOOLS).priceCap).toMatchObject({ amount: 50, currency: '€' });
  });

  it('detects free-only and cheap-first modifiers', () => {
    expect(parseIntent('free voice generator', ALL_TOOLS).freeOnly).toBe(true);
    expect(parseIntent('cheap faceless youtube stack', ALL_TOOLS).cheapFirst).toBe(true);
    expect(parseIntent('budget editing tools', ALL_TOOLS).cheapFirst).toBe(true);
    expect(parseIntent('voice generator', ALL_TOOLS).freeOnly).toBe(false);
  });
});

describe('parseIntent versus', () => {
  it('resolves both sides to catalog tools', () => {
    const intent = parseIntent('runway vs pika', ALL_TOOLS);
    expect(intent.versus).toMatchObject({
      a: { name: expect.any(String), slug: 'runway' },
      b: { name: expect.any(String), slug: 'pika' },
    });
  });

  it('ignores "or" between non-tools', () => {
    expect(parseIntent('free or cheap', ALL_TOOLS).versus).toBeUndefined();
    expect(parseIntent('runway or something', ALL_TOOLS).versus).toBeUndefined();
  });

  it('ignores self-comparisons', () => {
    expect(parseIntent('runway vs runway', ALL_TOOLS).versus).toBeUndefined();
  });
});

describe('parseIntent outcomes', () => {
  it('maps the user example queries to the right outcome guides', () => {
    expect(parseIntent('turn podcast into shorts', ALL_TOOLS).outcomes.map((o) => o.slug)).toContain(
      'podcast-to-shorts'
    );
    expect(parseIntent('AI dubbing under $30', ALL_TOOLS).outcomes.map((o) => o.slug)).toContain(
      'dubbed-content'
    );
    expect(parseIntent('cheap faceless YouTube stack', ALL_TOOLS).outcomes.map((o) => o.slug)).toContain(
      'faceless-youtube'
    );
    expect(parseIntent('AI voice for YouTube', ALL_TOOLS).outcomes.map((o) => o.slug)).toContain(
      'ai-voiceover'
    );
  });

  it('detects stack requests', () => {
    expect(parseIntent('cheap faceless YouTube stack', ALL_TOOLS).stackIntent).toBe(true);
    expect(parseIntent('podcast editing bundle', ALL_TOOLS).stackIntent).toBe(true);
    expect(parseIntent('podcast editing', ALL_TOOLS).stackIntent).toBe(false);
  });

  it('reports no signal for plain keyword queries', () => {
    const intent = parseIntent('descript', ALL_TOOLS);
    expect(intent.hasSignal).toBe(false);
    expect(intent.outcomes).toEqual([]);
  });
});

describe('intentSearch', () => {
  it('enforces budget caps numerically', () => {
    const { intent, tools } = intentSearch('video generator under $30', ALL_TOOLS);
    expect(intent.hasSignal).toBe(true);
    expect(tools.length).toBeGreaterThan(0);
    for (const t of tools) {
      const equiv = priceMonthlyEquivalent(t.startingPrice);
      expect(equiv, t.slug).not.toBeNull();
      expect(equiv!).toBeLessThanOrEqual(30);
    }
  });

  it('free-only returns exclusively Free-tier tools', () => {
    const { tools } = intentSearch('free thumbnail maker', ALL_TOOLS);
    expect(tools.length).toBeGreaterThan(0);
    for (const t of tools) expect(t.pricing).toBe('Free');
  });

  it('cheap-first sorts by ascending monthly price', () => {
    const { tools } = intentSearch('cheap voice generator', ALL_TOOLS);
    expect(tools.length).toBeGreaterThan(2);
    const prices = tools.map((t) => priceMonthlyEquivalent(t.startingPrice) ?? Number.POSITIVE_INFINITY);
    for (let i = 1; i < prices.length; i++) {
      expect(prices[i - 1] <= prices[i]).toBe(true);
    }
  });

  it('versus search returns exactly the two compared tools', () => {
    const { tools } = intentSearch('runway vs pika', ALL_TOOLS);
    expect(tools.map((t) => t.slug).sort()).toEqual(['pika', 'runway']);
  });

  it('boosts tools used by matched outcome guides', () => {
    const { tools } = intentSearch('turn podcast into shorts', ALL_TOOLS);
    expect(tools.length).toBeGreaterThan(0);
    // Riverside is the primary "record clean" pick of podcast-to-shorts.
    const idx = tools.findIndex((t) => t.slug === 'riverside');
    expect(idx).toBeGreaterThanOrEqual(0);
    expect(idx).toBeLessThan(20);
  });

  it('is honest-empty when nothing matches', () => {
    const { intent, tools } = intentSearch('free xylophone submarine choreography', ALL_TOOLS);
    expect(intent.hasSignal).toBe(true);
    expect(tools).toEqual([]);
  });

  it('counts usage-priced tools hidden by a budget', () => {
    const { tools, usagePricedHidden } = intentSearch('video generator under $30', ALL_TOOLS);
    expect(tools.length + usagePricedHidden).toBeGreaterThan(tools.length);
  });
});

describe('outcome keyword map integrity', () => {
  it('references only real outcome slugs', () => {
    const slugs = new Set(OUTCOMES.map((o) => o.slug));
    // Exercise every phrase through the parser via representative queries.
    const probes = [
      'podcast to shorts', 'faceless', 'thumbnail', 'shorts', 'voiceover',
      'ugc', 'start a podcast', 'dubbing',
    ];
    for (const probe of probes) {
      const { outcomes } = parseIntent(probe, ALL_TOOLS);
      expect(outcomes.length, probe).toBeGreaterThan(0);
      for (const o of outcomes) expect(slugs.has(o.slug)).toBe(true);
    }
  });
});
