'use client';

import { Bot, Cpu } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { studioSourceLabel } from '@/lib/studio';

/**
 * Honest provenance badge for AI-assisted Studio results.
 *
 * Every result from /api/ai-studio/generate carries a `source` string naming
 * what actually produced it — a cloud model ("Google Gemini 1.5 Flash") or
 * the built-in local engine ("Studio Smart Engine"). This badge renders the
 * true source instead of a generic "AI" claim, so a local-template run is
 * never presented as model output (and vice versa).
 */
export function StudioSourceBadge({ source }: { source: string | null }) {
  const t = useTranslations('studio');
  const { ai, label } = studioSourceLabel(source);
  return (
    <span
      className="inline-flex items-center gap-1.5 font-mono text-2xs"
      title={ai ? t('sourceCloudHint') : t('sourceLocalHint')}
    >
      {ai ? (
        <Bot className="h-3.5 w-3.5 text-cyan-300" aria-hidden="true" />
      ) : (
        <Cpu className="h-3.5 w-3.5 text-zinc-400" aria-hidden="true" />
      )}
      <span className={ai ? 'text-cyan-300' : 'text-zinc-400'}>{label}</span>
    </span>
  );
}
