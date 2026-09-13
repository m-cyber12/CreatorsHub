/**
 * Noxifera Subscription Optimizer — Roadmap §11.
 *
 * The creator's original problem in one feature: "I have 14 subscriptions and
 * I use 3 of them." Enter your current stack; the engine (a deterministic
 * function over catalog categories + pricing) finds:
 *   1. duplicate capabilities (two tools doing the same job);
 *   2. paid subscriptions where a free tier covers the job;
 *   3. cheaper catalog alternatives doing the same job.
 * and computes the monthly/yearly savings.
 *
 * Honesty rules: only catalog tools can be analysed (we state what we cannot
 * see); every suggestion links to a real tool page; savings are "possible",
 * never "guaranteed" — the user decides what to cancel.
 */

import { ALL_TOOLS, type Tool } from '@/data/tools';
import { monthlyCost } from './advisor';

export interface SubInput {
  id: string;
  /** Free-text name as the user typed it (shown in the UI). */
  name: string;
  /** Catalog slug when the tool is known to us. */
  slug?: string;
  /** Catalog category, used for unknown tools. */
  category?: string;
  /** What the user actually pays, USD/month. */
  monthlyUsd: number;
}

export type FindingKind = 'duplicate' | 'free-tier' | 'cheaper';

export interface Finding {
  kind: FindingKind;
  /** The subscription this finding is about. */
  subId: string;
  /** Catalog slug of the suggested alternative (when there is one). */
  altSlug?: string;
  title: string;
  detail: string;
  savings: number;
}

export interface OptimizerResult {
  currentTotal: number;
  optimizedTotal: number;
  monthlySavings: number;
  yearlySavings: number;
  findings: Finding[];
  /** Number of subscriptions we could not analyse (unknown tools). */
  unanalysed: number;
}

const MIN_SWAP_SAVINGS = 3; // $/mo — below this, the switch is not worth it

