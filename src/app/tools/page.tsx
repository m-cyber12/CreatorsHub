import type { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ToolCard } from '@/components/ToolCard';
import { CompareBar } from '@/components/CompareBar';
import { ToolsFilterBar } from './ToolsFilterBar';
import { Pagination } from '@/components/Pagination';
import { ALL_TOOLS } from '@/data/tools';
import { SITE_URL } from '@/config/site';
import {
  parseToolQuery,
  filterTools,
  paginate,
  facetCounts,
  buildToolsHref,
  PAGE_SIZE,
} from '@/lib/toolFilters';

/**
 * ⭐ Audit fix 1.4 — the single highest-impact SEO change in this pass.
 *
 * This page was previously:
 *     export default function ToolsPage() {
 *       return <Suspense><ToolsClient /></Suspense>;
 *     }
 * with ToolsClient marked "use client". Verified against production:
 *     curl -s https://directory-ai-hub.vercel.app/tools | grep -c "OpusClip"  → 0
 * The main catalog page delivered Google an empty document, and the
 * "Load More" button meant 176 of 200 tools were unreachable by any crawler.
 *
 * It is now a Server Component: tools render into the HTML, filters are a
 * small client island, and pagination uses real <a href> links.
 */

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const query = parseToolQuery(await searchParams);
  const filtered = filterTools(query);
  const { totalPages, page } = paginate(filtered, query.page);

  const scope =
    query.category !== 'All'
      ? `${query.category} AI Tools`
      : `All ${ALL_TOOLS.length} AI Tools for Video Creators`;
  const pageSuffix = page > 1 ? ` — Page ${page}` : '';

  /**
   * Audit fix 3.3 — /tools?q=X&category=Y&sort=Z generated unlimited
   * near-duplicate URLs. Deep combinations are now noindex'd (still followed,
   * so tools stay crawlable) and the canonical always points at the clean
   * category view.
   */
  const isDeepCombo = Boolean(query.q) || query.pricing !== 'All' || query.testedOnly;

  return {
    title: `${scope}${pageSuffix} (2026)`,
    description:
      query.category !== 'All'
        ? `Browse every ${query.category} AI tool for video creators — filter by pricing, compare side by side, and see which ones we have actually tested.`
        : `Browse ${ALL_TOOLS.length} AI tools for video creators. Filter by category and pricing, compare side by side, and see exactly which tools we have tested hands-on.`,
    alternates: {
      canonical: isDeepCombo
        ? buildToolsHref({ category: query.category })
        : buildToolsHref({ category: query.category, pricing: query.pricing, sort: query.sort }, page),
    },
    robots: isDeepCombo
      ? { index: false, follow: true }
      : { index: true, follow: true },
    openGraph: {
      title: `${scope}${pageSuffix}`,
      description: 'Filter by category and pricing. We label exactly what we have tested.',
      url: buildToolsHref({ category: query.category }, page),
    },
    other: {
      ...(page > 1 && { 'pagination-total': String(totalPages) }),
    },
  };
}

export default async function ToolsPage({ searchParams }: { searchParams: SearchParams }) {
  const query = parseToolQuery(await searchParams);
  const filtered = filterTools(query);
  const { items, page, totalPages, total } = paginate(filtered, query.page, PAGE_SIZE);
  const facets = facetCounts();

  // ItemList structured data describing what is actually on this page.
  const itemListLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: query.category !== 'All' ? `${query.category} AI Tools` : 'AI Tools for Video Creators',
    numberOfItems: total,
    itemListElement: items.map((tool, i) => ({
      '@type': 'ListItem',
      position: (page - 1) * PAGE_SIZE + i + 1,
      url: `${SITE_URL}/tool/${tool.slug}`,
      name: tool.name,
    })),
  };

  return (
    <div className="min-h-screen bg-surface-0 text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
      />
      <Header />

      <main id="main" className="px-4 pt-8 pb-20">
        <div className="mx-auto max-w-7xl">
          <nav aria-label="Breadcrumb" className="mb-4 text-2xs text-zinc-500">
            <Link href="/" className="hover:text-accent-400">
              Home
            </Link>
            <span className="mx-1.5">/</span>
            <span className="text-zinc-300">
              {query.category !== 'All' ? query.category : 'All Tools'}
            </span>
          </nav>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {query.category !== 'All' ? `${query.category} Tools` : 'All AI Tools'}
          </h1>

          {/*
            Audit fix 1.1 — this line used to read "independently reviewed,
            pricing verified August 2026" for all 200 tools. It now states the
            real, checkable numbers.
          */}
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
            {total.toLocaleString()} {total === 1 ? 'tool' : 'tools'} for video creators.{' '}
            {facets.tested > 0 ? (
              <>
                We have hands-on tested{' '}
                <Link href={buildToolsHref({ testedOnly: true })} className="text-accent-400 underline hover:text-accent-300">
                  {facets.tested} of them
                </Link>
                ; the rest are catalogued from public sources and labelled as such.
              </>
            ) : (
              <>
                Every entry is labelled with exactly how far we have verified it — hands-on tested,
                pricing checked, or listed only. We never claim a test we did not run.
              </>
            )}
          </p>

          <ToolsFilterBar query={query} facets={facets} resultCount={total} />

          {items.length === 0 ? (
            <div className="mt-12 rounded-2xl border border-white/10 bg-surface-1 p-10 text-center">
              <p className="text-lg font-semibold text-zinc-200">No tools match those filters.</p>
              <p className="mt-2 text-sm text-zinc-400">
                Try removing a filter, or{' '}
                <Link href="/tools" className="text-accent-400 underline hover:text-accent-300">
                  browse all {ALL_TOOLS.length} tools
                </Link>
                .
              </p>
              <p className="mt-4 text-sm text-zinc-400">
                Looking for something we do not list?{' '}
                <Link href="/submit" className="text-accent-400 underline hover:text-accent-300">
                  Suggest a tool
                </Link>
                .
              </p>
            </div>
          ) : (
            <>
              <p className="mt-6 text-2xs text-zinc-500" aria-live="polite">
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of{' '}
                {total.toLocaleString()}
              </p>

              {/* Server-rendered: these <li> elements exist in the raw HTML. */}
              <ul className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {items.map((tool, i) => (
                  <li key={tool.slug}>
                    <ToolCard tool={tool} index={i} priority={i < 4} />
                  </li>
                ))}
              </ul>

              <Pagination
                page={page}
                totalPages={totalPages}
                hrefFor={(p) => buildToolsHref(query, p)}
              />
            </>
          )}
        </div>
      </main>

      <CompareBar />
      <Footer />
    </div>
  );
}
