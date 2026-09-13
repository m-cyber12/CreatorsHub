import type { Metadata } from 'next';
import Link from '@/i18n/navigation';
import {
  ArrowRight,
  BookOpen,
  ClipboardCheck,
  Compass,
  Flame,
  LayoutGrid,
  Rocket,
  Scale,
  Search,
  ShieldCheck,
  Wallet,
} from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ToolCard } from '@/components/ToolCard';
import { NewsletterForm } from '@/components/NewsletterForm';
import { InfinityGauntlet } from '@/components/InfinityGauntlet';
import { HomeAnimations } from '@/components/HomeAnimations';
import { HomeMarquee } from '@/components/HomeMarquee';
import { TestingQueueWidget } from '@/components/TestingQueueWidget';
import { SolarHero, type SolarHeroCopy } from '@/components/home/SolarHero';
import { CATEGORIES } from '@/data/tools';
import { getEffectiveTools } from '@/lib/contentOverrides';
import { SITE_URL, SITE_NAME } from '@/config/site';

export const revalidate = 30;
import { localizeTools } from '@/lib/i18n/content';
import { getSiteContent } from '@/lib/siteContent';

type LocaleParams = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: LocaleParams }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'home' });
  const tc = await getTranslations({ locale, namespace: 'common' });
  const effectiveTools = await getEffectiveTools();
  const count = effectiveTools.length;

  return {
    title: `${t('metaTitle')}`,
    description: t('metaDescription'),
    alternates: { canonical: '/' },
    openGraph: {
      title: `${t('metaTitle')}`,
      description: tc('ogDescription', { count }),
      url: SITE_URL,
      siteName: SITE_NAME,
      type: 'website',
      locale,
      images: [
        {
          url: '/og-noxifera.png',
          width: 1424,
          height: 752,
          alt: `${SITE_NAME} — ${tc('ogImageAlt')}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${t('metaTitle')}`,
      description: tc('twitterDescription', { count }),
      images: ['/og-noxifera.png'],
    },
  };
}

export default async function HomePage({ params }: { params: LocaleParams }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'home' });
  const tc = await getTranslations({ locale, namespace: 'categories' });
  // Admin-editable content (Site Content tab) overrides the default copy.
  const content = await getSiteContent(false, locale);

  const STEPS = [
    {
      icon: Search,
      title: t('step1Title'),
      text: t('step1Text'),
      href: '/tools',
      cta: t('step1Cta'),
    },
    {
      icon: Scale,
      title: t('step2Title'),
      text: t('step2Text'),
      href: '/compare',
      cta: t('step2Cta'),
    },
    {
      icon: Rocket,
      title: t('step3Title'),
      text: t('step3Text'),
      href: '/stack-builder',
      cta: t('step3Cta'),
    },
  ];

  const effectiveTools = await getEffectiveTools();
  const priceChecked = effectiveTools.filter((tool) => tool.verificationLevel === 'pricing-verified');
  const featured = [...priceChecked, ...effectiveTools.filter((tool) => tool.verificationLevel === 'listed-only')].slice(0, 6);
  const categoryCount = CATEGORIES.filter((c) => c !== 'All').length;
  const localizedTools = await localizeTools(featured, locale);
  const localizedCategory = (c: string) => (tc.has(c) ? tc(c) : c);

  const solarCopy: SolarHeroCopy = {
    badge: t('solarBadge'),
    titleA: content.homeHeroTitle1 || t('solarTitleA'),
    titleB: content.homeHeroTitleAccent || t('solarTitleB'),
    sub: content.homeHeroSub || t('solarSub'),
    ctaPlan: content.homeHeroCtaPlan || t('heroCtaPlan'),
    ctaBrowse: content.homeHeroCtaBrowse || t('heroCtaBrowse'),
    scrollCue: t('solarScrollCue'),
    phases: [t('solarPhaseOrbit'), t('solarPhaseDescend'), t('solarPhaseConverge'), t('solarPhaseSettle')],
    fieldLabel: t('solarFieldLabel'),
    sectionLabel: t('solarSectionLabel'),
    trust: [t('trustNoInvented'), t('trustPricingSources'), t('trustCategories', { count: categoryCount })],
  };

  return (
    <div className="min-h-screen bg-surface-0 text-white">
      <Header />

      <main id="main">
      {/* SIGNATURE HERO — the solar intelligence and her 18 orbiting tools */}
      <SolarHero copy={solarCopy} />

      {/* TICKER */}
      <HomeMarquee />

      {/* STATS */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: ClipboardCheck,
              label: t('statCatalogued'),
              count: effectiveTools.length,
              tint: 'text-accent-300',
              glow: 'hover:shadow-[0_20px_60px_-20px_rgba(247,201,72,0.45)]',
            },
            {
              icon: ShieldCheck,
              label: t('statPriceChecked'),
              count: priceChecked.length,
              tint: 'text-accent-400',
              glow: 'hover:shadow-[0_20px_60px_-20px_rgba(232,174,28,0.5)]',
            },
            {
              icon: Search,
              label: t('statEvidence'),
              count: 0,
              tint: 'text-ember-300',
              glow: 'hover:shadow-[0_20px_60px_-20px_rgba(239,154,62,0.45)]',
            },
            {
              icon: LayoutGrid,
              label: t('statCategories'),
              count: categoryCount,
              tint: 'text-ember-400',
              glow: 'hover:shadow-[0_20px_60px_-20px_rgba(232,114,42,0.5)]',
            },
          ].map((stat, i) => (
            <div
              key={stat.label}
              data-reveal
              data-reveal-delay={String(i * 90)}
              className={`glass-panel group rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 ${stat.glow}`}
            >
              <stat.icon className={`h-5 w-5 ${stat.tint} transition-transform duration-300 group-hover:scale-110`} aria-hidden="true" />
              <p className="mt-4 font-mono text-3xl font-black tabular-nums">
                <span data-count={String(stat.count)}>{stat.count}</span>
              </p>
              <p className="mt-1 text-sm text-zinc-400">{stat.label}</p>
            </div>
          ))}
        </div>
        <p data-reveal className="mt-6 text-center text-2xs text-zinc-500">
          {t('benchmarkNote')}{' '}
          <Link className="text-accent-300 underline underline-offset-2 hover:text-accent-200" href="/methodology">
            {t('seeTheStandard')}
          </Link>
        </p>
      </section>

      {/* CATEGORIES */}
      <section className="relative mx-auto max-w-6xl px-4 py-10">
        <div className="flex items-end justify-between gap-4">
          <div data-reveal>
            <p className="eyebrow-line text-2xs font-bold uppercase tracking-widest text-accent-300">
              {t('startWithOutcome')}
            </p>
            <h2 className="mt-3 text-3xl font-black sm:text-4xl">{t('whatAreYouMaking')}</h2>
          </div>
          <Link
            data-reveal
            href="/tools"
            className="hidden text-sm font-semibold text-accent-300 transition-colors hover:text-accent-200 sm:block"
          >
            {t('allTools')}
          </Link>
        </div>
        <div className="mt-7 flex flex-wrap gap-2.5">
          {CATEGORIES.filter((c) => c !== 'All').map((category, i) => (
            <Link
              key={category}
              data-reveal
              data-reveal-delay={String(i * 40)}
              href={`/tools?category=${encodeURIComponent(category)}`}
              className="group relative rounded-full border border-white/10 bg-surface-1 px-5 py-2.5 text-sm text-zinc-300 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent-500/60 hover:text-white hover:shadow-[0_10px_30px_-10px_rgba(247,201,72,0.5)]"
            >
              <span className="relative z-10">{localizedCategory(category)}</span>
              <span
                aria-hidden="true"
                className="absolute inset-0 rounded-full bg-gradient-to-r from-accent-500/15 via-ember-500/10 to-accent-400/15 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              />
            </Link>
          ))}
        </div>
      </section>

      {/* STEPS */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-4 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <Link
              key={step.title}
              href={step.href}
              data-reveal
              data-reveal-delay={String(i * 110)}
              className="glass-panel group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-accent-500/40 hover:shadow-[0_24px_70px_-24px_rgba(247,201,72,0.45)]"
            >
              <div
                aria-hidden="true"
                className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br from-accent-500/15 to-ember-500/15 blur-2xl transition-opacity duration-300 group-hover:opacity-100"
              />
              <step.icon className="h-6 w-6 text-accent-400" aria-hidden="true" />
              <h3 className="mt-4 text-lg font-black">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">{step.text}</p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-2xs font-bold text-accent-300">
                {step.cta}
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 rtl-flip group-hover:translate-x-1 rtl:group-hover:-translate-x-1" aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* INTELLIGENCE LAYER — the platform's differentiator */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <div data-reveal className="mb-8 max-w-2xl">
          <p className="eyebrow-line text-2xs font-bold uppercase tracking-widest text-accent-400">
            {t('intelEyebrow')}
          </p>
          <h2 className="mt-3 text-3xl font-black sm:text-4xl">{t('intelTitle')}</h2>
          <p className="mt-2 text-sm text-zinc-400">{t('intelSub')}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: Compass,
              title: t('intelAdvisorTitle'),
              text: t('intelAdvisorText'),
              href: '/advisor',
              cta: t('intelAdvisorCta'),
            },
            {
              icon: Flame,
              title: t('intelOutcomesTitle'),
              text: t('intelOutcomesText'),
              href: '/outcomes',
              cta: t('intelOutcomesCta'),
            },
            {
              icon: Wallet,
              title: t('intelOptimizerTitle'),
              text: t('intelOptimizerText'),
              href: '/optimizer',
              cta: t('intelOptimizerCta'),
            },
            {
              icon: BookOpen,
              title: t('intelPlaybooksTitle'),
              text: t('intelPlaybooksText'),
              href: '/playbooks',
              cta: t('intelPlaybooksCta'),
            },
          ].map((card, i) => (
            <Link
              key={card.href}
              href={card.href}
              data-reveal
              data-reveal-delay={String(i * 110)}
              className="glass-panel group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-accent-500/40 hover:shadow-[0_24px_70px_-24px_rgba(247,201,72,0.45)]"
            >
              <card.icon className="h-6 w-6 text-accent-400" aria-hidden="true" />
              <h3 className="mt-4 text-base font-black">{card.title}</h3>
              <p className="mt-2 text-2xs leading-relaxed text-zinc-400">{card.text}</p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-2xs font-bold text-accent-300">
                {card.cta}
                <ArrowRight
                  className="h-3.5 w-3.5 transition-transform duration-300 rtl-flip group-hover:translate-x-1 rtl:group-hover:-translate-x-1"
                  aria-hidden="true"
                />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED TOOLS */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex items-end justify-between gap-4">
          <div data-reveal>
            <p className="eyebrow-line text-2xs font-bold uppercase tracking-widest text-accent-400">
              {t('featuredEyebrow')}
            </p>
            <h2 className="mt-3 text-3xl font-black sm:text-4xl">{content.homeFeaturedTitle || t('featuredTitle')}</h2>
            <p className="mt-2 text-sm text-zinc-400">{content.homeFeaturedSub || t('featuredSub')}</p>
          </div>
          <Link
            data-reveal
            href="/tools?sort=price-low"
            className="hidden text-sm font-semibold text-accent-300 transition-colors hover:text-accent-200 sm:block"
          >
            {t('exploreCatalog')}
          </Link>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {localizedTools.map((tool, index) => (
            <div key={tool.slug} data-reveal data-reveal-delay={String((index % 3) * 100)}>
              <ToolCard tool={tool} index={index} priority={index < 3} />
            </div>
          ))}
        </div>
      </section>

      {/* GAUNTLET — the interactive easter egg, preserved below the new hero */}
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div data-reveal className="mb-4 text-center">
          <p className="eyebrow-line text-2xs font-bold uppercase tracking-widest text-accent-400">
            Interactive
          </p>
          <h2 className="mt-3 text-3xl font-black sm:text-4xl">Free the stones</h2>
        </div>
        <InfinityGauntlet />
      </div>

      {/* TESTING QUEUE */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div data-reveal>
          <TestingQueueWidget />
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="mx-auto max-w-4xl px-4 py-20">
        <div data-reveal className="border-flow relative overflow-hidden p-[1.5px]">
          <div className="relative rounded-[calc(1.5rem-1.5px)] bg-surface-1/90 px-6 py-14 text-center backdrop-blur-xl sm:px-12">
            <div
              aria-hidden="true"
              className="absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-accent-400/70 to-transparent"
            />
            <p className="text-2xs font-bold uppercase tracking-[0.25em] text-accent-300">{t('newsletterEyebrow')}</p>
            <h2 className="mt-3 text-3xl font-black sm:text-4xl">{content.homeNewsletterTitle || t('newsletterTitle')}</h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-zinc-400">
              {content.homeNewsletterText || t('newsletterText')}
            </p>
            <div className="mt-8">
              <NewsletterForm source="homepage" />
            </div>
          </div>
        </div>
      </section>

      </main>

      <Footer />

      {/* GSAP choreography for the whole page (client-side, no visual impact if JS is off) */}
      <HomeAnimations />
    </div>
  );
}
