import type { Metadata } from 'next';
import Link from '@/i18n/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { NewsletterForm } from '@/components/NewsletterForm';
import { Lock } from 'lucide-react';

/**
 * Audit fix 3.3 — same two problems as /templates: the waitlist form threw the
 * email away (`setSubmitted(true)` with no request), and the page was
 * indexable while empty. Both fixed.
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'jobs' });
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    robots: { index: false, follow: true },
  };
}

export default async function JobsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'jobs' });

  return (
    <div className="flex min-h-screen flex-col bg-surface-0 text-foreground">
      <Header />

      <main id="main" className="flex-1 px-4 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent-500/30 bg-accent-500/10 px-4 py-1.5 text-2xs font-bold text-accent-400">
            <Lock className="h-3.5 w-3.5" aria-hidden="true" /> {t('badge')}
          </span>

          <h1 className="text-4xl font-black tracking-tight md:text-5xl">{t('heading')}</h1>

          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-zinc-400">{t('intro')}</p>

          <div className="mx-auto mt-10 max-w-md rounded-2xl border border-white/10 bg-surface-1 p-6">
            <p className="mb-4 text-sm text-zinc-300">{t('notify')}</p>
            <NewsletterForm source="jobs-waitlist" />
          </div>

          <p className="mt-8 text-sm text-zinc-500">
            {t('hiring')}{' '}
            <Link href="/contact" className="text-accent-400 underline hover:text-accent-300">
              {t('getInTouch')}
            </Link>{' '}
            {t('hiringTail')}
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
