'use client';

import type { MouseEvent, ReactNode } from 'react';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from '@/i18n/navigation';
import { LockKeyhole, Zap } from 'lucide-react';
import { useStudioAccess } from './useStudioAccess';
import { studioToolUsesQuota, type StudioToolSlug } from '@/lib/studio';

export function StudioRunGate({ tool, children }: { tool: StudioToolSlug; children: ReactNode }) {
  const t = useTranslations('studio');
  const { access } = useStudioAccess();
  const [notice, setNotice] = useState(false);

  /**
   * Quota gate — AI-assisted utilities only.
   *
   * Two bugs fixed here (2026-09):
   *  1. Local utilities (image export, audio trim, video inspect, calendar
   *     build) were blocked once the "AI runs" quota hit zero — a local file
   *     operation must never sit behind an AI paywall. Local tools now pass
   *     through untouched.
   *  2. Every AI run consumed quota TWICE: once here (click capture) and once
   *     in the component's submit handler. This gate now only *checks* the
   *     limit and shows the notice; the single consumeQuota() call lives in
   *     each AI component's submit handler.
   */
  const onClickCapture = async (event: MouseEvent<HTMLDivElement>) => {
    if (!studioToolUsesQuota(tool)) return;
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>('.studio-generate');
    if (!button || button.disabled) return;

    if (access.limitReached) {
      event.preventDefault();
      event.stopPropagation();
      setNotice(true);
    }
  };

  return (
    <div onClickCapture={onClickCapture}>
      {children}
      {notice && studioToolUsesQuota(tool) && (
        <div className="mx-auto my-3 flex max-w-7xl flex-col gap-3 rounded-2xl border border-rose-500/40 bg-rose-500/15 p-4 text-xs font-bold text-rose-200 shadow-xl sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <LockKeyhole className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{t('quotaReached')}</span>
          </div>
          <Link
            href="/ai-studio/upgrade"
            className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-accent-500 px-3.5 py-1.5 text-2xs font-extrabold text-black hover:bg-accent-400"
          >
            <Zap className="h-3 w-3 fill-black" />
            {t('upgradeNow')}
          </Link>
        </div>
      )}
    </div>
  );
}
