import type { Metadata } from 'next';
import Link from '@/i18n/navigation';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ALL_TOOLS, hasVerifiedScore, computeOverall, type Tool } from '@/data/tools';
import { SITE_URL } from '@/config/site';
import { rankValue } from '@/lib/ranking';
import { localizedCategoryLabel } from '@/lib/i18n/content';
import { getEffectiveTool, getEffectiveTools } from '@/lib/contentOverrides';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ToolCard } from '@/components/ToolCard';
import { VerificationBadge } from '@/components/VerificationBadge';
import { ArrowLeft } from 'lucide-react';

/**
 * Audit fix 3.1 — programmatic SEO, highest-ROI template.
 *
 * "<tool> alternatives" is one of the highest-intent queries in this niche and
 * the site had no page for it. This generates one genuinely useful page per
 * tool from data already in the catalog.
 *
 * i18n (v3.3): every templated sentence lives in the `alternatives`
 * namespace with placeholders; tool names/tags/pricing stay canonical.
 */

export const dynamicParams = true;
export const revalidate = 30;

export function generateStaticParams() {
  return ALL_TOOLS.map((t) => ({ slug: t.slug }));
}

/** Pick the most defensible alternatives: same category, tested first. */
function getAlternatives(tool: Tool): Tool[] {
  const sameCategory = ALL_TOOLS.filter(
    (t) => t.slug !== tool.slug && t.category === tool.category
  );

  const scored = sameCategory.map((t) => {
    let relevance = 0;
    if (hasVerifiedScore(t)) relevance += 30;
    const sharedTags = t.tags.filter((tag) => tool.tags.includes(tag)).length;
    relevance += sharedTags * 8;
    if (t.pricing === tool.pricing) relevance += 5;
    if (t.pricing === 'Free' || t.pricing === 'Freemium') relevance += 6;
    // Honest nudge (audit fix 2.4): verification level, not fabricated rating.
    relevance += rankValue(t) * 0.01;
    return { tool: t, relevance };
  });

  return scored
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 8)
    .map((s) => s.tool);
}

function priceNum(s?: string): number | null {
  const m = s?.match(/[\d.]+/);
  return m ? parseFloat(m[0]) : null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
  const { slug, locale } = await params;
  const t = await getTranslations({ locale, namespace: 'alternatives' });
  const tool = await getEffectiveTool(slug);
  if (!tool) return { title: t('notFound') };

  const alts = getAlternatives(tool);
  const free = alts.filter((a) => a.pricing === 'Free' || a.pricing === 'Freemium').length;

  return {
    title: t('metaTitle', { count: String(alts.length), name: tool.name, free: String(free) }),
    description: t('metaDescription', {
      name: tool.name,
      count: String(alts.length),
      category: tool.category,
      free: String(free),
    }),
    alternates: { canonical: `/alternatives/${slug}` },
    openGraph: {
      title: t('ogTitle', { count: String(alts.length), name: tool.name }),
      description: t('ogDescription', { free: String(free) }),
      url: `/alternatives/${slug}`,
      type: 'article',
    },
  };
}

