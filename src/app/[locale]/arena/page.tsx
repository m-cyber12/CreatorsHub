import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ArenaClient } from './ArenaClient';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'arena' });
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: { canonical: '/arena' },
    openGraph: { title: t('metaTitle'), description: t('metaDescription'), url: '/arena', type: 'website' },
  };
}

export default async function ArenaPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'arena' });

  return (
    <div className="min-h-screen bg-surface-0 text-white">
      <Header />
      <main id="main" className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent-500/20 bg-accent-500/10 px-4 py-1.5 text-2xs font-bold text-accent-400">
          ⚔️ {t('title')}
        </span>
        <h1 className="text-4xl font-black tracking-tight sm:text-5xl">{t('heading')}</h1>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-zinc-300">{t('sub')}</p>
        <p className="mt-3 max-w-3xl text-2xs leading-relaxed text-zinc-500">{t('valueFootnote')}</p>

        <ArenaClient />
      </main>
      <Footer />
    </div>
  );
}
