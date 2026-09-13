import { describe, expect, it } from 'vitest';
import { matchPreferencesToAdvisor } from '@/lib/advisor';

describe('matchPreferencesToAdvisor', () => {
  it('maps confident free-text preferences onto advisor enums', () => {
    const r = matchPreferencesToAdvisor({
      platform: 'YouTube',
      contentFormat: 'Shorts',
      budget: 'under $50/mo',
      skillLevel: 'beginner',
      workflowStyle: 'fast & automated',
      currentTools: ['capcut'],
    });
    expect(r).toMatchObject({
      platform: 'youtube',
      content: 'short-form',
      budget: 'under50',
      experience: 'new',
      automation: 'max',
      existing: ['capcut'],
    });
    expect(r.matchedCount).toBe(6);
  });

  it('refuses to guess on ambiguous or empty text', () => {
    const r = matchPreferencesToAdvisor({
      // matches short-form ("short"), podcast ("podcast") and ugc (" ad")
      // at once → ambiguous, so nothing is applied
      contentFormat: 'short podcast ads',
      platform: 'somewhere',
      currentTools: [],
    });
    expect(r.content).toBeUndefined();
    expect(r.platform).toBeUndefined();
    expect(r.matchedCount).toBe(0);
  });

  it('returns zero matches for empty preferences', () => {
    const r = matchPreferencesToAdvisor({ currentTools: [] });
    expect(r.matchedCount).toBe(0);
    expect(r.existing).toEqual([]);
  });

  it('counts existing tools as one match even with no text fields', () => {
    const r = matchPreferencesToAdvisor({ currentTools: ['a', 'b'] });
    expect(r.matchedCount).toBe(1);
  });
});
