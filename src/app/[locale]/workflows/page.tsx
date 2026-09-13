import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Link from '@/i18n/navigation';
import { ArrowRight, GitBranch } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SmartImage } from '@/components/SmartImage';
import { WORKFLOWS, workflowMinutes } from '@/data/workflows';
import { ALL_TOOLS } from '@/data/tools';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'workflows' });
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: { canonical: '/workflows' },
    openGraph: {
      title: t('metaTitle'),
      description: t('metaDescription'),
      url: '/workflows',
      type: 'website',
    },
  };
}

/** Entry-paid-tier cost convention (same as outcome guides): Free = $0. */
function nodeCost(toolSlug: string | undefined): number {
  if (!toolSlug) return 0;
  const tool = ALL_TOOLS.find((x) => x.slug === toolSlug);
  if (!tool || tool.pricing === 'Free') return 0;
  if (!tool.startingPrice || /one-?time|lifetime/i.test(tool.startingPrice)) return 0;
  const m = tool.startingPrice.replace(/,/g, '').match(/\$?(\d+(?:\.\d+)?)/);
  if (!m) return 0;
  const n = parseFloat(m[1]);
  return /yr|year/i.test(tool.startingPrice) ? n / 12 : n;
}

export default async function WorkflowsIndex({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'workflows' });

  return (
    <div className="min-h-screen bg-surface-0 text-white">
      <Header />
      <main id="main" className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <span className="inline-flex items-center gap-2 rounded-full border border-accent-500/20 bg-accent-500/10 px-4 py-1.5 text-2xs font-semibold text-accent-300">
          <GitBranch className="h-3.5 w-3.5" aria-hidden="true" /> {t('indexTitle')}
        </span>
        <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">{t('indexTitle')}</h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-zinc-400">{t('indexSub')}</p>

        <div className="mt-10 space-y-4">
          {WORKFLOWS.map((w) => {
            const minutes = workflowMinutes(w);
            const cost = Math.round(w.nodes.reduce((s, n) => s + nodeCost(n.tool), 0));
            const firstTool = w.nodes.find((n) => n.tool);
            return (
              <Link
                key={w.slug}
                href={`/workflows/${w.slug}`}
                className="glass-panel group flex flex-col gap-4 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent-500/40 hover:shadow-[0_24px_70px_-24px_rgba(247,201,72,0.3)] sm:flex-row sm:items-center"
              >
                {firstTool && (
                  <SmartImage
                    src={
                      ALL_TOOLS.find((x) => x.slug === firstTool.tool)?.logo ?? ''
                    }
                    alt=""
                    width={56}
                    height={56}
                    className="h-14 w-14 shrink-0 rounded-xl border border-white/10 object-cover"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-black">{w.title}</h2>
                  <p className="mt-1 text-sm leading-relaxed text-zinc-400">{w.oneLiner}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-2xs text-zinc-500">
                    <span>{t('stepsCount', { n: String(w.nodes.length), m: String(minutes) })}</span>
                    {w.frequency && <span>{w.frequency}</span>}
                    <span className="font-mono font-bold tabular-nums text-emerald-400">
                      ${cost}
                      <span className="font-sans font-normal text-zinc-600"> {t('perRun')}</span>
                    </span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1.5 text-2xs font-bold text-accent-300">
                  {t('open')}
                  <ArrowRight
                    className="h-3.5 w-3.5 transition-transform rtl:rotate-180 group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </div>
              </Link>
            );
          })}
        </div>

      </main>
      <Footer />
    </div>
  );
}
