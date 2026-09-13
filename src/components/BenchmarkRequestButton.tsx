'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from '@/i18n/navigation';
import { FlaskConical, Check } from 'lucide-react';
import { loadBenchRequests, toggleBenchRequest } from '@/lib/benchRequests';

/**
 * "Request a benchmark" — the user-facing half of the Benchmark Lab queue.
 * Requests are stored locally (no backend for voting) and appear under
 * "Your requests" on /benchmark. We never imply a global vote count.
 */
export function BenchmarkRequestButton({ slug, toolName }: { slug: string; toolName: string }) {
  const t = useTranslations('components.benchmarkRequest');
  const [requested, setRequested] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setRequested(loadBenchRequests().includes(slug));
    setReady(true);
  }, [slug]);

  // Client-only state: render nothing until the workspace has loaded so SSR
  // and the first client paint agree.
  if (!ready) return null;

  return (
    <div className="mt-3 flex flex-wrap items-center gap-3 rounded-xl border border-accent-500/20 bg-accent-500/5 px-4 py-3">
      <button
        type="button"
        aria-pressed={requested}
        aria-label={`${toolName} — ${requested ? t('requested') : t('request')}`}
        onClick={() => setRequested(toggleBenchRequest(slug).includes(slug))}
        className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-2xs font-bold transition-colors ${
          requested
            ? 'border-emerald-400/50 bg-emerald-400/10 text-emerald-300'
            : 'border-accent-500/40 bg-accent-500/15 text-accent-300 hover:bg-accent-500/25'
        }`}
      >
        {requested ? <Check className="h-3 w-3" /> : <FlaskConical className="h-3 w-3" />}
        {requested ? t('requested') : t('request')}
      </button>
      <span className="text-2xs text-zinc-500">
        {t('hint')}{' '}
        <Link href="/benchmark" className="font-bold text-accent-400 hover:text-accent-300">
          {t('queueLink')}
        </Link>
      </span>
    </div>
  );
}
