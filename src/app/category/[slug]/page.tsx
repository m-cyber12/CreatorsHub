import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { hasVerifiedScore } from '@/data/tools';
import { SITE_URL } from '@/config/site';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ToolCard } from '@/components/ToolCard';
import { CompareBar } from '@/components/CompareBar';
import {
  REAL_CATEGORIES,
  categorySlug,
  categoryFromSlug,
  CATEGORY_CONTENT,
  getCategoryTools,
} from '@/lib/categories';

/**
 * Audit fix 3.1 — /category/[slug], 13 pages of high-intent search traffic
 * that previously did not exist. Each carries hand-written editorial copy
 * (see lib/categories.ts) so it is a genuine guide rather than a doorway page
 * wrapping a filtered list.
 */

export const dynamicParams = false;

export function generateStaticParams() {
  return REAL_CATEGORIES.map((c) => ({ slug: categorySlug(c) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = categoryFromSlug(slug);
  if (!category) return { title: 'Category not found' };

  const tools = getCategoryTools(category);
  const free = tools.filter((t) => t.pricing === 'Free' || t.pricing === 'Freemium').length;

  return {
    title: `${tools.length} Best ${category} AI Tools for Video Creators (2026)`,
    description: `Every ${category.toLowerCase()} AI tool we track — ${tools.length} options, ${free} with a free tier. What actually matters when choosing, and which ones we have tested hands-on.`,
    alternates: { canonical: `/category/${slug}` },
    openGraph: {
      title: `${tools.length} Best ${category} AI Tools (2026)`,
      description: `${free} of ${tools.length} have a free tier. Compared on price, capability and export freedom.`,
      url: `/category/${slug}`,
      type: 'article',
    },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = categoryFromSlug(slug);
  if (!category) notFound();

  const tools = getCategoryTools(category);
  const content = CATEGORY_CONTENT[category];
  const freeTools = tools.filter((t) => t.pricing === 'Free' || t.pricing === 'Freemium');
  const testedCount = tools.filter(hasVerifiedScore).length;

  const sorted = [...tools].sort((a, b) => {
    const av = hasVerifiedScore(a) ? 1 : 0;
    const bv = hasVerifiedScore(b) ? 1 : 0;
    if (av !== bv) return bv - av;
    return b.rating - a.rating;
  });

  const itemListLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${category} AI tools`,
    numberOfItems: sorted.length,
    itemListElement: sorted.map((t, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${SITE_URL}/tool/${t.slug}`,
      name: t.name,
    })),
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'All Tools', item: `${SITE_URL}/tools` },
      { '@type': 'ListItem', position: 3, name: category, item: `${SITE_URL}/category/${slug}` },
    ],
  };

  return (
    <div className="min-h-screen bg-surface-0 text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <Header />

      <main id="main" className="mx-auto max-w-6xl px-4 py-10">
        <nav aria-label="Breadcrumb" className="mb-4 text-2xs text-zinc-500">
          <Link href="/" className="hover:text-accent-400">Home</Link>
          <span className="mx-1.5">/</span>
          <Link href="/tools" className="hover:text-accent-400">Tools</Link>
          <span className="mx-1.5">/</span>
          <span className="text-zinc-300">{category}</span>
        </nav>

        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
          {category} AI tools for video creators
        </h1>

        <div className="mt-4 flex flex-wrap gap-4 text-sm text-zinc-400">
          <span>
            <strong className="font-mono tabular-nums text-white">{tools.length}</strong> tools
          </span>
          <span>
            <strong className="font-mono tabular-nums text-emerald-400">{freeTools.length}</strong>{' '}
            with a free tier
          </span>
          <span>
            <strong className="font-mono tabular-nums text-accent-400">{testedCount}</strong>{' '}
            hands-on tested
          </span>
        </div>

        {content && (
          <>
            <p className="mt-6 max-w-3xl text-base leading-relaxed text-zinc-300">
              {content.intro}
            </p>

            <section className="mt-8 rounded-2xl border border-white/10 bg-surface-1 p-6">
              <h2 className="text-lg font-bold">What actually matters when choosing</h2>
              <ul className="mt-4 space-y-2.5">
                {content.whatMatters.map((point) => (
                  <li key={point} className="flex gap-2.5 text-sm leading-relaxed text-zinc-300">
                    <span aria-hidden="true" className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500" />
                    {point}
                  </li>
                ))}
              </ul>
              <p className="mt-4 border-t border-white/5 pt-4 text-sm italic leading-relaxed text-zinc-400">
                {content.reality}
              </p>
            </section>
          </>
        )}

        {freeTools.length > 0 && (
          <p className="mt-6 text-sm text-zinc-400">
            Only want the free options?{' '}
            <Link
              href={`/tools?category=${encodeURIComponent(category)}&pricing=Free`}
              className="text-accent-400 underline hover:text-accent-300"
            >
              Filter to free {category.toLowerCase()} tools
            </Link>
            .
          </p>
        )}

        <section className="mt-10">
          <h2 className="mb-5 text-2xl font-bold">
            All {tools.length} {category.toLowerCase()} tools
          </h2>
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sorted.map((tool, i) => (
              <li key={tool.slug}>
                <ToolCard tool={tool} index={i} priority={i < 4} />
              </li>
            ))}
          </ul>
        </section>

        {/* Internal linking to sibling categories */}
        <section className="mt-14 border-t border-white/5 pt-8">
          <h2 className="text-lg font-bold">Other categories</h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {REAL_CATEGORIES.filter((c) => c !== category).map((c) => (
              <li key={c}>
                <Link
                  href={`/category/${categorySlug(c)}`}
                  className="inline-block rounded-full border border-white/10 bg-surface-1 px-3 py-1.5 text-2xs font-semibold text-zinc-400 hover:border-accent-500/40 hover:text-accent-300"
                >
                  {c}{' '}
                  <span className="font-mono tabular-nums opacity-60">
                    {getCategoryTools(c).length}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <CompareBar />
      <Footer />
    </div>
  );
}
