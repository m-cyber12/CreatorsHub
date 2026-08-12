import type { Metadata } from 'next';
import Link from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';
import { getSiteContent } from '@/lib/siteContent';
import {
  ArrowRight,
  AudioLines,
  CalendarDays,
  CheckCircle2,
  FileText,
  ImageIcon,
  Keyboard,
  Languages,
  LockKeyhole,
  Scissors,
  Sparkles,
  Video,
} from 'lucide-react';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { StudioOrbitalScene } from '@/components/studio/StudioOrbitalScene';
import { StudioLinkStatus } from '@/components/studio/StudioLinkStatus';
import { StudioMotion } from '@/components/studio/StudioMotion';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'aiStudio' });
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: { canonical: '/ai-studio' },
  };
}

const WRITE_UTILITIES = [
  { icon: Sparkles, key: 'utilityPromptBuilder', accent: 'violet', href: '/ai-studio/prompt-builder', ready: true },
  { icon: ImageIcon, key: 'utilityThumbnailBrief', accent: 'pink', href: '/ai-studio/thumbnail-brief', ready: true },
  { icon: Keyboard, key: 'utilityThumbnailText', accent: 'amber', href: '/ai-studio/thumbnail-text', ready: true },
  { icon: CalendarDays, key: 'utilityContentCalendar', accent: 'cyan', href: '/ai-studio/content-calendar', ready: true },
];

const MEDIA_UTILITIES = [
  { icon: ImageIcon, key: 'utilityImageTools', accent: 'cyan', href: '/ai-studio/image-tools', ready: true },
  { icon: Languages, key: 'utilitySubtitleTools', accent: 'violet', href: '/ai-studio/subtitle-tools', ready: true },
  { icon: AudioLines, key: 'utilityAudioTrimmer', accent: 'pink', href: '/ai-studio/audio-trimmer', ready: true },
  { icon: Video, key: 'utilityVideoInspector', accent: 'amber', href: '/ai-studio/video-inspector', ready: true },
];

function UtilityCard({ item, t }: { item: (typeof WRITE_UTILITIES)[number] | (typeof MEDIA_UTILITIES)[number]; t: (k: string) => string }) {
  const Icon = item.icon;
  return (
    <article className="studio-utility-card group" data-accent={item.accent} data-studio-reveal>
      <div className="studio-utility-icon"><Icon className="h-5 w-5" aria-hidden="true" /></div>
      <div className="min-w-0">
        <h3 className="text-base font-bold text-white">{t(item.key)}</h3>
        <p className="mt-2 text-sm leading-6 text-zinc-400">{t(item.key + 'Text')}</p>
      </div>
      <StudioLinkStatus href={'href' in item ? item.href : undefined} ready={item.ready} />
    </article>
  );
}

export default async function AIStudioPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'aiStudio' });
  const content = await getSiteContent(false, locale);
  return (
    <div className="studio-shell min-h-screen overflow-hidden bg-[#070711] text-white">
      <Header />
      <main id="main">
        <StudioMotion />
        <section className="studio-hero relative isolate overflow-hidden">
          <div className="studio-hero-noise" aria-hidden="true" />
          <div className="studio-hero-aurora" aria-hidden="true" />
          <div className="mx-auto grid min-h-[640px] max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.03fr_0.97fr] lg:py-24">
            <div className="relative z-10 max-w-2xl" data-studio-reveal>
              <div className="studio-kicker">
                <span className="studio-live-dot" /> {content.studioKicker || t('kicker')}
                <span className="ml-2 rounded-full border border-cyan-400/50 bg-cyan-400/20 px-2 py-0.5 font-mono text-[10px] font-black uppercase tracking-wider text-cyan-300">
                  BETA
                </span>
              </div>
              <h1 className="mt-6 text-5xl font-black leading-[0.94] tracking-[-0.06em] sm:text-6xl lg:text-7xl">
                {content.studioHeroTitle1 || t('heroTitle1')}{' '}
                <span className="studio-gradient-text block">{content.studioHeroTitle2 || t('heroTitle2')}</span>
              </h1>
              <p className="mt-7 max-w-xl text-lg leading-8 text-zinc-300 sm:text-xl">
                {content.studioHeroText || t('heroText')}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#workspace" className="studio-primary-button">
                  {t('exploreWorkspace')} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
                <Link href="/tools" className="studio-secondary-button">
                  {t('browseDirectory')}
                </Link>
              </div>
              <div className="mt-9 flex flex-wrap gap-x-5 gap-y-3 text-2xs font-semibold uppercase tracking-[0.12em] text-zinc-400">
                <span className="inline-flex items-center gap-2"><LockKeyhole className="h-3.5 w-3.5 text-cyan-300" /> {t('privacyFirst')}</span>
                <span className="inline-flex items-center gap-2"><Scissors className="h-3.5 w-3.5 text-fuchsia-300" /> {t('practicalUtilities')}</span>
              </div>
            </div>
            <StudioOrbitalScene />
          </div>
        </section>

        <section id="workspace" className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <div className="studio-section-line" aria-hidden="true" />
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <p className="studio-eyebrow">{t('sectionEyebrow')}</p>
              <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] sm:text-5xl">{t('sectionTitle')}</h2>
              <p className="mt-4 text-base leading-7 text-zinc-400">{t('sectionText')}</p>
            </div>
            <div className="studio-foundation-badge"><CheckCircle2 className="h-4 w-4" aria-hidden="true" /> {t('foundationActive')}</div>
          </div>

          <div className="mt-12 grid gap-5 lg:grid-cols-2">
            <section>
              <div className="mb-5 flex items-center gap-3"><FileText className="h-5 w-5 text-fuchsia-300" aria-hidden="true" /><h3 className="text-lg font-bold">{t('writeSection')}</h3></div>
              <div className="grid gap-4 sm:grid-cols-2">{WRITE_UTILITIES.map((item) => <UtilityCard key={item.key} item={item} t={t} />)}</div>
            </section>
            <section>
              <div className="mb-5 flex items-center gap-3"><Scissors className="h-5 w-5 text-cyan-300" aria-hidden="true" /><h3 className="text-lg font-bold">{t('mediaSection')}</h3></div>
              <div className="grid gap-4 sm:grid-cols-2">{MEDIA_UTILITIES.map((item) => <UtilityCard key={item.key} item={item} t={t} />)}</div>
            </section>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
          <div className="studio-principles-grid">
            <div><span className="studio-principle-number">01</span><h2>{t('principle1Title')}</h2><p>{t('principle1Text')}</p></div>
            <div><span className="studio-principle-number">02</span><h2>{t('principle2Title')}</h2><p>{t('principle2Text')}</p></div>
            <div><span className="studio-principle-number">03</span><h2>{t('principle3Title')}</h2><p>{t('principle3Text')}</p></div>
          </div>
          <div className="mt-7 rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:flex sm:items-center sm:justify-between sm:gap-8">
            <div><p className="text-lg font-bold">{t('externalCta')}</p><p className="mt-1 text-sm text-zinc-400">{t('externalText')}</p></div>
            <Link href="/tools" className="mt-5 inline-flex shrink-0 items-center gap-2 text-sm font-bold text-amber-300 hover:text-amber-200 sm:mt-0">{t('exploreDirectory')} <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
