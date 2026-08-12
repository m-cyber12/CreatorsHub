'use client';

import React from 'react';
import Link from '@/i18n/navigation';
import { Sparkles, Zap, ArrowRight, AlertTriangle } from 'lucide-react';
import { useStudioAccess } from './useStudioAccess';

export function StudioAccessBanner() {
  const { access } = useStudioAccess();

  return (
    <div className="my-4 flex flex-col items-center justify-between gap-3 rounded-2xl border border-cyan-400/30 bg-gradient-to-r from-cyan-400/10 via-surface-1 to-fuchsia-500/10 p-4 shadow-lg sm:flex-row">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-r from-cyan-400 to-accent-400 text-black shadow-md">
          <Sparkles className="h-4 w-4 fill-black" />
        </span>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-xs font-bold text-white">
              Studio Daily Free Usage:
            </p>
            <span
              className={`rounded-full px-2.5 py-0.5 font-mono text-2xs font-extrabold ${
                access.remaining > 0
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}
            >
              ⚡ {access.remaining} of {access.limit} Free Runs Left Today
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            {access.remaining > 0
              ? 'Enjoy 3 free AI generations per day! Need 50 runs/day? Upgrade to Studio Pro.'
              : 'Daily limit reached! Upgrade to Studio Pro ($4.99/mo) for 50 runs/day.'}
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
        <span>{access.remaining <= 0 ? 'Unlock Studio Pro ($4.99)' : 'Upgrade to Pro ($4.99)'}</span>
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
