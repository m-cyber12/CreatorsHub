import {
  ALL_TOOLS,
  CATEGORIES,
  PRICING_OPTIONS,
  hasVerifiedScore,
  computeOverall,
  type Tool,
  type Category,
  type PricingOption,
} from '@/data/tools';
import { searchToolsAdvanced } from '@/lib/search';

/**
 * Shared, pure filtering/sorting used by BOTH the server-rendered /tools page
 * and the client filter island, so server HTML and client interaction can
 * never disagree.
 *
 * Audit fix 1.4 — /tools used to be a bare <Suspense><ToolsClient /></Suspense>
 * with everything built in the browser. Verified against the live site:
 *   curl -s .../tools | grep -c "OpusClip"   →  0
 * The most important SEO page on the site served Google an empty shell.
 */

export const PAGE_SIZE = 24;

export type SortKey = 'relevance' | 'rating' | 'newest' | 'price-low' | 'price-high' | 'name';

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'relevance', label: 'Best match' },
  { value: 'rating', label: 'Highest rated' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-low', label: 'Price: low to high' },
  { value: 'price-high', label: 'Price: high to low' },
  { value: 'name', label: 'Name A–Z' },
];

export interface ToolQuery {
  q: string;
  category: Category;
  pricing: PricingOption;
  sort: SortKey;
  page: number;
  /** Only show tools we have actually run. */
  testedOnly: boolean;
}

/** Parse untrusted search params into a validated query. */
export function parseToolQuery(sp: Record<string, string | string[] | undefined>): ToolQuery {
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? '';

  const rawCategory = one(sp.category);
  const rawPricing = one(sp.pricing);
  const rawSort = one(sp.sort) as SortKey;
  const pageNum = parseInt(one(sp.page) || '1', 10);

  return {
    q: one(sp.q).slice(0, 80),
    category: (CATEGORIES as readonly string[]).includes(rawCategory)
      ? (rawCategory as Category)
      : 'All',
    pricing: (PRICING_OPTIONS as readonly string[]).includes(rawPricing)
      ? (rawPricing as PricingOption)
      : 'All',
    sort: SORT_OPTIONS.some((o) => o.value === rawSort) ? rawSort : 'relevance',
    page: Number.isFinite(pageNum) && pageNum > 0 ? Math.min(pageNum, 500) : 1,
    testedOnly: one(sp.tested) === '1',
  };
}

function priceValue(s?: string): number {
  if (!s) return 0;
  const m = s.match(/[\d.]+/);
  return m ? parseFloat(m[0]) : 0;
}

/** Sort value for a tool: verified score first, else fall back to legacy rating. */
function rankValue(t: Tool): number {
  if (hasVerifiedScore(t) && t.scores) return computeOverall(t.scores);
  return t.rating;
}

export function filterTools(query: ToolQuery, source: Tool[] = ALL_TOOLS): Tool[] {
  let result = source;

  if (query.category !== 'All') result = result.filter((t) => t.category === query.category);
  if (query.pricing !== 'All') result = result.filter((t) => t.pricing === query.pricing);
  if (query.testedOnly) result = result.filter(hasVerifiedScore);

  const searched = query.q.trim().length > 0;
  if (searched) result = searchToolsAdvanced(query.q, result, 400);

  // 'relevance' keeps the search engine's ordering; with no query it means
  // "tools we can actually vouch for first".
  if (query.sort === 'relevance' && searched) return result;

  const sorted = [...result];
  switch (query.sort) {
    case 'newest':
      sorted.sort((a, b) => (b.launchDate || '').localeCompare(a.launchDate || ''));
      break;
    case 'price-low':
      sorted.sort((a, b) => priceValue(a.startingPrice) - priceValue(b.startingPrice));
      break;
    case 'price-high':
      sorted.sort((a, b) => priceValue(b.startingPrice) - priceValue(a.startingPrice));
      break;
    case 'name':
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'rating':
      sorted.sort((a, b) => rankValue(b) - rankValue(a));
      break;
    case 'relevance':
    default:
      sorted.sort((a, b) => {
        const av = hasVerifiedScore(a) ? 1 : 0;
        const bv = hasVerifiedScore(b) ? 1 : 0;
        if (av !== bv) return bv - av;
        return rankValue(b) - rankValue(a);
      });
  }
  return sorted;
}

export function paginate<T>(items: T[], page: number, size = PAGE_SIZE) {
  const totalPages = Math.max(1, Math.ceil(items.length / size));
  const safePage = Math.min(Math.max(1, page), totalPages);
  return {
    items: items.slice((safePage - 1) * size, safePage * size),
    page: safePage,
    totalPages,
    total: items.length,
  };
}

/** Build a canonical query string, omitting defaults so URLs stay clean. */
export function buildToolsHref(q: Partial<ToolQuery>, page?: number): string {
  const sp = new URLSearchParams();
  if (q.q) sp.set('q', q.q);
  if (q.category && q.category !== 'All') sp.set('category', q.category);
  if (q.pricing && q.pricing !== 'All') sp.set('pricing', q.pricing);
  if (q.sort && q.sort !== 'relevance') sp.set('sort', q.sort);
  if (q.testedOnly) sp.set('tested', '1');
  if (page && page > 1) sp.set('page', String(page));
  const s = sp.toString();
  return `/tools${s ? `?${s}` : ''}`;
}

/** Counts per category/pricing so filter labels can show "(30)" (audit 4.4). */
export function facetCounts(source: Tool[] = ALL_TOOLS) {
  const category = new Map<string, number>();
  const pricing = new Map<string, number>();
  for (const t of source) {
    category.set(t.category, (category.get(t.category) || 0) + 1);
    pricing.set(t.pricing, (pricing.get(t.pricing) || 0) + 1);
  }
  return {
    category,
    pricing,
    tested: source.filter(hasVerifiedScore).length,
    total: source.length,
  };
}
