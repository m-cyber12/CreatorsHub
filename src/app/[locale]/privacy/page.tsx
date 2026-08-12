import type { Metadata } from 'next';
import Link from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CONTACT_EMAIL, SITE_NAME, SITE_URL } from '@/config/site';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'privacy' });
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: { canonical: '/privacy' },
  };
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'privacy' });
  const hostName = new URL(SITE_URL).hostname;

  const dataItems: { label: string; body: string }[] = [
    { label: t('account'), body: t('accountBody') },
    { label: t('newsletter'), body: t('newsletterBody') },
    { label: t('reviews'), body: t('reviewsBody') },
    { label: t('bookmarks'), body: t('bookmarksBody') },
    { label: t('analytics'), body: t('analyticsBody') },
    { label: t('submissions'), body: t('submissionsBody') },
  ];

  return (
    <div className="min-h-screen bg-surface-0 text-white">
      <Header />
      <main id="main" className="mx-auto max-w-3xl px-4 py-14">
        <h1 className="text-3xl font-black tracking-tight mb-2">{t('heading')}</h1>
        <p className="text-xs text-zinc-500 mb-8">{t('updated')}</p>

        <div className="space-y-8 text-sm leading-relaxed text-zinc-400">
          <section>
            <h2 className="text-lg font-bold text-white mb-2">{t('s1')}</h2>
            <p>{t('s1body', { site: SITE_NAME, host: hostName })}</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">{t('s2')}</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              {dataItems.map((item) => (
                <li key={item.label}>
                  <span className="text-zinc-300 font-semibold">{item.label}</span> {item.body}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">{t('s3')}</h2>
            <p>{t('s3body')}</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">{t('s4')}</h2>
            <p>{t('s4body')}</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">{t('s5')}</h2>
            <p>
              {t('s5body')}
              <Link href="/disclosure" className="text-accent-400 underline">{t('disclosure')}</Link>
              {t('s5end')}
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">{t('s6')}</h2>
            <p>{t('s6body')}</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">{t('s7')}</h2>
            <p>
              {t('s7body')}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-accent-400 underline">{CONTACT_EMAIL}</a>
              {t('s7end')}
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">{t('s8')}</h2>
            <p>{t('s8body')}</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-2">{t('s9')}</h2>
            <p>{t('s9body')}</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
