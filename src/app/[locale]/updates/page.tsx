import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ALL_TOOLS } from '@/data/tools';
import { buildCatalogUpdates } from '@/lib/updates';
import { getRecentPriceChanges } from '@/lib/priceChanges';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { UpdatesClient } from './UpdatesClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'updates' });
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: { canonical: '/updates' },
    openGraph: { title: t('metaTitle'), description: t('metaDescription'), url: '/updates', type: 'website' },
  };
}

/**
 * /updates — "What changed" (P1 return loop).
 *
 * The catalog feed is built server-side from committed data (dated tool
 * additions, dated verifications, graveyard retirements, benchmark
 * publications) plus recorded price changes from `price_history`. The
 * personal layer (open alerts, saved-tool events, stack rollups) is
 * computed client-side from the visitor's local workspace.
 */
export default async function UpdatesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'updates' });

  const priceChanges = await getRecentPriceChanges(50);
  const events = buildCatalogUpdates({ tools: ALL_TOOLS, priceChanges });
  const priceConfigured = supabaseAdmin !== null;

  return (
    <div className="min-h-screen bg-surface-0 text-white">
      <Header />
      <main id="main" className="mx-auto max-w-5xl px-4 py-14">
        <div className="pb-8 border-b border-white/10">
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 text-xs font-semibold text-emerald-300 mb-4">
            {t('badge')}
          </span>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight">{t('title')}</h1>
          <p className="mt-3 max-w-2xl text-sm text-zinc-400 leading-relaxed">{t('subtitle')}</p>
        </div>

        <UpdatesClient events={events} priceConfigured={priceConfigured} />
      </main>
      <Footer />
    </div>
  );
}
