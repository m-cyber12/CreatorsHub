import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CalculatorsClient } from './CalculatorsClient';
import { localizedCategoryLabel } from '@/lib/i18n/content';
import { Calculator, ShieldCheck, DollarSign, Clock, Sparkles } from 'lucide-react';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'calculators' });
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: { canonical: '/calculators' },
    openGraph: {
      title: t('ogTitle'),
      description: t('ogDescription'),
      type: 'website',
    },
  };
}

export default async function CalculatorsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'calculators' });

  // Localized display labels for the categories shown in the copyright rules.
  const ruleCategories = ['Video Generation', 'Voice & Audio', 'Video Repurposing'];
  const categoryLabels: Record<string, string> = {};
  for (const c of ruleCategories) {
    categoryLabels[c] = await localizedCategoryLabel(c, locale);
  }

  return (
    <div className="min-h-screen bg-surface-0 text-white">
      <Header />

      <main id="main" className="mx-auto max-w-6xl px-4 py-14">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/10">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-accent-500/10 border border-accent-500/20 px-4 py-1.5 text-xs font-semibold text-accent-300 mb-4">
              <Sparkles className="h-3.5 w-3.5" /> {t('badge')}
            </span>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight">{t('pageHeading')}</h1>
            <p className="mt-3 max-w-2xl text-sm text-zinc-400 leading-relaxed">{t('pageSub')}</p>
          </div>

          <div className="flex items-center gap-3 bg-surface-1 border border-white/10 rounded-2xl px-5 py-3">
            <Calculator className="h-6 w-6 text-accent-400 shrink-0" />
            <div>
              <div className="text-xs font-bold text-white">{t('freeBadge')}</div>
              <div className="text-2xs text-zinc-500">{t('freeBadgeSub')}</div>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <CalculatorsClient categoryLabels={categoryLabels} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
