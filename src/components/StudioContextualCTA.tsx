import { useTranslations } from 'next-intl';
import Link from '@/i18n/navigation';
import { ArrowRight, Sparkles } from 'lucide-react';
import type { ToolCategory } from '@/data/tools';

const STUDIO_DESTINATION: Partial<Record<ToolCategory, { href: string; labelKey: string; textKey: string }>> = {
  'Thumbnails & Design': {
    href: '/ai-studio/thumbnail-brief',
    labelKey: 'ctaBriefLabel',
    textKey: 'ctaBriefText',
  },
  'Prompts & Templates': {
    href: '/ai-studio/prompt-builder',
    labelKey: 'ctaPromptLabel',
    textKey: 'ctaPromptText',
  },
  'Scripting & Writing': {
    href: '/ai-studio/content-calendar',
    labelKey: 'ctaCalendarLabel',
    textKey: 'ctaCalendarText',
  },
  'Transcription & Captions': {
    href: '/ai-studio/subtitle-tools',
    labelKey: 'ctaSrtLabel',
    textKey: 'ctaSrtText',
  },
  'Voice & Audio': {
    href: '/ai-studio/audio-trimmer',
    labelKey: 'ctaAudioLabel',
    textKey: 'ctaAudioText',
  },
  'Video Generation': {
    href: '/ai-studio/prompt-builder',
    labelKey: 'ctaVideoPromptLabel',
    textKey: 'ctaVideoPromptText',
  },
  'Video Editing & VFX': {
    href: '/ai-studio/video-inspector',
    labelKey: 'ctaInspectLabel',
    textKey: 'ctaInspectText',
  },
};

/** A small, neutral handoff from a Directory detail page to a native utility. */
export function StudioContextualCTA({ category }: { category: ToolCategory }) {
  const t = useTranslations('studio');
  const destination = STUDIO_DESTINATION[category];
  if (!destination) return null;
  return (
    <aside className="mt-6 flex flex-col gap-4 rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.045] p-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="flex items-center gap-2 text-2xs font-bold uppercase tracking-[0.14em] text-cyan-200">
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> {t('utility')}
        </p>
        <p className="mt-2 text-sm text-zinc-300">{t(destination.textKey)}</p>
      </div>
      <Link href={destination.href} className="inline-flex shrink-0 items-center gap-2 text-sm font-bold text-cyan-200 hover:text-cyan-100">
        {t(destination.labelKey)} <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </aside>
  );
}
