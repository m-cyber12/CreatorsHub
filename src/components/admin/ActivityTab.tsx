'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

interface AnalyticsPayload {
  configured: boolean;
  eventsAvailable: boolean;
  searchesAvailable: boolean;
  windowDays: number;
  headlines: { event: string; total: number }[];
  events: { totals30d: Record<string, number>; daily: { day: string; event: string; total: number }[] };
  searches: {
    total30d: number;
    top: { query: string; searches: number; zeroResultHits: number; lastSearched: string }[];
    zeroResult: { query: string; searches: number; lastSearched: string }[];
  };
  intent: {
    searches: number;
    budget: number;
    free: number;
    cheap: number;
    versus: number;
    stack: number;
    outcome: number;
    noSignal: number;
    topOutcomes: { slug: string; count: number }[];
  };
  tools: { total30d: number; truncated: boolean; top: { slug: string; name: string; views: number }[] };
}

const INTENT_KINDS = ['budget', 'free', 'cheap', 'versus', 'stack', 'outcome', 'noSignal'] as const;

/**
 * Admin activity dashboard (P4). First-party aggregates only — beacon
 * events, search_log, and server-side intent parsing. Every section states
 * its own availability so missing tables read as instructions, not zeros.
 */
export function ActivityTab() {
  const t = useTranslations('admin');
  const [data, setData] = useState<AnalyticsPayload | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch('/api/admin/analytics')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d) => {
        if (alive) setData(d);
      })
      .catch(() => {
        if (alive) setFailed(true);
      });
    return () => {
      alive = false;
    };
  }, []);

  if (failed) {
    return <p className="rounded-xl border border-white/10 bg-surface-1 p-6 text-sm text-zinc-500">{t('activityFailed')}</p>;
  }
  if (!data) {
    return <p className="rounded-xl border border-white/10 bg-surface-1 p-6 text-sm text-zinc-500">{t('activityLoading')}</p>;
  }
  if (!data.configured) {
    return (
      <section>
        <h2 className="mb-4 text-lg font-bold">{t('activityTitle')}</h2>
        <p className="rounded-xl border border-white/10 bg-surface-1 p-6 text-sm text-zinc-400">{t('activityNotConfigured')}</p>
      </section>
    );
  }

  const maxHeadline = Math.max(1, ...data.headlines.map((h) => h.total));

  return (
    <section className="space-y-8">
      <div>
        <h2 className="mb-4 text-lg font-bold">{t('activityTitle')}</h2>
        <p className="mb-4 text-2xs leading-relaxed text-zinc-500">{t('activityIntro', { days: data.windowDays })}</p>
        {!data.eventsAvailable ? (
          <p className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-4 text-xs text-amber-200">
            {t('eventsUnavailable')}
          </p>
        ) : (
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {data.headlines.map((h) => (
              <li key={h.event} className="rounded-xl border border-white/10 bg-surface-1 p-3">
                <p className="font-mono text-xl font-black tabular-nums text-white">{h.total.toLocaleString()}</p>
                <p className="mt-0.5 truncate font-mono text-2xs text-zinc-500" title={h.event}>
                  {h.event}
                </p>
                <div className="mt-2 h-1 overflow-hidden rounded bg-white/5" aria-hidden="true">
                  <div className="h-full rounded bg-accent-500" style={{ width: `${(h.total / maxHeadline) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h3 className="mb-3 text-sm font-black uppercase tracking-wider text-zinc-400">{t('searchesTitle')}</h3>
        {!data.searchesAvailable ? (
          <p className="rounded-xl border border-white/10 bg-surface-1 p-4 text-xs text-zinc-500">{t('eventsUnavailable')}</p>
        ) : (
          <>
            <p className="mb-3 font-mono text-2xs tabular-nums text-zinc-400">
              {t('searchesTotal', { count: data.searches.total30d })}
            </p>
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-surface-1 p-4">
                <h4 className="mb-2 text-xs font-bold text-zinc-300">{t('topSearches')}</h4>
                {data.searches.top.length === 0 ? (
                  <p className="text-2xs text-zinc-500">{t('searchesEmpty')}</p>
                ) : (
                  <ul className="space-y-1.5">
                    {data.searches.top.map((s) => (
                      <li key={s.query} className="flex items-baseline justify-between gap-3 text-2xs">
                        <span className="min-w-0 truncate text-zinc-300">{s.query}</span>
                        <span className="shrink-0 font-mono tabular-nums text-zinc-500">
                          {s.searches}×{s.zeroResultHits > 0 && <span className="text-amber-300"> · 0-res {s.zeroResultHits}×</span>}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="rounded-xl border border-white/10 bg-surface-1 p-4">
                <h4 className="mb-2 text-xs font-bold text-zinc-300">{t('zeroResultTitle')}</h4>
                {data.searches.zeroResult.length === 0 ? (
                  <p className="text-2xs text-zinc-500">{t('zeroEmpty')}</p>
                ) : (
                  <ul className="space-y-1.5">
                    {data.searches.zeroResult.map((s) => (
                      <li key={s.query} className="flex items-baseline justify-between gap-3 text-2xs">
                        <span className="min-w-0 truncate text-zinc-300">{s.query}</span>
                        <span className="shrink-0 font-mono tabular-nums text-amber-300">{s.searches}×</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <div>
        <h3 className="mb-3 text-sm font-black uppercase tracking-wider text-zinc-400">{t('intentTitle')}</h3>
        <p className="mb-3 text-2xs text-zinc-500">{t('intentNote')}</p>
        {data.intent.searches === 0 ? (
          <p className="rounded-xl border border-white/10 bg-surface-1 p-4 text-xs text-zinc-500">{t('searchesEmpty')}</p>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            <ul className="rounded-xl border border-white/10 bg-surface-1 p-4">
              {INTENT_KINDS.map((k) => (
                <li key={k} className="flex items-baseline justify-between gap-3 py-1 text-2xs">
                  <span className="font-mono text-zinc-400">{k}</span>
                  <span className="font-mono tabular-nums text-zinc-200">{data.intent[k].toLocaleString()}</span>
                </li>
              ))}
              <li className="mt-1 flex items-baseline justify-between gap-3 border-t border-white/10 pt-2 text-2xs">
                <span className="font-mono text-zinc-400">searches</span>
                <span className="font-mono tabular-nums text-white">{data.intent.searches.toLocaleString()}</span>
              </li>
            </ul>
            <div className="rounded-xl border border-white/10 bg-surface-1 p-4">
              <h4 className="mb-2 text-xs font-bold text-zinc-300">{t('intentOutcomes')}</h4>
              {data.intent.topOutcomes.length === 0 ? (
                <p className="text-2xs text-zinc-500">{t('searchesEmpty')}</p>
              ) : (
                <ul className="space-y-1.5">
                  {data.intent.topOutcomes.map((o) => (
                    <li key={o.slug} className="flex items-baseline justify-between gap-3 text-2xs">
                      <span className="min-w-0 truncate font-mono text-zinc-300">{o.slug}</span>
                      <span className="shrink-0 font-mono tabular-nums text-zinc-500">{o.count}×</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>

      <div>
        <h3 className="mb-3 text-sm font-black uppercase tracking-wider text-zinc-400">{t('toolsTitle')}</h3>
        {!data.eventsAvailable ? (
          <p className="rounded-xl border border-white/10 bg-surface-1 p-4 text-xs text-zinc-500">{t('eventsUnavailable')}</p>
        ) : data.tools.top.length === 0 ? (
          <p className="rounded-xl border border-white/10 bg-surface-1 p-4 text-xs text-zinc-500">{t('toolsEmpty')}</p>
        ) : (
          <>
            <ul className="space-y-1.5 rounded-xl border border-white/10 bg-surface-1 p-4">
              {data.tools.top.map((x) => (
                <li key={x.slug} className="flex items-baseline justify-between gap-3 text-2xs">
                  <span className="min-w-0 truncate text-zinc-300">
                    {x.name} <span className="font-mono text-zinc-600">{x.slug}</span>
                  </span>
                  <span className="shrink-0 font-mono tabular-nums text-zinc-200">{x.views.toLocaleString()}</span>
                </li>
              ))}
            </ul>
            {data.tools.truncated && <p className="mt-2 text-2xs text-amber-300/80">{t('truncatedNote')}</p>}
          </>
        )}
      </div>
    </section>
  );
}
