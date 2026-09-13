import { describe, it, expect } from 'vitest';
import { ALL_TOOLS } from '../src/data/tools';
import {
  runAdvisor,
  monthlyCost,
  catalogTool,
  CONTENT_TYPES,
  BUDGETS,
  AUTOMATION_LEVELS,
  type AdvisorAnswers,
} from '../src/lib/advisor';

const slugs = new Set(ALL_TOOLS.map((t) => t.slug));
const base: Omit<AdvisorAnswers, 'content'> = {
  platform: 'youtube',
  budget: 'under150',
  experience: 'some',
  automation: 'balanced',
  useOwnVoice: false,
  existingTools: [],
};

describe('monthlyCost', () => {
  it('parses monthly, yearly, free and one-time prices', () => {
    expect(monthlyCost('$12/mo')).toBe(12);
    expect(monthlyCost('$150/yr')).toBeCloseTo(12.5);
    expect(monthlyCost('Free')).toBe(0);
    expect(monthlyCost('$299 one-time')).toBe(0);
    expect(monthlyCost(undefined)).toBe(0);
    expect(monthlyCost('$49.99/yr')).toBeCloseTo(4.17, 1);
  });
});

describe('catalog integrity of advisor plans', () => {
  it('every recommended or alternative slug exists in the catalog', () => {
    for (const content of CONTENT_TYPES) {
      for (const budget of BUDGETS) {
        for (const automation of AUTOMATION_LEVELS) {
          const r = runAdvisor({ ...base, content, budget, automation });
          for (const stage of r.stages) {
            const all = stage.tool ? [stage.tool, ...stage.alternatives] : stage.alternatives;
            for (const s of all) {
              expect(slugs.has(s), `${content}/${budget}/${automation} → ${stage.key}: unknown slug "${s}"`).toBe(true);
            }
          }
        }
      }
    }
  });

  it('every stage carries a reason and a concrete next step', () => {
    for (const content of CONTENT_TYPES) {
      const r = runAdvisor({ ...base, content });
      expect(r.stages.length).toBeGreaterThanOrEqual(3);
      for (const stage of r.stages) {
        expect(stage.reason.length, `${content}/${stage.key} reason`).toBeGreaterThanOrEqual(15);
        expect(stage.nextStep.length, `${content}/${stage.key} next step`).toBeGreaterThanOrEqual(15);
      }
    }
  });
});

describe('budget compliance (the guarantee)', () => {
  const caps: Record<string, number> = { free: 0, under50: 50, under150: 150, unlimited: Infinity };

  it.each(BUDGETS as readonly string[])('monthly total never exceeds the %s cap across all content types', (budget) => {
    for (const content of CONTENT_TYPES) {
      const r = runAdvisor({ ...base, content, budget: budget as AdvisorAnswers['budget'] });
      expect(r.monthlyTotal, `${content}/${budget} total`).toBeLessThanOrEqual(caps[budget] + 0.001);
    }
  });

  it('free budget never includes a paid subscription', () => {
    const r = runAdvisor({ ...base, content: 'long-form', budget: 'free' });
    for (const stage of r.stages) {
      if (!stage.tool) continue;
      const t = catalogTool(stage.tool)!;
      expect(['Free', 'Freemium'].includes(t.pricing), `${stage.key} → ${t.name} is ${t.pricing}`).toBe(true);
    }
  });
});

describe('personalisation', () => {
  it('reuses tools the creator already has (no new subscription)', () => {
    const r = runAdvisor({ ...base, content: 'podcast', existingTools: ['descript'] });
    const withDescript = r.stages.filter((s) => s.tool === 'descript');
    expect(withDescript.length).toBeGreaterThanOrEqual(1);
    expect(withDescript.every((s) => s.fromExisting)).toBe(true);
    // Descript must not be double-counted as a new cost.
    const descriptCost = catalogTool('descript')!.startingPrice ? monthlyCost(catalogTool('descript')!.startingPrice) : 0;
    expect(r.monthlyTotal).toBeLessThanOrEqual(150 + 0.001 - Math.min(descriptCost, 1));
  });

  it('prefers the creator’s own voice when asked (manual voice stage)', () => {
    const r = runAdvisor({ ...base, content: 'long-form', useOwnVoice: true, budget: 'unlimited' });
    const voice = r.stages.find((s) => s.key === 'voice')!;
    expect(voice.tool).toBeNull();
    expect(voice.reason.toLowerCase()).toMatch(/voice/);
  });

  it('manual automation takes the manual path where a plan allows it', () => {
    const r = runAdvisor({ ...base, content: 'short-form', automation: 'manual', budget: 'unlimited' });
    const clipping = r.stages.find((s) => s.key === 'clipping')!;
    expect(clipping.tool).toBeNull();
  });

  it('faceless content never recommends the creator’s own voice', () => {
    const r = runAdvisor({ ...base, content: 'faceless', useOwnVoice: true, budget: 'unlimited' });
    const voice = r.stages.find((s) => s.key === 'voice')!;
    expect(voice.tool).not.toBeNull();
    expect(['elevenlabs', 'murf-ai', 'lovo-ai', 'speechify'].includes(voice.tool!)).toBe(true);
  });

  it('is deterministic: same answers → identical systems', () => {
    const a = runAdvisor({ ...base, content: 'faceless' });
    const b = runAdvisor({ ...base, content: 'faceless' });
    expect(a).toEqual(b);
  });
});
