import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import Link from '@/i18n/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ALL_TOOLS, TESTED_TOOLS, hasVerifiedScore } from '@/data/tools';
import { BenchmarkLeaderboard } from '@/components/BenchmarkLeaderboard';
import { TestingQueueWidget } from '@/components/TestingQueueWidget';
import { FlaskConical, Timer, Ruler, DollarSign, ShieldCheck } from 'lucide-react';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'benchmark' });
  return {
    title: t('title'),
    description: t('description'),
    alternates: { canonical: '/benchmark' },
    openGraph: { title: t('title'), description: t('description'), url: '/benchmark', type: 'website' },
  };
}

/** Briefs stay index-based in code; all copy lives in `benchmark.briefs.*`. */
const BRIEF_IDS = ['b1', 'b2', 'b3', 'b4', 'b5'] as const;

/** English category kept for the canonical tools URL param. */
const BRIEF_CATEGORY: Record<(typeof BRIEF_IDS)[number], string> = {
  b1: 'Video Repurposing',
  b2: 'Video Generation',
  b3: 'AI Avatars',
  b4: 'Voice & Audio',
  b5: 'Voice & Audio',
};

const METRIC_ICONS = [Timer, Ruler, DollarSign, ShieldCheck];

export default async function BenchmarkPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'benchmark' });

  const testedCount = ALL_TOOLS.filter(hasVerifiedScore).length;
  const briefs = BRIEF_IDS.map((id) => {
    const b = t.raw(`briefs.${id}`) as {
      name: string;
      input: string;
      task: string;
      measures: string[];
    };
    return { id, category: BRIEF_CATEGORY[id], ...b };
  });

  const metrics: { label: string; weight: string; desc: string }[] = [
    { label: t('metricQuality'), weight: '35%', desc: t('metricQualityDesc') },
    { label: t('metricEase'), weight: '20%', desc: t('metricEaseDesc') },
    { label: t('metricValue'), weight: '20%', desc: t('metricValueDesc') },
    { label: t('metricSpeed'), weight: '15%', desc: t('metricSpeedDesc') },
    { label: t('metricExport'), weight: '10%', desc: t('metricExportDesc') },
  ];
  const independenceItems = t.raw('independenceItems') as string[];

  return (
    <div className="min-h-screen bg-surface-0 text-foreground">
      <Header />

      <main id="main" className="mx-auto max-w-4xl px-4 py-12">
        <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent-500/20 bg-accent-500/10 px-4 py-1.5 text-2xs font-bold text-accent-400">
          <FlaskConical className="h-3.5 w-3.5" aria-hidden="true" /> {t('badge')}
        </span>

        <h1 className="text-4xl font-black tracking-tight sm:text-5xl">{t('heading')}</h1>

        <p className="mt-4 max-w-3xl text-base leading-relaxed text-zinc-300">{t('intro')}</p>

        {/* Honest status board */}
        <section className="mt-8 rounded-2xl border border-white/10 bg-surface-1 p-6">
          <h2 className="text-lg font-bold">{t('statusHeading')}</h2>
          <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div>
              <dt className="text-2xs uppercase tracking-wider text-zinc-500">{t('statCatalogued')}</dt>
              <dd className="mt-1 font-mono text-2xl font-black tabular-nums text-white">
                {ALL_TOOLS.length}
              </dd>
            </div>
            <div>
              <dt className="text-2xs uppercase tracking-wider text-zinc-500">{t('statTested')}</dt>
              <dd className="mt-1 font-mono text-2xl font-black tabular-nums text-emerald-400">
                {testedCount}
              </dd>
            </div>
            <div>
              <dt className="text-2xs uppercase tracking-wider text-zinc-500">{t('statBriefs')}</dt>
              <dd className="mt-1 font-mono text-2xl font-black tabular-nums text-accent-400">
                {briefs.length}
              </dd>
            </div>
          </dl>

          {testedCount > 0 ? (
            <p className="mt-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm leading-relaxed text-zinc-300">
              <strong className="text-emerald-400 font-extrabold">
                {t('testedNote', { count: String(testedCount) })}
              </strong>
            </p>
          ) : (
            <p className="mt-5 rounded-xl border border-accent-500/20 bg-accent-500/5 p-4 text-sm leading-relaxed text-zinc-300">
              <strong className="text-accent-300">{t('startNoteStrong')}</strong>{' '}
              {t('startNote')}
            </p>
          )}
        </section>

        {/* Hands-on Benchmark Leaderboard */}
        {testedCount > 0 && (
          <section className="mt-10">
            <BenchmarkLeaderboard tools={TESTED_TOOLS} />
          </section>
        )}

        {/* Public Testing Queue */}
        <section className="mt-10">
          <TestingQueueWidget />
        </section>

        {/* The briefs */}
        <section className="mt-10">
          <h2 className="text-2xl font-bold">{t('briefsHeading')}</h2>
          <p className="mt-2 text-sm text-zinc-400">{t('briefsSub')}</p>

          <ol className="mt-6 space-y-5">
            {briefs.map((brief) => (
              <li key={brief.id} className="rounded-2xl border border-white/10 bg-surface-1 p-6">
                <div className="flex flex-wrap items-baseline gap-3">
                  <span className="rounded-md bg-accent-500/15 px-2 py-1 font-mono text-2xs font-bold text-accent-300">
                    {brief.id.toUpperCase()}
                  </span>
                  <h3 className="text-lg font-bold">{brief.name}</h3>
                  <Link
                    href={`/tools?category=${encodeURIComponent(brief.category)}`}
                    className="text-2xs text-zinc-500 underline hover:text-accent-400"
                  >
                    {brief.category}
                  </Link>
                </div>

                <dl className="mt-4 space-y-3 text-sm">
                  <div>
                    <dt className="text-2xs font-bold uppercase tracking-wider text-zinc-500">
                      {t('fixedInput')}
                    </dt>
                    <dd className="mt-0.5 text-zinc-300">{brief.input}</dd>
                  </div>
                  <div>
                    <dt className="text-2xs font-bold uppercase tracking-wider text-zinc-500">
                      {t('task')}
                    </dt>
                    <dd className="mt-0.5 text-zinc-300">{brief.task}</dd>
                  </div>
                  <div>
                    <dt className="text-2xs font-bold uppercase tracking-wider text-zinc-500">
                      {t('whatWeRecord')}
                    </dt>
                    <dd className="mt-1.5">
                      <ul className="space-y-1.5">
                        {brief.measures.map((m) => (
                          <li key={m} className="flex gap-2 text-zinc-300">
                            <span
                              aria-hidden="true"
                              className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500"
                            />
                            {m}
                          </li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                </dl>
              </li>
            ))}
          </ol>
        </section>

        {/* Scoring */}
        <section className="mt-10 rounded-2xl border border-white/10 bg-surface-1 p-6">
          <h2 className="text-2xl font-bold">{t('scoringHeading')}</h2>
          <p className="mt-2 text-sm leading-relaxed text-zinc-400">{t('scoringIntro')}</p>
          <ul className="mt-4 space-y-2 text-sm">
            {metrics.map((metric, i) => {
              const Icon = METRIC_ICONS[i % METRIC_ICONS.length];
              return (
                <li key={metric.label} className="flex items-start gap-3">
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-accent-400" aria-hidden="true" />
                  <span className="text-zinc-300">
                    <strong className="text-white">{metric.label}</strong>{' '}
                    <span className="font-mono tabular-nums text-accent-400">{metric.weight}</span> — {metric.desc}
                  </span>
                </li>
              );
            })}
          </ul>
          <p className="mt-4 border-t border-white/5 pt-4 text-2xs leading-relaxed text-zinc-500">
            {t('scoringNote')}
          </p>
        </section>

        {/* Independence */}
        <section className="mt-8 rounded-2xl border border-white/10 bg-surface-1 p-6">
          <h2 className="text-2xl font-bold">{t('independenceHeading')}</h2>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-zinc-300">
            {(independenceItems ?? []).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-zinc-400">
            {t('seeAlso')}{' '}
            <Link href="/disclosure" className="text-accent-400 underline hover:text-accent-300">
              {t('disclosureLink')}
            </Link>{' '}
            {t('and')}{' '}
            <Link href="/about" className="text-accent-400 underline hover:text-accent-300">
              {t('policyLink')}
            </Link>
            .
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
