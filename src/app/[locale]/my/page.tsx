import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { MyWorkspace } from '@/components/my/MyWorkspace';
import { toCatalogRow } from '@/components/my/catalog';
import { getEffectiveTools } from '@/lib/contentOverrides';
import { localizeTools } from '@/lib/i18n/content';
import { SITE_URL } from '@/config/site';

type LocaleParams = Promise<{ locale: string }>;

export const revalidate = 30;

export async function generateMetadata({ params }: { params: LocaleParams }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'my' });
  // A personal workspace has nothing indexable (content lives in the
  // visitor's own browser), so keep it out of the index.
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    robots: { index: false, follow: true },
    alternates: { canonical: `${SITE_URL}/${locale}/my` },
    openGraph: {
      title: t('metaTitle'),
      description: t('metaDescription'),
      url: `${SITE_URL}/${locale}/my`,
    },
  };
}

export default async function MyPage({ params }: { params: LocaleParams }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('my');
  const tools = await localizeTools(await getEffectiveTools(), locale);

  return (
    <div className="min-h-screen bg-surface-0 text-white">
      <Header />
      <main id="main" className="mx-auto max-w-5xl px-4 py-10 sm:py-12">
        <span className="inline-flex items-center gap-2 rounded-full border border-accent-500/20 bg-accent-500/10 px-4 py-1.5 text-2xs font-semibold text-accent-300">
          {t('badge')}
        </span>
        <h1 className="mt-4 text-3xl font-black tracking-tight md:text-4xl">{t('title')}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">{t('subtitle')}</p>
        <div className="mt-6">
          <MyWorkspace catalog={tools.map(toCatalogRow)} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
