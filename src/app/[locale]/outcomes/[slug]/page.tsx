import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Link from '@/i18n/navigation';
import {
  ArrowRight,
  Check,
  Clock,
  Compass,
  ExternalLink,
  Lightbulb,
  Wallet,
} from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SmartImage } from '@/components/SmartImage';
import { VerificationBadge } from '@/components/VerificationBadge';
import { OUTCOMES, getOutcome } from '@/data/outcomes';
import { ALL_TOOLS } from '@/data/tools';
import { BLOG_POSTS } from '@/data/posts';
import { absoluteUrl } from '@/config/site';

export function generateStaticParams() {
  return OUTCOMES.map((o) => ({ slug: o.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const outcome = getOutcome(slug);
  if (!outcome) notFound();
  const t = await getTranslations({ locale, namespace: 'outcomes' });
  return {
    title: `${outcome.title} — ${t('outcomeLabel')}`,
    description: outcome.intro[0].slice(0, 155),
    alternates: { canonical: `/outcomes/${slug}` },
    openGraph: {
      title: outcome.title,
      description: outcome.intro[0].slice(0, 155),
      url: `/outcomes/${slug}`,
      type: 'website',
    },
  };
}

/**
 * Cost convention: a tool counts at its entry paid price from the catalog.
 * Only tools with no paid tier at all count as $0. This is the "scale up"
 * number — the free-path count is shown separately per job.
 */
function toolMonthlyCost(startingPrice: string | undefined, pricing: string): number {
  if (!startingPrice || pricing === 'Free') return 0;
  if (/one-?time|lifetime/i.test(startingPrice)) return 0;
  const m = startingPrice.replace(/,/g, '').match(/\$?(\d+(?:\.\d+)?)/);
  if (!m) return 0;
  const n = parseFloat(m[1]);
  return /yr|year/i.test(startingPrice) ? n / 12 : n;
}

export default async function OutcomePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const outcome = getOutcome(slug);
  if (!outcome) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'outcomes' });

  const toolOf = (s: string) => ALL_TOOLS.find((x) => x.slug === s);
  const totalCost = Math.round(
    outcome.jobs.reduce((sum, j) => {
      const tool = toolOf(j.tool);
      return sum + (tool ? toolMonthlyCost(tool.startingPrice, tool.pricing) : 0);
    }, 0)
  );
  const freeJobs = outcome.jobs.filter((j) => {
    const tool = toolOf(j.tool);
    return !tool || tool.pricing === 'Free' || tool.pricing === 'Freemium';
  }).length;
  const totalMinutes = outcome.workflow.reduce((s, w) => s + w.minutes, 0);
  const guides = outcome.relatedGuides
    .map((s) => BLOG_POSTS.find((p) => p.slug === s))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));
  const related = outcome.relatedOutcomes
    .map((s) => OUTCOMES.find((o) => o.slug === s))
    .filter((o): o is NonNullable<typeof o> => Boolean(o));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ItemList',
        name: outcome.title,
        url: absoluteUrl(`/outcomes/${slug}`),
        itemListElement: outcome.jobs.map((j, i) => {
          const tool = toolOf(j.tool);
          return {
            '@type': 'ListItem',
            position: i + 1,
            name: tool?.name ?? j.tool,
            url: tool ? absoluteUrl(`/tool/${tool.slug}`) : undefined,
          };
        }),
      },
      {
        '@type': 'FAQPage',
        mainEntity: outcome.faq.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
    ],
  };

  return (
    <div className="min-h-screen bg-surface-0 text-white">
      <Header />
      <main id="main" className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <span className="inline-flex items-center gap-2 rounded-full border border-accent-500/20 bg-accent-500/10 px-4 py-1.5 text-2xs font-semibold text-accent-300">
          <Compass className="h-3.5 w-3.5" aria-hidden="true" /> {t('answers')}
        </span>
        <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">{outcome.title}</h1>
        <p className="mt-3 inline-block rounded-lg border border-white/10 bg-surface-1 px-3 py-1.5 text-2xs italic text-zinc-400">
          “{outcome.intent}”
        </p>
        {outcome.intro.map((p) => (
          <p key={p.slice(0, 32)} className="mt-4 max-w-2xl text-sm leading-relaxed text-zinc-400">
            {p}
          </p>
        ))}

        {/* The system */}
        <section className="mt-10">
          <h2 className="text-xl font-black">{t('systemTitle')}</h2>
          <p className="mt-1 text-2xs text-zinc-500">{t('systemSub')}</p>
          <ol className="mt-5 space-y-4">
            {outcome.jobs.map((job, i) => {
              const tool = toolOf(job.tool);
              return (
                <li key={`${job.role}-${i}`} className="glass-panel rounded-2xl p-5">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-500 font-mono text-2xs font-black text-black">
                      {i + 1}
                    </span>
                    <h3 className="text-sm font-black">{job.role}</h3>
                    {tool && (
                      <span className="ml-auto inline-flex items-center gap-2">
                        <span className="font-mono text-sm font-bold tabular-nums text-emerald-300">
                          {tool.startingPrice ?? tool.pricing}
                        </span>
                        <VerificationBadge level={tool.verificationLevel} />
                      </span>
                    )}
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-300">{job.why}</p>
                  <div className="mt-4 flex flex-col gap-4 border-t border-white/5 pt-4 sm:flex-row sm:items-center">
                    {tool && (
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <SmartImage
                          src={tool.logo}
                          alt=""
                          width={40}
                          height={40}
                          className="h-10 w-10 rounded-lg border border-white/10 object-cover"
                        />
                        <div className="min-w-0">
                          <Link
                            href={`/tool/${tool.slug}`}
                            className="inline-flex items-center gap-1 text-sm font-bold text-accent-300 hover:text-accent-200"
                          >
                            {tool.name} <ExternalLink className="h-3 w-3" aria-hidden="true" />
                          </Link>
                          <p className="truncate text-2xs text-zinc-500">{tool.tagline}</p>
                        </div>
                      </div>
                    )}
                    {job.alternatives.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-2xs text-zinc-500">{t('alternatives')}:</span>
                        {job.alternatives.map((alt) => {
                          const at = toolOf(alt);
                          if (!at) return null;
                          return (
                            <Link
                              key={alt}
                              href={`/tool/${alt}`}
                              className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-2xs font-semibold text-zinc-300 transition-colors hover:border-accent-500/50 hover:text-accent-300"
                            >
                              {at.name}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        {/* Workflow */}
        <section className="mt-10">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-xl font-black">{t('workflowTitle')}</h2>
              <p className="mt-1 text-2xs text-zinc-500">{t('workflowSub')}</p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-accent-500/30 bg-accent-500/10 px-3 py-1 text-2xs font-bold text-accent-300">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              {t('totalMinutes', { n: String(totalMinutes) })}
            </span>
          </div>
          <ol className="mt-5 space-y-2">
            {outcome.workflow.map((w, i) => (
              <li key={i} className="flex items-start gap-3 rounded-xl border border-white/5 bg-surface-1 px-4 py-3">
                <span className="mt-0.5 font-mono text-2xs font-black text-zinc-600">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p className="flex-1 text-sm text-zinc-300">{w.step}</p>
                <span className="font-mono text-2xs tabular-nums text-zinc-500">{w.minutes}m</span>
              </li>
            ))}
          </ol>
        </section>

        {/* Cost */}
        <section className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-accent-500/30 bg-gradient-to-r from-accent-500/10 via-surface-1 to-surface-2 p-6">
          <div>
            <p className="flex items-center gap-2 text-2xs font-bold uppercase tracking-wider text-zinc-500">
              <Wallet className="h-3.5 w-3.5" aria-hidden="true" /> {t('costTitle')}
            </p>
            <p className="font-mono text-3xl font-black tabular-nums text-accent-300">
              ${totalCost}
              <span className="text-sm text-zinc-500"> {t('perMonth')}</span>
            </p>
            <p className="mt-1 max-w-md text-2xs leading-relaxed text-zinc-500">{t('costSub')}</p>
          </div>
          <div className="text-2xs text-zinc-500">
            <p>
              <span className="font-mono font-bold text-emerald-400">{freeJobs}</span>{' '}
              {locale === 'fa' ? 'کار رایگان' : 'jobs start at $0'}
            </p>
          </div>
        </section>

        {/* Caveats */}
        <section className="mt-10">
          <h2 className="flex items-center gap-2 text-lg font-black">
            <Lightbulb className="h-4 w-4 text-accent-400" aria-hidden="true" /> {t('caveatsTitle')}
          </h2>
          <ul className="mt-4 space-y-3">
            {outcome.caveats.map((c) => (
              <li key={c.slice(0, 32)} className="flex gap-3 text-sm leading-relaxed text-zinc-400">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-ember-500" aria-hidden="true" />
                {c}
              </li>
            ))}
          </ul>
        </section>

        {/* Advisor CTA */}
        <section className="mt-10 rounded-2xl border border-accent-500/30 bg-accent-500/5 p-6 text-center">
          <p className="text-sm font-bold text-zinc-200">{t('advisorCta')}</p>
          <Link
            href="/advisor"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-accent-500 px-5 py-3 text-sm font-bold text-black transition-opacity hover:opacity-90"
          >
            {t('advisorBtn')}
            <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
          </Link>
        </section>

        {/* FAQ */}
        <section className="mt-10">
          <h2 className="text-xl font-black">{t('faqTitle')}</h2>
          <div className="mt-4 space-y-3">
            {outcome.faq.map((f) => (
              <details
                key={f.q}
                className="group rounded-xl border border-white/10 bg-surface-1 px-4 py-3 open:border-accent-500/30"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-bold text-zinc-200">
                  {f.q}
                  <span className="text-zinc-500 transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-zinc-400">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Related */}
        {(guides.length > 0 || related.length > 0) && (
          <section className="mt-12 grid gap-8 sm:grid-cols-2">
            {guides.length > 0 && (
              <div>
                <h2 className="text-base font-black">{t('relatedGuides')}</h2>
                <ul className="mt-3 space-y-2">
                  {guides.map((g) => (
                    <li key={g.slug}>
                      <Link
                        href={`/blog/${g.slug}`}
                        className="group flex items-start gap-2 text-sm text-zinc-300 hover:text-accent-300"
                      >
                        <Check className="mt-1 h-3 w-3 shrink-0 text-accent-500" aria-hidden="true" />
                        <span className="underline-offset-2 group-hover:underline">{g.title}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {related.length > 0 && (
              <div>
                <h2 className="text-base font-black">{t('relatedOutcomes')}</h2>
                <ul className="mt-3 space-y-2">
                  {related.map((r) => (
                    <li key={r.slug}>
                      <Link
                        href={`/outcomes/${r.slug}`}
                        className="group flex items-center gap-2 text-sm text-zinc-300 hover:text-accent-300"
                      >
                        <ArrowRight className="h-3.5 w-3.5 shrink-0 text-accent-500 rtl:rotate-180" aria-hidden="true" />
                        <span className="underline-offset-2 group-hover:underline">{r.title}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
