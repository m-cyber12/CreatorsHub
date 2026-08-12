import type { Metadata } from 'next';
import Link from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CONTACT_EMAIL, SITE_NAME } from '@/config/site';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'terms' });
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: { canonical: '/terms' },
  };
}

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'terms' });

  return (
    <div className="min-h-screen bg-surface-0 text-white">
      <Header />
      <main id="main" className="mx-auto max-w-3xl px-4 py-14">
        <h1 className="text-3xl font-black tracking-tight mb-2">{t('heading')}</h1>
        <p className="text-xs text-zinc-500 mb-8">{t('updated')}</p>

        <div className="space-y-8 text-sm leading-relaxed text-zinc-400">
          <section>
            <h2 className="text-lg font-bold text-white mb-2">{t('s1')}</h2>
            <p>{t('s1body', { site: SITE_NAME })}</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">{t('s2')}</h2>
            <p>{t('s2body', { site: SITE_NAME })}</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">{t('s3')}</h2>
            <p>
              {t('s3body')}
              <Link href="/disclosure" className="text-accent-400 underline">{t('disclosure')}</Link>
              {t('s3end')}
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">{t('s4')}</h2>
            <p>{t('s4body')}</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">{t('s5')}</h2>
            <p>{t('s5body')}</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">{t('s6')}</h2>
            <p>{t('s6body')}</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">{t('s7')}</h2>
            <p>{t('s7body', { site: SITE_NAME })}</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">{t('s8')}</h2>
            <p>{t('s8body')}</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">{t('s9')}</h2>
            <p>{t('s9body')}</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">{t('s10')}</h2>
            <p>
              {t('s10body')}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-accent-400 underline">{CONTACT_EMAIL}</a>
              {t('s10end')}
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
