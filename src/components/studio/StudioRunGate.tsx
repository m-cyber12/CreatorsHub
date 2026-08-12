'use client';

import type { MouseEvent, ReactNode } from 'react';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from '@/i18n/navigation';
import { LockKeyhole, Zap } from 'lucide-react';
import { useStudioAccess } from './useStudioAccess';

export function StudioRunGate({ children }: { children: ReactNode }) {
  const t = useTranslations('studio');
  const { access, consume } = useStudioAccess();
  const [notice, setNotice] = useState(false);

  const onClickCapture = async (event: MouseEvent<HTMLDivElement>) => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>('.studio-generate');
    if (!button || button.disabled) return;

    if (access.limitReached) {
      event.preventDefault();
      event.stopPropagation();
      setNotice(true);
      return;
    }

    // Decrement daily quota when user generates
    consume('prompt-builder');
  };

  return (
    <div onClickCapture={onClickCapture}>
      {children}
      {notice && (
        <div className="my-3 flex items-center justify-between gap-3 rounded-2xl border border-rose-500/40 bg-rose-500/15 p-4 text-xs font-bold text-rose-200 shadow-xl">
          <div className="flex items-center gap-2">
            <LockKeyhole className="h-4 w-4 shrink-0 text-rose-400" />
            <span>Daily free limit of 3 AI runs reached! Upgrade to Studio Pro ($4.99) for 50 runs/day.</span>
          </div>
          <Link
            href="/ai-studio/upgrade"
            className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-accent-500 px-3.5 py-1.5 text-2xs font-extrabold text-black hover:bg-accent-400"
          >
            <Zap className="h-3 w-3 fill-black" />
            Upgrade Now
          </Link>
        </div>
      )}
    </div>
  );
}
