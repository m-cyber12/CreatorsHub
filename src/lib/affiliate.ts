import { ALL_TOOLS, type Tool } from '@/data/tools';

/**
 * Affiliate truth — single source of truth for monetization messaging.
 *
 * Trust fix (2026-09): the Compare page claimed "some links are affiliate
 * links" while the Disclosure page truthfully stated NOXIFERA earns nothing
 * — a direct contradiction. Rule: NO page may hardcode an affiliate claim.
 * Every affiliate/commission/sponsored statement must derive from the
 * catalog via these helpers, so all surfaces flip together the day a real
 * program is approved.
 *
 * A tool counts as an affiliate link ONLY when `affiliateProgram` is set to
 * a real, approved network (see the audit note on Tool.affiliateProgram).
 * A bare `affiliateUrl` without a program is ignored everywhere.
 */

/** True when outbound clicks to this tool earn NOXIFERA a commission. */
export function hasAffiliateProgram(tool: Pick<Tool, 'affiliateProgram' | 'affiliateUrl'>): boolean {
  return Boolean(tool.affiliateProgram && tool.affiliateUrl);
}

/**
 * Correct `rel` for an outbound tool link. `sponsored` is emitted ONLY for
 * real affiliate relationships — claiming it otherwise misleads readers
 * about our incentives (and vice versa).
 */
export function outboundRel(tool: Pick<Tool, 'affiliateProgram' | 'affiliateUrl'>): string {
  return hasAffiliateProgram(tool)
    ? 'noopener noreferrer nofollow sponsored'
    : 'noopener noreferrer nofollow';
}

/** Tools currently earning commission (empty until programs are joined). */
export function affiliateTools(source: Tool[] = ALL_TOOLS): Tool[] {
  return source.filter(hasAffiliateProgram);
}

/** True when at least one catalog link earns commission. */
export function catalogHasAffiliates(source: Tool[] = ALL_TOOLS): boolean {
  return source.some(hasAffiliateProgram);
}

/** Count of affiliate tools — for honest "we earn on N of M tools" copy. */
export function affiliateToolCount(source: Tool[] = ALL_TOOLS): number {
  return affiliateTools(source).length;
}
