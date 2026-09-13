import type { Tool } from '@/data/tools';
import { OUTCOMES } from '@/data/outcomes';

/**
 * Intent search (P2) — understand the creator's outcome, not just keywords.
 *
 * Pure functions, no network, no LLM. The parser recognizes:
 *  - budgets: "under $30", "below €50", "< $20", "max $100"
 *  - free / cheap modifiers: "free", "cheap", "budget", "affordable"
 *  - versus: "runway vs pika", "opus or descript", "a compared to b"
 *  - outcomes: "dubbing", "podcast to shorts", "faceless youtube", ...
 *  - stack requests: "stack", "bundle", "toolkit", "workflow", "pipeline"
 *
 * Keyword matching is English-based; other locales gracefully degrade to
 * the existing substring search (no intent panel, same results as before).
 * Price comparison is numeric against listed USD starting prices.
 */

export interface PriceCap {
  amount: number;
  /** Currency symbol exactly as written ($, €, £) or '' for bare numbers. */
  currency: string;
  /** Verbatim fragment, e.g. "under $30". */
  raw: string;
}

export interface VersusSide {
  name: string;
  slug?: string;
}

export interface VersusIntent {
  a: VersusSide;
  b: VersusSide;
}

export interface OutcomeMatch {
  slug: string;
  title: string;
  intent: string;
  matched: string[];
}

export interface ParsedIntent {
  priceCap?: PriceCap;
  freeOnly: boolean;
  cheapFirst: boolean;
  versus?: VersusIntent;
  stackIntent: boolean;
  outcomes: OutcomeMatch[];
  /** Residual keywords used for tool scoring. */
  keywords: string[];
  /** True when any signal fired (cap/free/cheap/versus/stack/outcome). */
  hasSignal: boolean;
}

const STOPWORDS = new Set(
  'a,an,the,and,or,for,to,of,in,on,with,that,this,from,into,me,my,i,want,need,looking,find,get,show,best,top,good,great,ai,app,apps,tool,tools,video,videos,create,make,maker,generator,using,use,easy,simple,2026,2025,please,any,are,is,there,which,what,how,do,does,turn,turns,way,like'.split(',')
);

const STACK_WORDS = new Set(['stack', 'bundle', 'toolkit', 'toolkit', 'workflow', 'pipeline', 'setup', 'kit', 'system', 'combo']);
const CHEAP_WORDS = new Set(['cheap', 'cheapest', 'budget', 'affordable', 'inexpensive', 'low-cost', 'lowcost']);
const FREE_WORDS = new Set(['free']);

/** Outcome phrases, longest-first matching. Every slug must exist in OUTCOMES. */
const OUTCOME_KEYWORDS: { slug: string; phrases: string[] }[] = [
  { slug: 'podcast-to-shorts', phrases: ['podcast to shorts', 'podcast into shorts', 'podcast clips', 'turn podcast', 'podcast repurpose', 'repurpose podcast', 'episode to clips', 'episode into clips'] },
  { slug: 'faceless-youtube', phrases: ['faceless youtube', 'faceless channel', 'faceless', 'no face', 'without showing', 'anonymous channel', 'cash cow channel', 'automated channel', 'youtube automation'] },
  { slug: 'ai-thumbnail', phrases: ['thumbnail', 'thumbnails', 'thumb nail', 'video cover', 'clickable cover'] },
  { slug: 'short-form-video', phrases: ['short form video', 'short-form video', 'shorts', 'short video', 'reels', 'tiktok', 'tik tok', 'viral clips', 'clips'] },
  { slug: 'ai-voiceover', phrases: ['voiceover', 'voice over', 'voice-over', 'voice over', 'narration', 'narrate', 'text to speech', 'text-to-speech', 'tts', 'ai voice', 'voice ai', 'voice generator', 'voice cloning', 'voiceover artist'] },
  { slug: 'ai-ugc', phrases: ['ugc', 'user generated', 'avatar ad', 'spokesperson', 'ai actor', 'ai influencer', 'virtual influencer', 'product avatar'] },
  { slug: 'ai-podcast', phrases: ['start a podcast', 'create a podcast', 'text to podcast', 'ai podcast', 'podcast editing', 'podcast edit', 'podcast maker', 'podcast generator'] },
  { slug: 'dubbed-content', phrases: ['dubbing', 'dubbed', 'dub my', 'translate video', 'translate my video', 'multilingual video', 'video translation', 'localization', 'localisation', 'spanish version', 'other languages'] },
];

// All three patterns share one group layout: m[1] = currency, m[2] = amount.
// (Positional groups: the TS target predates ES2018 named groups.)
const CAP_PATTERNS: RegExp[] = [
  /\b(?:under|below|less than|max(?:imum)?|up to)\s*([$€£]?)\s*(\d+(?:[.,]\d+)?)/i,
  // Bare "< $20" / "≤€50" — no word boundary before the operator.
  /(?:^|\s)(?:<|≤)\s*([$€£]?)\s*(\d+(?:[.,]\d+)?)/,
  /([$€£])\s*(\d+(?:[.,]\d+)?)\s*(?:or less|max|and under)\b/i,
];

