import type { Metadata } from 'next';
import Link from '@/i18n/navigation';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { hasVerifiedScore, computeOverall, type Tool } from '@/data/tools';
import { COMPARISON_PAIRS, parseComparisonSlug } from '@/lib/comparisons';
import { SITE_URL } from '@/config/site';
import { localizedCategoryLabel, localizedTagLabel } from '@/lib/i18n/content';
import { getEffectiveTool } from '@/lib/contentOverrides';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { VerificationBadge } from '@/components/VerificationBadge';
import { SmartImage } from '@/components/SmartImage';
import { ExternalLink, Check, Minus } from 'lucide-react';

/**
 * Audit fix 3.1 — /compare/[a]-vs-[b] static comparison pages.
 *
 * These target very high-intent queries ("descript vs riverside"). Pairs are
 * curated in lib/comparisons.ts rather than generated exhaustively, because
 * hundreds of near-identical pages would be doorway pages.
 *
 * The page is honest by construction: where neither tool has been tested it
 * says so plainly and compares only facts we can actually stand behind
 * (pricing, tier model, features, export terms).
 *
 * i18n (v3.3): chrome + templated sentences come from the `comparePair`
 * namespace; tool names/tags stay canonical (English).
 */

export const dynamicParams = false;

export function generateStaticParams() {
  return COMPARISON_PAIRS.map(([a, b]) => ({ pair: `${a}-vs-${b}` }));
}

function priceNum(s?: string): number | null {
  const m = s?.match(/[\d.]+/);
  return m ? parseFloat(m[0]) : null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ pair: string; locale: string }>;
}): Promise<Metadata> {
  const { pair, locale } = await params;
  const t = await getTranslations({ locale, namespace: 'comparePair' });
  const parsed = parseComparisonSlug(pair);
  if (!parsed) return { title: t('notFound') };
  const { a, b } = parsed;

  return {
    title: t('metaTitle', { a: a.name, b: b.name }),
    description: t('metaDescription', {
      a: a.name,
      b: b.name,
      pa: a.startingPrice ?? a.pricing,
      pb: b.startingPrice ?? b.pricing,
    }),
    alternates: { canonical: `/compare/${pair}` },
    openGraph: {
      title: t('ogTitle', { a: a.name, b: b.name }),
      description: t('ogDescription', { category: a.category.toLowerCase() }),
      url: `/compare/${pair}`,
      type: 'article',
    },
  };
}

