import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Link from '@/i18n/navigation';
import { ArrowRight, Compass } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { OUTCOMES } from '@/data/outcomes';
import { ALL_TOOLS } from '@/data/tools';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'outcomes' });
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: { canonical: '/outcomes' },
    openGraph: {
      title: t('metaTitle'),
      description: t('metaDescription'),
      url: '/outcomes',
      type: 'website',
    },
  };
}

export default async function OutcomesIndex({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'outcomes' });

  const slugSet = new Set(ALL_TOOLS.map((tool) => tool.slug));

  return (
    <div className="min-h-screen bg-surface-0 text-white">
      <Header />
      <main id="main" className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <span className="inline-flex items-center gap-2 rounded-full border border-accent-500/20 bg-accent-500/10 px-4 py-1.5 text-2xs font-semibold text-accent-300">
          <Compass className="h-3.5 w-3.5" aria-hidden="true" /> {t('answers')}
        </span>
        <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">{t('indexTitle')}</h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-zinc-400">{t('indexSub')}</p>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {OUTCOMES.map((outcome) => {
            // Cost computed from catalog data at render time (primary tools).
            // Entry-paid-tier cost: only tools with no paid tier count as $0.
            const cost = outcome.jobs.reduce((sum, job) => {
              const tool = ALL_TOOLS.find((x) => x.slug === job.tool);
              if (!tool || tool.pricing === 'Free') return sum;
              if (!tool.startingPrice || /one-?time|lifetime/i.test(tool.startingPrice)) return sum;
              const m = tool.startingPrice.replace(/,/g, '').match(/\$?(\d+(?:\.\d+)?)/);
              if (!m) return sum;
              const n = parseFloat(m[1]);
              return sum + (/yr|year/i.test(tool.startingPrice) ? n / 12 : n);
            }, 0);
            const toolCount = new Set(outcome.jobs.flatMap((j) => [j.tool, ...j.alternatives])).size;
            return (
              <Link
                key={outcome.slug}
                href={`/outcomes/${outcome.slug}`}
                className="glass-panel group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent-500/40 hover:shadow-[0_24px_70px_-24px_rgba(247,201,72,0.35)]"
              >
                <p className="text-2xs font-bold uppercase tracking-widest text-accent-300">
                  {t('answers')}
                </p>
                <h2 className="mt-2 text-xl font-black leading-snug">{outcome.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  <span className="italic text-zinc-500">“{outcome.intent}”</span>
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-2xs text-zinc-500">
                  <span>{t('jobsCount', { n: String(outcome.jobs.length), m: String(toolCount) })}</span>
                  <span className="font-mono font-bold tabular-nums text-emerald-400">
                    ${cost.toFixed(0)}
                    <span className="font-sans font-normal text-zinc-600"> {t('perMonth')}</span>
                  </span>
                </div>
                <span className="mt-4 inline-flex items-center gap-1.5 text-2xs font-bold text-accent-300">
                  {t('cardCta')}
                  <ArrowRight
                    className="h-3.5 w-3.5 transition-transform rtl-flip group-hover:translate-x-1 rtl:group-hover:-translate-x-1"
                    aria-hidden="true"
                  />
                </span>
              </Link>
            );
          })}
        </div>
      </main>
      <Footer />
    </div>
  );
}
