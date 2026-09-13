import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Link from '@/i18n/navigation';
import { ArrowRight, BookOpen } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SmartImage } from '@/components/SmartImage';
import { PLAYBOOKS } from '@/data/playbooks';
import { ALL_TOOLS } from '@/data/tools';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'playbooks' });
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: { canonical: '/playbooks' },
    openGraph: {
      title: t('metaTitle'),
      description: t('metaDescription'),
      url: '/playbooks',
      type: 'website',
    },
  };
}

export default async function PlaybooksIndex({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'playbooks' });

  return (
    <div className="min-h-screen bg-surface-0 text-white">
      <Header />
      <main id="main" className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <span className="inline-flex items-center gap-2 rounded-full border border-accent-500/20 bg-accent-500/10 px-4 py-1.5 text-2xs font-semibold text-accent-300">
          <BookOpen className="h-3.5 w-3.5" aria-hidden="true" /> {t('indexTitle')}
        </span>
        <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">{t('indexTitle')}</h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-zinc-400">{t('indexSub')}</p>

        <div className="mt-10 space-y-4">
          {PLAYBOOKS.map((pb) => {
            const tool = ALL_TOOLS.find((x) => x.slug === pb.slug);
            return (
              <Link
                key={pb.slug}
                href={`/playbooks/${pb.slug}`}
                className="glass-panel group flex flex-col gap-4 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent-500/40 hover:shadow-[0_24px_70px_-24px_rgba(247,201,72,0.3)] sm:flex-row sm:items-center"
              >
                {tool && (
                  <SmartImage
                    src={tool.logo}
                    alt=""
                    width={56}
                    height={56}
                    className="h-14 w-14 shrink-0 rounded-xl border border-white/10 object-cover"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-black">{pb.title}</h2>
                  <p className="mt-1 text-sm leading-relaxed text-zinc-400">{pb.oneLiner}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {pb.bestFor.slice(0, 3).map((b) => (
                      <span
                        key={b}
                        className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-2xs font-semibold text-zinc-400"
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-4">
                  {tool && (
                    <span className="font-mono text-sm font-bold tabular-nums text-emerald-300">
                      {tool.startingPrice ?? tool.pricing}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5 text-2xs font-bold text-accent-300">
                    {t('visit')}
                    <ArrowRight
                      className="h-3.5 w-3.5 transition-transform rtl:rotate-180 group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </span>
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
