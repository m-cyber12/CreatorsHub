import { describe, it, expect } from 'vitest';
import {
  hasAffiliateProgram,
  outboundRel,
  affiliateTools,
  catalogHasAffiliates,
} from '@/lib/affiliate';
import { ALL_TOOLS } from '@/data/tools';

/**
 * Affiliate truth — every monetization claim on the site must derive from
 * these helpers so Compare, Disclosure, tool pages, /go links, and legal
 * pages can never contradict each other again.
 */

describe('affiliate truth', () => {
  it('requires BOTH a program and a URL before counting as affiliate', () => {
    expect(hasAffiliateProgram({ affiliateProgram: 'impact', affiliateUrl: 'https://x.test/?via=n' })).toBe(true);
    expect(hasAffiliateProgram({ affiliateProgram: 'impact' })).toBe(false);
    expect(hasAffiliateProgram({ affiliateUrl: 'https://x.test/?via=n' })).toBe(false);
    expect(hasAffiliateProgram({ affiliateProgram: null, affiliateUrl: 'https://x.test' })).toBe(false);
    expect(hasAffiliateProgram({})).toBe(false);
  });

  it('emits rel=sponsored ONLY for real affiliate relationships', () => {
    expect(outboundRel({ affiliateProgram: 'direct', affiliateUrl: 'https://x.test' })).toContain('sponsored');
    expect(outboundRel({ affiliateUrl: 'https://x.test/?via=noxifera' })).not.toContain('sponsored');
    expect(outboundRel({})).toBe('noopener noreferrer nofollow');
  });

  it('currently reports zero affiliate relationships (update copy automatically when joined)', () => {
    // This test documents today's truthful state: no approved programs.
    // The day a real program is approved, affiliateTools() becomes non-empty
    // and every surface (Compare, Disclosure, legal) flips together.
    expect(affiliateTools()).toHaveLength(0);
    expect(catalogHasAffiliates()).toBe(false);
  });

  it('never flags a tool the catalog does not know', () => {
    for (const t of affiliateTools()) {
      expect(ALL_TOOLS.some((c) => c.slug === t.slug)).toBe(true);
    }
  });
});