const VERSUS_SPLIT = /\s+(?:vs\.?|versus|compared to|or)\s+/i;

/**
 * Monthly USD equivalent of a startingPrice string, or null when the price
 * cannot be compared to a monthly budget (usage-based, custom, unknown).
 * Yearly prices are divided by 12. "Free" is 0.
 */
export function priceMonthlyEquivalent(startingPrice: string | undefined): number | null {
  if (!startingPrice) return null;
  const s = startingPrice.trim().toLowerCase();
  if (!s) return null;
  if (s.startsWith('free')) return 0;
  if (/custom|contact|quote|varies|negotiat|enterprise|let's talk|talk to sales/.test(s)) return null;
  const numMatch = s.replace(/,/g, '').match(/(\d+(?:\.\d+)?)/);
  if (!numMatch) return null;
  const n = parseFloat(numMatch[1]);
  if (!Number.isFinite(n)) return null;
  if (/\/(min|sec|hr|hour|img|image|video|credit|page|word|request|call|task)\b/.test(s)) return null;
  if (/\/(yr|year|annual)\b/.test(s)) return n / 12;
  return n;
}

function normalizeName(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function resolveToolName(name: string, tools: Tool[]): Tool | undefined {
  const norm = normalizeName(name);
  if (!norm) return undefined;
  return (
    tools.find((t) => t.slug === norm.replace(/\s+/g, '-')) ??
    tools.find((t) => normalizeName(t.name) === norm) ??
    tools.find((t) => normalizeName(t.name).startsWith(norm) || norm.startsWith(normalizeName(t.name)))
  );
}

function parseCap(q: string): { cap?: PriceCap; rest: string } {
  for (const re of CAP_PATTERNS) {
    const m = q.match(re);
    if (!m || m[2] === undefined) continue;
    const amount = parseFloat(m[2].replace(',', '.'));
    if (!Number.isFinite(amount) || amount < 0) continue;
    return {
      cap: { amount, currency: m[1] ?? '', raw: m[0].trim() },
      rest: q.replace(m[0], ' '),
    };
  }
  return { rest: q };
}

function parseVersus(q: string, tools: Tool[]): { versus?: VersusIntent; rest: string } {
  if (!VERSUS_SPLIT.test(q)) return { rest: q };
  const parts = q.split(VERSUS_SPLIT);
  if (parts.length !== 2) return { rest: q };
  const [left, right] = parts.map((p) => p.trim().replace(/^[?,.\s]+|[?,.\s]+$/g, ''));
  if (!left || !right) return { rest: q };
  // Only treat as versus when BOTH sides resolve to catalog tools —
  // "free or cheap" must never become a versus panel.
  const a = resolveToolName(left, tools);
  const b = resolveToolName(right, tools);
  if (!a || !b || a.slug === b.slug) return { rest: q };
  return { versus: { a: { name: a.name, slug: a.slug }, b: { name: b.name, slug: b.slug } }, rest: '' };
}

function matchOutcomes(q: string): { outcomes: OutcomeMatch[]; rest: string } {
  const lowered = ` ${q.toLowerCase()} `;
  const outcomes: OutcomeMatch[] = [];
  let rest = q;
  for (const entry of OUTCOME_KEYWORDS) {
    const matched = entry.phrases.filter((p) => lowered.includes(p));
    if (matched.length === 0) continue;
    const outcome = OUTCOMES.find((o) => o.slug === entry.slug);
    if (!outcome) continue;
    outcomes.push({ slug: outcome.slug, title: outcome.title, intent: outcome.intent, matched });
  }
  // Keep outcome words as tool keywords too (tagged tools exist), so `rest`
  // is unchanged — outcomes are additive, not consumptive.
  return { outcomes, rest };
}

function extractKeywords(q: string): string[] {
  const words = q
    .toLowerCase()
    .replace(/[^a-z0-9$€£.\s-]/g, ' ')
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length >= 2 && !STOPWORDS.has(w) && !STACK_WORDS.has(w) && !CHEAP_WORDS.has(w) && !FREE_WORDS.has(w))
    .map((w) => w.replace(/[$€£.,-]+$/g, '').replace(/^[$€£.,-]+/g, ''))
    .filter((w) => w.length >= 2 && !STOPWORDS.has(w));
  return [...new Set(words)];
}

export function parseIntent(q: string, tools: Tool[]): ParsedIntent {
  const query = q.trim().slice(0, 80);
  const lowered = query.toLowerCase();

  const { cap, rest: afterCap } = parseCap(query);
  const { versus, rest: afterVersus } = parseVersus(afterCap, tools);
  const { outcomes } = matchOutcomes(afterVersus);

  const words = new Set(lowered.split(/[^a-z-]+/).filter(Boolean));
  const freeOnly = [...FREE_WORDS].some((w) => words.has(w));
  const cheapFirst = [...CHEAP_WORDS].some((w) => words.has(w));
  const stackIntent = [...STACK_WORDS].some((w) => words.has(w));

  const keywords = versus ? [] : extractKeywords(afterVersus);
  const hasSignal =
    cap !== undefined ||
    freeOnly ||
    cheapFirst ||
    versus !== undefined ||
    stackIntent ||
    outcomes.length > 0;

  return { priceCap: cap, freeOnly, cheapFirst, versus, stackIntent, outcomes, keywords, hasSignal };
}

/* ── Matching ─────────────────────────────────────────────────────────── */

const VERIFIED_RANK: Record<string, number> = { 'hands-on-tested': 0, 'pricing-verified': 1, 'listed-only': 2 };

function outcomeToolSlugs(outcomes: OutcomeMatch[]): Set<string> {
  const slugs = new Set<string>();
  for (const m of outcomes) {
    const o = OUTCOMES.find((x) => x.slug === m.slug);
    if (!o) continue;
    for (const job of o.jobs) {
      slugs.add(job.tool);
      for (const alt of job.alternatives) slugs.add(alt);
    }
  }
  return slugs;
}

function scoreTool(tool: Tool, keywords: string[], outcomeSlugs: Set<string>): number {
  const name = tool.name.toLowerCase();
  const category = tool.category.toLowerCase();
  const tags = tool.tags.map((t) => t.toLowerCase());
  const bestFor = (tool.bestFor ?? '').toLowerCase();
  let score = 0;
  for (const kw of keywords) {
    if (name.includes(kw)) score += 3;
    else if (category.includes(kw)) score += 2;
    else if (tags.some((t) => t.includes(kw))) score += 2;
    else if (bestFor.includes(kw)) score += 2;
  }
  // Outcome-guide picks outrank plain keyword matches: the guide is the
  // strongest statement of "this tool serves this intent" we have.
  if (outcomeSlugs.has(tool.slug)) score += 4;
  return score;
}

export interface IntentSearchResult {
  intent: ParsedIntent;
  /** Matched tools, best-first. Empty when nothing matches (honest zero). */
  tools: Tool[];
  /** Keyword-matched tools hidden by the budget because their price is usage-based/unknown. */
  usagePricedHidden: number;
}

/**
 * Intent-first search over an already facet-filtered tool list.
 * When the query carries no intent signal, returns hasSignal=false and the
 * caller should fall back to plain substring search.
 */
export function intentSearch(q: string, tools: Tool[], limit = 400): IntentSearchResult {
  const intent = parseIntent(q, tools);
  if (!intent.hasSignal) return { intent, tools: [], usagePricedHidden: 0 };

  const outcomeSlugs = outcomeToolSlugs(intent.outcomes);
  let candidates: { tool: Tool; score: number }[];

  if (intent.keywords.length === 0 && !intent.versus) {
    // Pure filter query ("free", "under $30") — every tool is a candidate.
    candidates = tools.map((tool) => ({ tool, score: outcomeSlugs.has(tool.slug) ? 4 : 0 }));
  } else if (intent.versus) {
    const slugs = new Set([intent.versus.a.slug, intent.versus.b.slug]);
    candidates = tools.filter((t) => t.slug && slugs.has(t.slug)).map((tool) => ({ tool, score: 10 }));
  } else {
    candidates = tools
      .map((tool) => ({ tool, score: scoreTool(tool, intent.keywords, outcomeSlugs) }))
      .filter((c) => c.score > 0);
  }

  if (intent.freeOnly) {
    candidates = candidates.filter((c) => c.tool.pricing === 'Free');
  }

  let usagePricedHidden = 0;
  if (intent.priceCap) {
    const kept: typeof candidates = [];
    for (const c of candidates) {
      const equiv = priceMonthlyEquivalent(c.tool.startingPrice);
      if (equiv === null) {
        usagePricedHidden += 1;
        continue;
      }
      if (equiv <= intent.priceCap.amount) kept.push(c);
    }
    candidates = kept;
  }

  candidates.sort((a, b) => {
    if (intent.cheapFirst && !intent.versus) {
      const pa = priceMonthlyEquivalent(a.tool.startingPrice);
      const pb = priceMonthlyEquivalent(b.tool.startingPrice);
      const na = pa === null ? Number.POSITIVE_INFINITY : pa;
      const nb = pb === null ? Number.POSITIVE_INFINITY : pb;
      if (na !== nb) return na - nb;
    }
    if (b.score !== a.score) return b.score - a.score;
    const va = VERIFIED_RANK[a.tool.verificationLevel] ?? 2;
    const vb = VERIFIED_RANK[b.tool.verificationLevel] ?? 2;
    if (va !== vb) return va - vb;
    return a.tool.name.localeCompare(b.tool.name);
  });

  return { intent, tools: candidates.slice(0, limit).map((c) => c.tool), usagePricedHidden };
}
