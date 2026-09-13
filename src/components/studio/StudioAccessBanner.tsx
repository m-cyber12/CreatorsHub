'use client';

import React from 'react';
import Link from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { Sparkles, Zap, ArrowRight, AlertTriangle, LockKeyhole } from 'lucide-react';
import { useStudioAccess } from './useStudioAccess';
import { studioToolUsesQuota, type StudioToolSlug } from '@/lib/studio';

export function StudioAccessBanner({ tool }: { tool: StudioToolSlug }) {
  const t = useTranslations('studio');
  const { access } = useStudioAccess();

  /**
   * Trust fix: local utilities are unlimited and private — showing them an
   * "AI generations left" upsell was misleading. They get an honest local
   * badge instead; only AI-assisted utilities show quota + upgrade.
   */
  if (!studioToolUsesQuota(tool)) {
    return (
      <div className="my-4 flex items-center gap-3 rounded-2xl border border-emerald-400/30 bg-emerald-400/5 p-4 shadow-lg">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-400/15 text-emerald-300">
          <LockKeyhole className="h-4 w-4" />
        </span>
        <div>
          <p className="text-xs font-bold text-white">{t('localUnlimitedTitle')}</p>
          <p className="mt-0.5 text-[11px] text-zinc-400">{t('localUnlimitedText')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-4 flex flex-col items-center justify-between gap-3 rounded-2xl border border-cyan-400/30 bg-gradient-to-r from-cyan-400/10 via-surface-1 to-fuchsia-500/10 p-4 shadow-lg sm:flex-row">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-r from-cyan-400 to-accent-400 text-black shadow-md">
          <Sparkles className="h-4 w-4 fill-black" />
        </span>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-xs font-bold text-white">
              {t('dailyRunsTitle')}
            </p>
            <span
              className={`rounded-full px-2.5 py-0.5 font-mono text-2xs font-extrabold ${
                access.remaining > 0
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}
            >
              ⚡ {t('runsLeft', { remaining: access.remaining, limit: access.limit })}
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            {access.remaining > 0 ? t('runsHint') : t('runsExhausted')}
          </p>
        </div>
      </div>

      <Link
        href="/ai-studio/upgrade"
        className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-black transition-all hover:scale-105 shadow-md ${
          access.remaining <= 0
            ? 'bg-gradient-to-r from-rose-500 to-accent-500 text-white animate-pulse'
            : 'bg-gradient-to-r from-cyan-400 to-accent-400 text-black'
        }`}
      >
        {access.remaining <= 0 ? <AlertTriangle className="h-3.5 w-3.5" /> : <Zap className="h-3.5 w-3.5 fill-black" />}
        <span>{access.remaining <= 0 ? t('unlockPro') : t('upgradeToPro')}</span>
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