export default async function ComparePairPage({
  params,
}: {
  params: Promise<{ pair: string; locale: string }>;
}) {
  const { pair, locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'comparePair' });
  const parsed = parseComparisonSlug(pair);
  if (!parsed) notFound();
  const a = (await getEffectiveTool(parsed.a.slug)) ?? parsed.a;
  const b = (await getEffectiveTool(parsed.b.slug)) ?? parsed.b;

  const aPrice = priceNum(a.startingPrice);
  const bPrice = priceNum(b.startingPrice);
  const cheaper =
    aPrice !== null && bPrice !== null ? (aPrice < bPrice ? a : bPrice < aPrice ? b : null) : null;

  const aTested = hasVerifiedScore(a);
  const bTested = hasVerifiedScore(b);
  const aScore = aTested && a.scores ? computeOverall(a.scores) : null;
  const bScore = bTested && b.scores ? computeOverall(b.scores) : null;

  // Feature matrix from tags — a real, checkable difference.
  const allTags = Array.from(new Set([...a.tags, ...b.tags])).sort();
  const uniqueToA = a.tags.filter((tag) => !b.tags.includes(tag));
  const uniqueToB = b.tags.filter((tag) => !a.tags.includes(tag));

  // Localized display labels (tags + category stay English in URLs/params).
  const tagLabels: Record<string, string> = {};
  for (const tag of allTags) tagLabels[tag] = await localizedTagLabel(tag, locale);
  const catA = await localizedCategoryLabel(a.category, locale);
  const catB = await localizedCategoryLabel(b.category, locale);

  const rows: { label: string; a: string; b: string }[] = [
    { label: t('rowCategory'), a: catA, b: catB },
    { label: t('rowPricing'), a: a.pricing, b: b.pricing },
    { label: t('rowPrice'), a: a.startingPrice ?? '—', b: b.startingPrice ?? '—' },
    {
      label: t('rowScore'),
      a: aScore !== null ? `${aScore.toFixed(1)}/10` : t('notTested'),
      b: bScore !== null ? `${bScore.toFixed(1)}/10` : t('notTested'),
    },
    {
      label: t('rowVerification'),
      a: a.verificationLevel.replace(/-/g, ' '),
      b: b.verificationLevel.replace(/-/g, ' '),
    },
    { label: t('rowMetric'), a: a.metrics ?? '—', b: b.metrics ?? '—' },
    { label: t('rowLaunched'), a: a.launchDate?.slice(0, 4) ?? '—', b: b.launchDate?.slice(0, 4) ?? '—' },
  ];

  const faqs = [
    {
      q: t('faqQCheaper', { a: a.name, b: b.name }),
      a: cheaper
        ? t('faqCheaperA', {
            name: cheaper.name,
            pa: cheaper.startingPrice ?? cheaper.pricing,
            pb: (cheaper.slug === a.slug ? b : a).startingPrice ?? (cheaper.slug === a.slug ? b : a).pricing,
          })
        : t('faqCheaperB', {
            pa: a.startingPrice ?? a.pricing,
            pb: b.startingPrice ?? b.pricing,
          }),
    },
    {
      q: t('faqQUniqueA', { a: a.name, b: b.name }),
      a: uniqueToA.length
        ? t('faqUniqueA', {
            a: a.name,
            b: b.name,
            list: uniqueToA.slice(0, 3).map((tag) => tagLabels[tag] ?? tag).join(', '),
          })
        : t('faqUniqueANone', { a: a.name, b: b.name }),
    },
    {
      q: t('faqQUniqueB', { a: b.name, b: a.name }),
      a: uniqueToB.length
        ? t('faqUniqueB', {
            a: b.name,
            b: a.name,
            list: uniqueToB.slice(0, 3).map((tag) => tagLabels[tag] ?? tag).join(', '),
          })
        : t('faqUniqueBNone', { a: b.name, b: a.name }),
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

  const ToolColumn = ({ tool, score }: { tool: Tool; score: number | null }) => (
    <div className="flex-1 rounded-2xl border border-white/10 bg-surface-1 p-5">
      <div className="flex items-center gap-3">
        <SmartImage
          src={tool.logo}
          alt=""
          width={48}
          height={48}
          className="h-12 w-12 rounded-xl bg-surface-2 object-cover ring-1 ring-white/10"
        />
        <div className="min-w-0">
          <h2 className="truncate text-lg font-bold">
            <Link href={`/tool/${tool.slug}`} className="hover:text-accent-300">
              {tool.name}
            </Link>
          </h2>
          <p className="truncate text-2xs text-zinc-400">{tool.tagline}</p>
        </div>
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        {score !== null ? (
          <>
            <span className="font-mono text-3xl font-black tabular-nums text-emerald-400">
              {score.toFixed(1)}
            </span>
            <span className="text-2xs text-zinc-500">{t('testedSuffix')}</span>
          </>
        ) : (
          <VerificationBadge level={tool.verificationLevel} />
        )}
      </div>

      <p className="mt-3 font-mono text-sm tabular-nums text-emerald-400">
        {tool.startingPrice ?? tool.pricing}
      </p>

      <a
        href={`/go/${tool.slug}`}
        target="_blank"
        rel={
          tool.affiliateProgram
            ? 'noopener noreferrer nofollow sponsored'
            : 'noopener noreferrer nofollow'
        }
        className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-accent-500 px-4 py-2.5 text-2xs font-bold text-black hover:opacity-90"
      >
        {t('visitTool', { name: tool.name })}
        <ExternalLink className="h-3 w-3" aria-hidden="true" />
      </a>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface-0 text-foreground">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <Header />

      <main id="main" className="mx-auto max-w-5xl px-4 py-10">
        <nav aria-label="Breadcrumb" className="mb-4 text-2xs text-zinc-500">
          <Link href="/" className="hover:text-accent-400">{t('home')}</Link>
          <span className="mx-1.5">/</span>
          <Link href="/compare" className="hover:text-accent-400">{t('compare')}</Link>
          <span className="mx-1.5">/</span>
          <span className="text-zinc-300">{a.name} vs {b.name}</span>
        </nav>

        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
          {a.name} vs {b.name}
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-zinc-300">
          {t('intro', { category: catA.toLowerCase() })}{' '}
          {cheaper ? t('cheaperIntro', { name: cheaper.name }) : t('similarIntro')}
          {t('introTail')}
        </p>

        {!aTested && !bTested && (
          <p className="mt-4 rounded-xl border border-white/10 bg-surface-1 px-4 py-3 text-sm text-zinc-400">
            <strong className="text-zinc-200">{t('noteScores')}</strong> {t('noteScoresBody')}
          </p>
        )}

        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <ToolColumn tool={a} score={aScore} />
          <div className="flex items-center justify-center px-2 text-sm font-bold text-zinc-600">
            {t('vs')}
          </div>
          <ToolColumn tool={b} score={bScore} />
        </div>

        {/* Spec table */}
        <section className="mt-10">
          <h2 className="mb-4 text-2xl font-bold">{t('sideBySide')}</h2>
          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full min-w-[560px] text-left text-sm">
              <caption className="sr-only">{a.name} compared with {b.name}</caption>
              <thead className="bg-surface-2 text-2xs uppercase tracking-wider text-zinc-400">
                <tr>
                  <th scope="col" className="px-4 py-3 font-bold">{t('attribute')}</th>
                  <th scope="col" className="px-4 py-3 font-bold">{a.name}</th>
                  <th scope="col" className="px-4 py-3 font-bold">{b.name}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {rows.map((r) => (
                  <tr key={r.label}>
                    <th scope="row" className="px-4 py-3 text-left font-semibold text-zinc-400">
                      {r.label}
                    </th>
                    <td className="px-4 py-3 capitalize text-zinc-200">{r.a}</td>
                    <td className="px-4 py-3 capitalize text-zinc-200">{r.b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Capability matrix */}
        <section className="mt-10">
          <h2 className="mb-4 text-2xl font-bold">{t('capabilityCoverage')}</h2>
          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead className="bg-surface-2 text-2xs uppercase tracking-wider text-zinc-400">
                <tr>
                  <th scope="col" className="px-4 py-3 font-bold">{t('capability')}</th>
                  <th scope="col" className="px-4 py-3 text-center font-bold">{a.name}</th>
                  <th scope="col" className="px-4 py-3 text-center font-bold">{b.name}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {allTags.map((tag) => (
                  <tr key={tag}>
                    <th scope="row" className="px-4 py-2.5 text-left font-medium text-zinc-300">
                      {tagLabels[tag] ?? tag}
                    </th>
                    <td className="px-4 py-2.5 text-center">
                      {a.tags.includes(tag) ? (
                        <Check className="mx-auto h-4 w-4 text-emerald-400" aria-label={t('yes')} />
                      ) : (
                        <Minus className="mx-auto h-4 w-4 text-zinc-700" aria-label={t('no')} />
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      {b.tags.includes(tag) ? (
                        <Check className="mx-auto h-4 w-4 text-emerald-400" aria-label={t('yes')} />
                      ) : (
                        <Minus className="mx-auto h-4 w-4 text-zinc-700" aria-label={t('no')} />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-2xs text-zinc-500">{t('coverageNote')}</p>
        </section>

        <section className="mt-10">
          <h2 className="mb-4 text-2xl font-bold">{t('commonQuestions')}</h2>
          <dl className="space-y-4">
            {faqs.map((f) => (
              <div key={f.q} className="rounded-2xl border border-white/10 bg-surface-1 p-5">
                <dt className="text-base font-bold text-zinc-100">{f.q}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-zinc-400">{f.a}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-10 flex flex-wrap gap-3 border-t border-white/5 pt-6 text-sm">
          <Link href={`/alternatives/${a.slug}`} className="text-accent-400 underline hover:text-accent-300">
            {t('moreAlternatives', { name: a.name })}
          </Link>
          <span className="text-zinc-700">·</span>
          <Link href={`/alternatives/${b.slug}`} className="text-accent-400 underline hover:text-accent-300">
            {t('moreAlternatives', { name: b.name })}
          </Link>
          <span className="text-zinc-700">·</span>
          <Link href="/compare" className="text-accent-400 underline hover:text-accent-300">
            {t('buildYourOwn')}
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
