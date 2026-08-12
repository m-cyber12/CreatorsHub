'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { CheckCircle2, ThumbsUp, ThumbsDown } from 'lucide-react';

/**
 * Audit fix 3.5 — micro-feedback widget.
 * The audit recommended adding "Was this helpful?" on every tool page
 * to collect content quality signals without requiring a full review.
 */
export function HelpfulFeedback({ toolSlug }: { toolSlug: string }) {
  const t = useTranslations('components.helpfulFeedback');
  const [sent, setSent] = useState(false);
  const [feedback, setFeedback] = useState<'helpful' | 'not-helpful' | null>(null);

  const sendFeedback = async (value: 'helpful' | 'not-helpful') => {
    setFeedback(value);
    setSent(true);
    // Best-effort fire-and-forget to the search-log endpoint.
    try {
      await fetch('/api/search-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: `feedback:${toolSlug}:${value}`, results: 0 }),
        keepalive: true,
      });
    } catch {
      // Silent — this is non-critical.
    }
  };

  if (sent) {
    return (
      <div className="mt-6 flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-2xs text-emerald-400">
        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
        {feedback === 'helpful' ? t('thanksUseful') : t('thanksNot')}
      </div>
    );
  }

  return (
    <div className="mt-6 flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-surface-1 px-4 py-3">
      <span className="text-2xs text-zinc-500">{t('question')}</span>
      <button
        onClick={() => sendFeedback('helpful')}
        className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-surface-2 px-3 py-1.5 text-2xs font-semibold text-zinc-400 transition-colors hover:border-emerald-500/40 hover:text-emerald-400"
        aria-label={t('ariaYes')}
      >
        <ThumbsUp className="h-3 w-3" aria-hidden="true" />
        {t('yes')}
      </button>
      <button
        onClick={() => sendFeedback('not-helpful')}
        className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-surface-2 px-3 py-1.5 text-2xs font-semibold text-zinc-400 transition-colors hover:border-rose-500/40 hover:text-rose-400"
        aria-label={t('ariaNo')}
      >
        <ThumbsDown className="h-3 w-3" aria-hidden="true" />
        {t('no')}
      </button>
    </div>
  );
}
