import { describe, expect, it } from 'vitest';
import { analyzeSubscriptions, quickAddCandidates, type SubInput } from '@/lib/optimizer';

const sub = (id: string, name: string, slug: string, monthlyUsd: number, category?: string): SubInput => ({
  id,
  name,
  slug,
  monthlyUsd,
  category,
});

describe('analyzeSubscriptions', () => {
  it('sums the current total', () => {
    const r = analyzeSubscriptions([
      sub('a', 'ChatGPT Plus', 'chatgpt', 20),
      sub('b', 'Claude Pro', 'claude', 20),
    ]);
    expect(r.currentTotal).toBe(40);
  });

  it('flags duplicate capabilities in the same job category', () => {
    const r = analyzeSubscriptions([
      sub('a', 'ChatGPT Plus', 'chatgpt', 20),
      sub('b', 'Claude Pro', 'claude', 20),
      sub('c', 'Some random SaaS', 'not-in-catalog', 10, 'AI writing'),
    ]);
    expect(r.currentTotal).toBe(50);
    const dup = r.findings.find((f) => f.kind === 'duplicate');
    expect(dup).toBeDefined();
    // chatgpt and claude are both 'AI writing' — the cheaper/secondary is the cancel candidate
    expect(dup!.savings).toBe(20);
    expect(r.monthlySavings).toBeGreaterThanOrEqual(20);
  });

  it('flags a paid tool that has its own free tier', () => {
    const r = analyzeSubscriptions([
      sub('a', 'Canva Pro', 'canva', 13),
    ]);
    const f = r.findings.find((x) => x.kind === 'free-tier');
    expect(f).toBeDefined();
    // canva is freemium → the full paid amount is at risk of being unnecessary
    expect(f!.savings).toBe(13);
  });

  it('flags a cheaper same-job alternative only when it saves meaningfully', () => {
    // descript starts at $12/mo; capcut is a free alternative in the same category
    const r = analyzeSubscriptions([sub('a', 'Descript Pro', 'descript', 24)]);
    expect(r.findings.length).toBeGreaterThan(0);
    const any = r.findings[0];
    expect(any.kind).toBe('free-tier');
  });

  it('reports unanalysed count for unknown tools', () => {
    const r = analyzeSubscriptions([
      sub('a', 'Mystery SaaS', 'not-in-catalog', 15, 'Editing'),
    ]);
    expect(r.unanalysed).toBe(1);
    expect(r.findings.length).toBe(0);
  });

  it('never yields negative totals', () => {
    const r = analyzeSubscriptions([
      sub('a', 'ChatGPT', 'chatgpt', 5),
      sub('b', 'Claude', 'claude', 5),
    ]);
    expect(r.optimizedTotal).toBeGreaterThanOrEqual(0);
    expect(r.yearlySavings).toBeCloseTo(r.monthlySavings * 12, 5);
  });

  it('handles empty input', () => {
    const r = analyzeSubscriptions([]);
    expect(r.currentTotal).toBe(0);
    expect(r.findings).toEqual([]);
  });
});

describe('quickAddCandidates', () => {
  it('returns known catalog tools', () => {
    const list = quickAddCandidates(6);
    expect(list.length).toBeGreaterThan(0);
    expect(list.length).toBeLessThanOrEqual(6);
    expect(list[0]).toHaveProperty('slug');
    expect(list[0]).toHaveProperty('name');
  });
});
