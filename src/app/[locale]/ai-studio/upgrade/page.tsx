import type { Metadata } from 'next';
import Link from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { UpgradeClient } from './UpgradeClient';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'aiStudio' });
  return {
    title: `${t('upMetaTitle')} | CreatorAI Hub`,
    description: t('upMetaDesc'),
    alternates: { canonical: '/ai-studio/upgrade' },
  };
}

export default async function UpgradePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'aiStudio' });

  return (
    <div className="studio-shell min-h-screen bg-[#070711] text-white">
      <Header />
      <main id="main" className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="rounded-full bg-cyan-400/10 border border-cyan-400/30 px-3 py-1 font-mono text-2xs font-extrabold uppercase tracking-widest text-cyan-300">
            CREATOR PRO WORKSPACE
          </span>
          <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-6xl text-white">
            Unlock Full Creator Studio
          </h1>
          <p className="mt-4 text-base leading-7 text-zinc-400">
            Supercharge your video production with unlimited viral script prompts, thumbnail CTR generators, audio trimming, and automated content scheduling.
          </p>
        </div>

        <UpgradeClient />

        <div className="mt-12 text-center">
          <Link href="/ai-studio" className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-300 hover:underline">
            ← Back to Free AI Studio
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
