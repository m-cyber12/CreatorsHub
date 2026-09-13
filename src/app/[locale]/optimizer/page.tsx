import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { OptimizerClient } from './OptimizerClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'optimizer' });
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: { canonical: '/optimizer' },
    openGraph: {
      title: t('metaTitle'),
      description: t('metaDescription'),
      url: '/optimizer',
      type: 'website',
    },
  };
}

export default async function OptimizerPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div className="min-h-screen bg-surface-0 text-white">
      <Header />
      <main id="main" className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <OptimizerClient />
      </main>
      <Footer />
    </div>
  );
}