export function analyzeSubscriptions(subs: SubInput[]): OptimizerResult {
  const currentTotal = round2(subs.reduce((s, x) => s + Math.max(0, x.monthlyUsd), 0));
  const findings: Finding[] = [];
  const actionTaken = new Set<string>();

  const toolOf = (sub: SubInput): Tool | undefined =>
    sub.slug ? ALL_TOOLS.find((t) => t.slug === sub.slug) : undefined;
  const catOf = (sub: SubInput): string | undefined => toolOf(sub)?.category ?? sub.category;
  const catLabel = (cat: string) => cat;

  /* ── 1. Duplicate capabilities ─────────────────────────────────────────
   * Two paid subscriptions in the same catalog job = the same capability
   * bought twice. Keep the first (assumed primary); the second is the
   * cancel candidate. */
  const byCat = new Map<string, SubInput[]>();
  for (const sub of subs) {
    const cat = catOf(sub);
    if (!cat || sub.monthlyUsd <= 0) continue;
    byCat.set(cat, [...(byCat.get(cat) ?? []), sub]);
  }
  for (const [cat, group] of byCat) {
    if (group.length < 2) continue;
    const sorted = [...group].sort((a, b) => b.monthlyUsd - a.monthlyUsd);
    const kept = sorted[0];
    for (const dup of sorted.slice(1)) {
      if (actionTaken.has(dup.id)) continue;
      actionTaken.add(dup.id);
      findings.push({
        kind: 'duplicate',
        subId: dup.id,
        title: `Two subscriptions doing ${catLabel(cat).toLowerCase()}`,
        detail: `${dup.name} (${fmt(dup.monthlyUsd)}) overlaps with ${kept.name} (${fmt(kept.monthlyUsd)}). Keep the one you actually reach for and cancel the other.`,
        savings: round2(Math.min(dup.monthlyUsd, kept.monthlyUsd)),
      });
    }
  }

  /* ── 2. Free tier covers the job ───────────────────────────────────────
   * The user pays for a tool whose own free tier covers the basics, or a
   * same-job catalog tool has a genuinely free entry. */
  for (const sub of subs) {
    if (actionTaken.has(sub.id) || sub.monthlyUsd <= 0) continue;
    const tool = toolOf(sub);
    if (!tool) continue;

    const ownFree = tool.pricing === 'Free' || tool.pricing === 'Freemium';
    if (ownFree) {
      actionTaken.add(sub.id);
      findings.push({
        kind: 'free-tier',
        subId: sub.id,
        altSlug: tool.slug,
        title: `${tool.name} has a free tier`,
        detail: `${tool.name} is ${tool.pricing.toLowerCase()} in the catalog — the free tier covers the basics. If your paid plan is only for volume or removal of limits, downgrade; if not, cancel.`,
        savings: sub.monthlyUsd,
      });
      continue;
    }

    const freeAlt = ALL_TOOLS.find(
      (t) =>
        t.slug !== tool.slug &&
        t.category === tool.category &&
        (t.pricing === 'Free' || t.pricing === 'Freemium')
    );
    if (freeAlt) {
      actionTaken.add(sub.id);
      findings.push({
        kind: 'free-tier',
        subId: sub.id,
        altSlug: freeAlt.slug,
        title: `${freeAlt.name} does ${catLabel(tool.category).toLowerCase()} for $0`,
        detail: `${sub.name} (${fmt(sub.monthlyUsd)}) and ${freeAlt.name} cover the same job. ${freeAlt.name} is free${freeAlt.startingPrice ? ` (paid from ${freeAlt.startingPrice})` : ''} — worth a month of testing before renewing.`,
        savings: sub.monthlyUsd,
      });
    }
  }

  /* ── 3. Cheaper same-job alternative ─────────────────────────────────── */
  for (const sub of subs) {
    if (actionTaken.has(sub.id) || sub.monthlyUsd <= 0) continue;
    const tool = toolOf(sub);
    if (!tool) continue;
    const current = monthlyCost(tool.startingPrice);
    if (current <= 0) continue;

    const cheaper = ALL_TOOLS.filter(
      (t) =>
        t.slug !== tool.slug &&
        t.category === tool.category &&
        (t.pricing === 'Free' || t.pricing === 'Freemium' || monthlyCost(t.startingPrice) > 0) &&
        monthlyCost(t.startingPrice) < current
    ).sort((a, b) => monthlyCost(a.startingPrice) - monthlyCost(b.startingPrice))[0];

    const save = current - (cheaper ? monthlyCost(cheaper.startingPrice) : Infinity);
    if (cheaper && save >= MIN_SWAP_SAVINGS) {
      actionTaken.add(sub.id);
      findings.push({
        kind: 'cheaper',
        subId: sub.id,
        altSlug: cheaper.slug,
        title: `${cheaper.name} does the same job for less`,
        detail: `${sub.name} starts at ${tool.startingPrice ?? current} — ${cheaper.name} starts at ${cheaper.startingPrice ?? 'free'} for the same ${catLabel(tool.category).toLowerCase()} job. Trial before you cancel; the catalog entry shows what we verified about each.`,
        savings: round2(save),
      });
    }
  }

  findings.sort((a, b) => b.savings - a.savings);
  const monthlySavings = round2(findings.reduce((s, f) => s + f.savings, 0));
  const optimizedTotal = Math.max(0, round2(currentTotal - monthlySavings));
  const unanalysed = subs.filter((s) => !toolOf(s) && s.monthlyUsd > 0).length;

  return {
    currentTotal,
    optimizedTotal,
    monthlySavings,
    yearlySavings: round2(monthlySavings * 12),
    findings,
    unanalysed,
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function fmt(n: number): string {
  return `$${n % 1 === 0 ? n : n.toFixed(2)}`;
}

/** Suggested quick-add rows for tools creators most often over-subscribe to. */
export function quickAddCandidates(limit = 12): Tool[] {
  const popular = [
    'chatgpt',
    'claude',
    'canva',
    'midjourney',
    'runway',
    'elevenlabs',
    'descript',
    'opusclip',
    'tubebuddy',
    'heygen',
    'capcut',
    'invideo',
  ];
  const found = popular
    .map((s) => ALL_TOOLS.find((t) => t.slug === s))
    .filter((t): t is Tool => Boolean(t));
  if (found.length >= limit) return found.slice(0, limit);
  const seen = new Set(found.map((t) => t.slug));
  for (const t of ALL_TOOLS) {
    if (found.length >= limit) break;
    if (!seen.has(t.slug) && t.pricing !== 'Free') {
      found.push(t);
      seen.add(t.slug);
    }
  }
  return found;
}