export default async function AlternativesPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'alternatives' });
  const tool = await getEffectiveTool(slug);
  if (!tool) notFound();

  const alts = getAlternatives(tool);
  if (alts.length === 0) notFound();

  const freeAlts = alts.filter((a) => a.pricing === 'Free' || a.pricing === 'Freemium');
  const cheaper = alts.filter((a) => {
    const ap = priceNum(a.startingPrice);
    const op = priceNum(tool.startingPrice);
    return ap !== null && op !== null && ap < op;
  });

  const toolCategoryLabel = await localizedCategoryLabel(tool.category, locale);

  const faqs = [
    {
      q: t('faqFreeQ', { name: tool.name }),
      a: freeAlts.length
        ? t('faqFreeA', {
            name: freeAlts[0].name,
            tagline: freeAlts[0].tagline.charAt(0).toLowerCase() + freeAlts[0].tagline.slice(1),
            tail:
              freeAlts[0].pricing === 'Freemium' ? t('faqFreeTailFreemium') : t('faqFreeTailFree'),
          })
        : t('faqFreeNone', {
            name: tool.name,
            category: toolCategoryLabel.toLowerCase(),
            alt: alts[0].name,
            price: alts[0].startingPrice ?? t('paidTier'),
          }),
    },
    {
      q: t('faqCheaperQ', { name: tool.name }),
      a: cheaper.length
        ? t('faqCheaperA', {
            count: String(cheaper.length),
            name: tool.name,
            price: tool.startingPrice ?? tool.pricing,
            cheapest: cheaper[cheaper.length - 1].name,
            cheapestPrice: cheaper[cheaper.length - 1].startingPrice ?? cheaper[cheaper.length - 1].pricing,
          })
        : t('faqCheaperNone', { name: tool.name, category: toolCategoryLabel.toLowerCase() }),
    },
    {
      q: t('faqSwitchQ', { name: tool.name }),
      a: t('faqSwitchA'),
    },
  ];

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  const itemListLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Best ${tool.name} alternatives`,
    numberOfItems: alts.length,
    itemListElement: alts.map((a, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${SITE_URL}/tool/${a.slug}`,
      name: a.name,
    })),
  };

  const differentiator = (alt: Tool, original: Tool): string => {
    const altPrice = priceNum(alt.startingPrice);
    const origPrice = priceNum(original.startingPrice);

    if (alt.pricing === 'Free' && original.pricing !== 'Free') {
      return t('differentiatorFree', {
        name: original.name,
        pricing: original.pricing.toLowerCase(),
      });
    }
    if (altPrice !== null && origPrice !== null && altPrice < origPrice) {
      const saving = Math.round(((origPrice - altPrice) / origPrice) * 100);
      return t('differentiatorCheaper', {
        pct: String(saving),
        priceA: alt.startingPrice ?? alt.pricing,
        priceB: original.startingPrice ?? original.pricing,
      });
    }
    if (hasVerifiedScore(alt) && !hasVerifiedScore(original)) {
      return t('differentiatorTested', { name: original.name });
    }
    const unique = alt.tags.filter((tag) => !original.tags.includes(tag));
    if (unique.length > 0) {
      return t('differentiatorUnique', {
        list: unique.slice(0, 2).join(' and '),
        name: original.name,
      });
    }
    if (alt.metrics) return t('differentiatorMetric', { metric: alt.metrics });
    return t('differentiatorDefault', { category: alt.category });
  };

  return (
    <div className="min-h-screen bg-surface-0 text-foreground">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
      />
      <Header />

      <main id="main" className="mx-auto max-w-5xl px-4 py-10">
        <Link
          href={`/tool/${tool.slug}`}
          className="mb-6 inline-flex items-center gap-1.5 text-2xs font-semibold text-zinc-400 hover:text-accent-400"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" /> {t('backTo', { name: tool.name })}
        </Link>

        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
          {t('heading', { count: String(alts.length), name: tool.name })}
        </h1>

        <p className="mt-4 max-w-3xl text-base leading-relaxed text-zinc-300">
          {t('introA', {
            name: tool.name,
            category: toolCategoryLabel.toLowerCase(),
            tagline: tool.tagline.charAt(0).toLowerCase() + tool.tagline.slice(1),
            price: tool.startingPrice ?? `${tool.pricing.toLowerCase()} tier`,
          })}{' '}
          {freeAlts.length > 0
            ? t('introFree', { count: String(alts.length), n: String(freeAlts.length) })
            : t('introNoFree', { count: String(alts.length) })}{' '}
          {t('introTail')}
        </p>

        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-zinc-500">{t('verifyNote')}</p>

        {/* Comparison table */}
        <div className="mt-8 overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full min-w-[640px] text-left text-sm">
            <caption className="sr-only">
              {tool.name} compared with {alts.length} alternatives
            </caption>
            <thead className="bg-surface-2 text-2xs uppercase tracking-wider text-zinc-400">
              <tr>
                <th scope="col" className="px-4 py-3 font-bold">{t('tool')}</th>
                <th scope="col" className="px-4 py-3 font-bold">{t('from')}</th>
                <th scope="col" className="px-4 py-3 font-bold">{t('model')}</th>
                <th scope="col" className="px-4 py-3 font-bold">{t('ourScore')}</th>
                <th scope="col" className="px-4 py-3 font-bold">{t('verification')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <tr className="bg-accent-500/5">
                <th scope="row" className="px-4 py-3 text-left font-bold text-accent-300">
                  {tool.name} <span className="font-normal text-zinc-500">{t('current')}</span>
                </th>
                <td className="px-4 py-3 font-mono tabular-nums text-zinc-300">
                  {tool.startingPrice ?? '—'}
                </td>
                <td className="px-4 py-3 text-zinc-400">{tool.pricing}</td>
                <td className="px-4 py-3 font-mono tabular-nums text-zinc-300">
                  {hasVerifiedScore(tool) && tool.scores
                    ? `${computeOverall(tool.scores).toFixed(1)}/10`
                    : '—'}
                </td>
                <td className="px-4 py-3">
                  <VerificationBadge level={tool.verificationLevel} compact />
                </td>
              </tr>
              {alts.map((a) => (
                <tr key={a.slug} className="hover:bg-surface-1">
                  <th scope="row" className="px-4 py-3 text-left font-semibold">
                    <Link href={`/tool/${a.slug}`} className="text-white hover:text-accent-300">
                      {a.name}
                    </Link>
                  </th>
                  <td className="px-4 py-3 font-mono tabular-nums text-emerald-400">
                    {a.startingPrice ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-zinc-400">{a.pricing}</td>
                  <td className="px-4 py-3 font-mono tabular-nums text-zinc-300">
                    {hasVerifiedScore(a) && a.scores
                      ? `${computeOverall(a.scores).toFixed(1)}/10`
                      : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <VerificationBadge level={a.verificationLevel} compact />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Per-tool detail with a real differentiator */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold">{t('altsHeading')}</h2>
          <ol className="mt-6 space-y-6">
            {alts.map((a, i) => (
              <li
                key={a.slug}
                className="rounded-2xl border border-white/10 bg-surface-1 p-5 sm:p-6"
              >
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h3 className="text-lg font-bold">
                    <span className="mr-2 font-mono text-zinc-600">{i + 1}.</span>
                    <Link href={`/tool/${a.slug}`} className="hover:text-accent-300">
                      {a.name}
                    </Link>
                  </h3>
                  <VerificationBadge level={a.verificationLevel} testedAt={a.testedAt} compact />
                </div>

                <p className="mt-2 text-sm leading-relaxed text-zinc-300">{a.description}</p>

                <p className="mt-3 rounded-xl border border-accent-500/20 bg-accent-500/10 px-3 py-2 text-sm text-accent-200">
                  <strong className="font-bold">{t('vsName', { name: tool.name })}</strong>{' '}
                  {differentiator(a, tool)}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-3 text-2xs text-zinc-500">
                  <span className="font-mono tabular-nums text-emerald-400">
                    {a.startingPrice ?? a.pricing}
                  </span>
                  <span>·</span>
                  <span>{a.category}</span>
                  <Link
                    href={`/tool/${a.slug}`}
                    className="ml-auto font-semibold text-accent-400 hover:text-accent-300"
                  >
                    {t('fullDetails')} →
                  </Link>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* FAQ */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold">{t('faqHeading', { name: tool.name })}</h2>
          <dl className="mt-5 space-y-4">
            {faqs.map((f) => (
              <div key={f.q} className="rounded-2xl border border-white/10 bg-surface-1 p-5">
                <dt className="text-base font-bold text-zinc-100">{f.q}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-zinc-400">{f.a}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-12">
          <h2 className="mb-5 text-2xl font-bold">{t('topPicks')}</h2>
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {alts.slice(0, 4).map((a, i) => (
              <li key={a.slug}>
                <ToolCard tool={a} index={i} />
              </li>
            ))}
          </ul>
        </section>
      </main>

      <Footer />
    </div>
  );
}
