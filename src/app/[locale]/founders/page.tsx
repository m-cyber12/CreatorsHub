import type { Metadata } from 'next';
import Link from '@/i18n/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { FounderClaimForm } from './FounderClaimForm';
import { SmartImage } from '@/components/SmartImage';
import { SITE_NAME, SITE_URL } from '@/config/site';
import { localizedCategoryLabel } from '@/lib/i18n/content';
import { CATEGORIES } from '@/data/tools';
import { ShieldCheck, Trophy, Sparkles, Code2, ArrowRight } from 'lucide-react';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'founders' });
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: { canonical: '/founders' },
    openGraph: {
      title: t('ogTitle'),
      description: t('ogDescription'),
      type: 'website',
    },
  };
}

export default async function FoundersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'founders' });

  const exampleBadgeUrl = `${SITE_URL}/badge/opusclip.svg`;
  const exampleSnippet = `<a href="${SITE_URL}/tool/opusclip" target="_blank" rel="noopener">\n  <img src="${exampleBadgeUrl}" alt="Featured on ${SITE_NAME}" />\n</a>`;

  // Localized category labels for the tool dropdown.
  const categoryLabels: Record<string, string> = {};
  for (const c of CATEGORIES.filter((x) => x !== 'All')) {
    categoryLabels[c] = await localizedCategoryLabel(c, locale);
  }

  const benefits = [
    { icon: ShieldCheck, title: t('benefit1Title'), desc: t('benefit1Desc'), color: 'text-emerald-400' },
    { icon: Sparkles, title: t('benefit2Title'), desc: t('benefit2Desc'), color: 'text-accent-400' },
    { icon: Code2, title: t('benefit3Title'), desc: t('benefit3Desc'), color: 'text-amber-300' },
  ];

  return (
    <div className="min-h-screen bg-surface-0 text-white">
      <Header />

      <main id="main" className="mx-auto max-w-5xl px-4 py-14">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/10">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-accent-500/10 border border-accent-500/20 px-4 py-1.5 text-xs font-semibold text-accent-300 mb-4">
              <Trophy className="h-3.5 w-3.5" /> {t('badge')}
            </span>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight">{t('headingMain')}</h1>
            <p className="mt-3 max-w-2xl text-sm text-zinc-400 leading-relaxed">
              {t('subtitle', { site: SITE_NAME })}
            </p>
          </div>

          <div className="flex items-center gap-3 bg-surface-1 border border-white/10 rounded-2xl px-5 py-3">
            <ShieldCheck className="h-6 w-6 text-emerald-400 shrink-0" />
            <div>
              <div className="text-xs font-bold text-white">{t('freeVerif')}</div>
              <div className="text-2xs text-zinc-500">{t('freeVerifSub')}</div>
            </div>
          </div>
        </div>

        {/* Benefits Grid */}
        <section className="mt-12 grid gap-6 sm:grid-cols-3">
          {benefits.map((benefit) => (
            <div key={benefit.title} className="rounded-2xl border border-white/10 bg-surface-1 p-6">
              <benefit.icon className={`h-7 w-7 ${benefit.color}`} />
              <h3 className="mt-4 text-base font-bold text-white">{benefit.title}</h3>
              <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed">{benefit.desc}</p>
            </div>
          ))}
        </section>

        {/* Two-Column Area: Claim Form & Badge Generator */}
        <div className="mt-14 grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h2 className="text-xl font-bold mb-4">{t('claimHeading')}</h2>
            <FounderClaimForm categoryLabels={categoryLabels} />
          </div>

          <div className="lg:col-span-5 space-y-8">
            {/* Live SVG Badge Generator */}
            <div className="rounded-3xl border border-accent-500/30 bg-gradient-to-br from-accent-500/10 via-surface-1 to-surface-2 p-6 sm:p-8">
              <span className="text-2xs font-bold uppercase tracking-wider text-accent-300">
                {t('engineLabel')}
              </span>
              <h3 className="mt-1 text-xl font-extrabold text-white">{t('badgeHeading')}</h3>
              <p className="mt-2 text-xs text-zinc-300 leading-relaxed">{t('badgeDesc')}</p>

              <div className="mt-6 rounded-2xl bg-black/60 border border-white/10 p-5 flex items-center justify-center">
                <SmartImage src="/badge/opusclip.svg" alt="Featured on CreatorAI Hub" width={180} height={48} className="max-h-12 w-auto" />
              </div>

              <div className="mt-6">
                <div className="text-2xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  {t('embedLabel')}
                </div>
                <pre className="overflow-x-auto rounded-xl bg-zinc-950 border border-white/10 p-3 text-2xs font-mono text-accent-300 leading-relaxed">
                  {exampleSnippet}
                </pre>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-surface-1 p-6">
              <h3 className="text-base font-bold text-white">{t('claimedHeading')}</h3>
              <p className="mt-1 text-xs text-zinc-400 leading-relaxed">{t('claimedBody')}</p>
              <Link
                href="/contact"
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-accent-400 hover:underline"
              >
                <span>{t('contactTeam')}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
