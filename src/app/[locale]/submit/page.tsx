import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SubmitForm } from './SubmitForm';
import { CATEGORIES } from '@/data/tools';
import { localizedCategoryLabel } from '@/lib/i18n/content';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'submit' });
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: { canonical: '/submit' },
  };
}

export default async function SubmitPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'submit' });

  const categoryLabels: Record<string, string> = {};
  for (const c of CATEGORIES.filter((x) => x !== 'All')) {
    categoryLabels[c] = await localizedCategoryLabel(c, locale);
  }

  return (
    <div className="min-h-screen bg-surface-0 text-white">
      <Header />
      <main id="main" className="mx-auto max-w-2xl px-4 py-14">
        <h1 className="text-3xl font-black tracking-tight mb-2">{t('heading')}</h1>
        <p className="text-sm text-zinc-400 mb-8 leading-relaxed">
          {t('metaSubtitleA')}
          <span className="text-white font-semibold">{t('freeStrong')}</span>
          {t('metaSubtitleB')}
        </p>
        <SubmitForm categoryLabels={categoryLabels} />
      </main>
      <Footer />
    </div>
  );
}
