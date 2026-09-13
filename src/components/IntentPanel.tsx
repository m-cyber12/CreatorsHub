'use client';

import Link from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { ArrowRight, Compass, GitCompareArrows, Layers, Sparkles } from 'lucide-react';
import type { ParsedIntent } from '@/lib/intent';

/**
 * Intent search panel (P2). Shows how a query was interpreted — budget,
 * free/cheap modifiers, versus, matched outcome guides, stack shortcut —
 * so the visitor can trust or correct the interpretation. Rendered only
 * when the parser found at least one signal.
 */
export function IntentPanel({
  intent,
  query,
  resultCount,
  usagePricedHidden,
  clearHref,
}: {
  intent: ParsedIntent;
  query: string;
  resultCount: number;
  usagePricedHidden: number;
  clearHref: string;
}) {
  const t = useTranslations('intent');
  if (!intent.hasSignal) return null;

  const chips: string[] = [];
  if (intent.priceCap) chips.push(t('chips.under', { budget: `${intent.priceCap.currency || '$'}${intent.priceCap.amount}` }));
  if (intent.freeOnly) chips.push(t('chips.freeOnly'));
  if (intent.cheapFirst) chips.push(t('chips.cheapFirst'));

  return (
    <section aria-label={t('title')} className="mt-6 rounded-2xl border border-accent-500/25 bg-accent-500/5 p-5">
      <div className="flex flex-wrap items-center gap-2">
        <Sparkles className="h-4 w-4 shrink-0 text-accent-300" aria-hidden="true" />
        <p className="text-sm text-zinc-300">
          {t('title')}{' '}
          <span className="font-semibold text-white">“{query.trim().slice(0, 80)}”</span>
        </p>
        {chips.map((chip) => (
          <span
            key={chip}
            className="rounded-full border border-accent-500/30 bg-black/30 px-2.5 py-1 text-2xs font-bold text-accent-300"
          >
            {chip}
          </span>
        ))}
        <Link href={clearHref} className="ms-auto text-xs font-semibold text-zinc-400 hover:text-white hover:underline">
          {t('clear')}
        </Link>
      </div>

      {intent.keywords.length > 0 && (
        <p className="mt-2 font-mono text-2xs text-zinc-500">
          {t('matching', { words: intent.keywords.join(', ') })}
        </p>
      )}

      {intent.versus && intent.versus.a.slug && intent.versus.b.slug && (
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-black/20 p-3">
          <GitCompareArrows className="h-5 w-5 shrink-0 text-accent-300" aria-hidden="true" />
          <p className="text-sm">
            <Link href={`/tool/${intent.versus.a.slug}`} className="font-bold text-white hover:text-accent-300 hover:underline">
              {intent.versus.a.name}
            </Link>
            <span className="mx-2 text-zinc-500">vs</span>
            <Link href={`/tool/${intent.versus.b.slug}`} className="font-bold text-white hover:text-accent-300 hover:underline">
              {intent.versus.b.name}
            </Link>
          </p>
          <Link
            href={`/compare?tools=${intent.versus.a.slug},${intent.versus.b.slug}`}
            className="ms-auto inline-flex items-center gap-1 rounded-lg bg-accent-500 px-3 py-1.5 text-xs font-bold text-black hover:bg-accent-400"
          >
            {t('compareCta')} <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      )}

      {intent.outcomes.length > 0 && (
        <div className="mt-4">
          <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-400">
            <Compass className="h-3.5 w-3.5" aria-hidden="true" /> {t('outcomesTitle')}
          </p>
          <ul className="mt-2 grid gap-2 sm:grid-cols-2">
            {intent.outcomes.slice(0, 4).map((o) => (
              <li key={o.slug} className="rounded-xl border border-white/10 bg-black/20 p-3">
                <Link href={`/outcomes/${o.slug}`} className="font-bold text-white hover:text-accent-300 hover:underline">
                  {o.title}
                </Link>
                <p className="mt-0.5 line-clamp-2 text-xs text-zinc-400">{o.intent}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {intent.stackIntent && (
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-black/20 p-3">
          <Layers className="h-5 w-5 shrink-0 text-violet-300" aria-hidden="true" />
          <p className="text-sm text-zinc-300">{t('stackText')}</p>
          <Link
            href="/stack-builder"
            className="ms-auto inline-flex items-center gap-1 rounded-lg border border-violet-400/40 px-3 py-1.5 text-xs font-bold text-violet-200 hover:bg-violet-500/10"
          >
            {t('stackCta')} <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      )}

      {resultCount === 0 && (
        <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-3">
          <p className="text-sm font-bold text-white">{t('zeroTitle')}</p>
          <p className="mt-0.5 text-xs text-zinc-400">{t('zeroHint')}</p>
        </div>
      )}

      {(intent.priceCap || usagePricedHidden > 0) && (
        <div className="mt-3 space-y-1 text-2xs text-zinc-500">
          {intent.priceCap && <p>{t('budgetNote')}</p>}
          {usagePricedHidden > 0 && <p>{t('usageNote', { count: usagePricedHidden })}</p>}
        </div>
      )}
    </section>
  );
}
