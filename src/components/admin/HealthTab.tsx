'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

interface HealthPayload {
  configured: boolean;
  staleAfterDays: number;
  brokenLinks: {
    available: boolean;
    lastRun: string | null;
    broken: { toolSlug: string; url: string; statusCode: number; error: string | null; checkedAt: string }[];
  };
  stalePricing: {
    catalogTotal: number;
    neverCheckedCount: number;
    neverCheckedSample: { slug: string; name: string }[];
    staleCount: number;
    staleSample: { slug: string; name: string; checkedAt: string }[];
    missingSourceCount: number;
  };
  priceTracking: { available: boolean; toolsTracked: number; pointsRecorded: number; lastRecordedAt: string | null };
  reviewNeeded: { communityPending: number; communityReports: number; reviewsPending: number };
}

/**
 * Catalog health queues (P4): broken outbound links, stale pricing data,
 * price-tracking coverage, and a review-needed rollup. Stale-pricing
 * numbers are computed live from the catalog, so they work with no DB.
 */
export function HealthTab() {
  const t = useTranslations('admin');
  const [data, setData] = useState<HealthPayload | null>(null);

  useEffect(() => {
    let alive = true;
    fetch('/api/admin/health')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d) => {
        if (alive) setData(d);
      })
      .catch(() => {
        if (alive) setData(null);
      });
    return () => {
      alive = false;
    };
  }, []);

  if (!data) {
    return <p className="rounded-xl border border-white/10 bg-surface-1 p-6 text-sm text-zinc-500">{t('activityLoading')}</p>;
  }

  return (
    <section className="space-y-8">
      <div>
        <h2 className="mb-4 text-lg font-bold">{t('healthTitle')}</h2>
        <p className="mb-4 text-2xs leading-relaxed text-zinc-500">{t('healthIntro')}</p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: t('reviewCommunity'), value: data.reviewNeeded.communityPending },
            { label: t('reviewReports'), value: data.reviewNeeded.communityReports },
            { label: t('reviewReviews'), value: data.reviewNeeded.reviewsPending },
          ].map((c) => (
            <div key={c.label} className="rounded-xl border border-white/10 bg-surface-1 p-3 text-center">
              <p className="font-mono text-xl font-black tabular-nums text-white">{c.value}</p>
              <p className="mt-0.5 text-2xs text-zinc-500">{c.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-black uppercase tracking-wider text-zinc-400">
          {t('brokenTitle', { count: data.brokenLinks.broken.length })}
        </h3>
        {!data.brokenLinks.available ? (
          <p className="rounded-xl border border-white/10 bg-surface-1 p-4 text-xs text-zinc-500">{t('healthNotConfigured')}</p>
        ) : data.brokenLinks.broken.length === 0 ? (
          <p className="rounded-xl border border-white/10 bg-surface-1 p-4 text-xs text-zinc-500">
            {t('brokenEmpty')}
            {data.brokenLinks.lastRun && (
              <span className="mt-1 block font-mono text-2xs">{t('lastRun', { date: data.brokenLinks.lastRun.slice(0, 10) })}</span>
            )}
          </p>
        ) : (
          <>
            <ul className="space-y-2">
              {data.brokenLinks.broken.map((b, i) => (
                <li key={`${b.toolSlug}:${i}`} className="rounded-xl border border-white/10 bg-surface-1 p-4 text-2xs">
                  <p className="font-mono text-zinc-200">
                    {b.toolSlug} <span className="text-zinc-500">· HTTP {b.statusCode}</span>
                  </p>
                  <p className="mt-0.5 break-all font-mono text-zinc-500">{b.url}</p>
                  {b.error && <p className="mt-0.5 text-rose-300/80">{b.error}</p>}
                  <p className="mt-0.5 font-mono text-zinc-600">{b.checkedAt.slice(0, 10)}</p>
                </li>
              ))}
            </ul>
            {data.brokenLinks.lastRun && (
              <p className="mt-2 font-mono text-2xs text-zinc-500">{t('lastRun', { date: data.brokenLinks.lastRun.slice(0, 10) })}</p>
            )}
          </>
        )}
      </div>

      <div>
        <h3 className="mb-3 text-sm font-black uppercase tracking-wider text-zinc-400">{t('staleTitle')}</h3>
        <p className="mb-3 text-2xs text-zinc-500">{t('staleIntro', { days: data.staleAfterDays })}</p>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-surface-1 p-4">
            <h4 className="mb-2 text-xs font-bold text-zinc-300">{t('neverChecked', { count: data.stalePricing.neverCheckedCount })}</h4>
            {data.stalePricing.neverCheckedSample.length === 0 ? (
              <p className="text-2xs text-zinc-500">{t('staleEmpty')}</p>
            ) : (
              <ul className="space-y-1">
                {data.stalePricing.neverCheckedSample.map((s) => (
                  <li key={s.slug} className="truncate font-mono text-2xs text-zinc-400" title={s.name}>
                    {s.slug}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="rounded-xl border border-white/10 bg-surface-1 p-4">
            <h4 className="mb-2 text-xs font-bold text-zinc-300">{t('staleCount', { count: data.stalePricing.staleCount })}</h4>
            {data.stalePricing.staleSample.length === 0 ? (
              <p className="text-2xs text-zinc-500">{t('staleEmpty')}</p>
            ) : (
              <ul className="space-y-1">
                {data.stalePricing.staleSample.map((s) => (
                  <li key={s.slug} className="flex items-baseline justify-between gap-3 font-mono text-2xs text-zinc-400">
                    <span className="min-w-0 truncate" title={s.name}>
                      {s.slug}
                    </span>
                    <span className="shrink-0 tabular-nums text-zinc-600">{s.checkedAt}</span>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-3 border-t border-white/10 pt-2 text-2xs text-zinc-500">
              {t('missingSource', { count: data.stalePricing.missingSourceCount })}
            </p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-black uppercase tracking-wider text-zinc-400">{t('trackingTitle')}</h3>
        {!data.priceTracking.available ? (
          <p className="rounded-xl border border-white/10 bg-surface-1 p-4 text-xs text-zinc-500">{t('healthNotConfigured')}</p>
        ) : (
          <div className="rounded-xl border border-white/10 bg-surface-1 p-4 text-2xs text-zinc-400">
            <p>{t('trackedTools', { tracked: data.priceTracking.toolsTracked, total: data.stalePricing.catalogTotal })}</p>
            <p className="mt-1">{t('pointsRecorded', { count: data.priceTracking.pointsRecorded })}</p>
            {data.priceTracking.lastRecordedAt && (
              <p className="mt-1 font-mono">{t('lastRecorded', { date: data.priceTracking.lastRecordedAt.slice(0, 10) })}</p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
