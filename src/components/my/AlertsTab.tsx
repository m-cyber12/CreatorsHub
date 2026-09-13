'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { BellRing, CircleCheck } from 'lucide-react';
import {
  acknowledgeToolChanges,
  computeAlerts,
  getSavedTools,
  type AlertKind,
  type WorkspaceAlert,
} from '@/lib/workspace';
import { EmptyState } from './shared';
import { track } from '@/lib/analytics';

const KIND_STYLES: Record<AlertKind, string> = {
  'price-changed': 'border-amber-500/25 bg-amber-500/5',
  'pricing-model-changed': 'border-amber-500/25 bg-amber-500/5',
  'verification-upgraded': 'border-emerald-500/25 bg-emerald-500/5',
  'tool-retired': 'border-red-500/25 bg-red-500/5',
  'tool-unlisted': 'border-white/15 bg-surface-1',
};

export function AlertsTab() {
  const t = useTranslations('my');
  const [alerts, setAlerts] = useState<WorkspaceAlert[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const recompute = useCallback(() => {
    setAlerts(computeAlerts(getSavedTools()));
  }, []);

  useEffect(() => {
    recompute();
    setHydrated(true);
  }, [recompute]);

  if (!hydrated) return null;

  if (alerts.length === 0) {
    return (
      <EmptyState
        title={t('alerts.emptyTitle')}
        text={t('alerts.emptyText')}
        ctaHref="/tools"
        ctaLabel={t('alerts.emptyCta')}
      />
    );
  }

  const acknowledge = (slug: string) => {
    acknowledgeToolChanges(slug);
    recompute();
    track('alert_acknowledged', { slug });
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-sm text-zinc-400">
          <BellRing className="h-4 w-4 text-accent-400" aria-hidden="true" />
          {t('alerts.intro', { count: alerts.length })}
        </p>
        <button
          type="button"
          onClick={() => {
            const slugs = [...new Set(alerts.map((a) => a.slug))];
            for (const slug of slugs) acknowledgeToolChanges(slug);
            recompute();
            track('alerts_acknowledged_all', { count: slugs.length });
          }}
          className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-zinc-300 hover:border-white/25 hover:text-white"
        >
          <CircleCheck className="h-3.5 w-3.5" aria-hidden="true" /> {t('alerts.acknowledgeAll')}
        </button>
      </div>
      <ul className="mt-4 space-y-3">
        {alerts.map((a, i) => (
          <li key={`${a.slug}-${a.kind}-${i}`} className={`rounded-2xl border p-4 ${KIND_STYLES[a.kind]}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-2xs font-bold uppercase tracking-wider text-zinc-500">
                  {t(`alerts.kinds.${a.kind}`)}
                </p>
                <p className="mt-1 text-sm font-bold text-white">
                  {a.kind === 'tool-retired' || a.kind === 'tool-unlisted' ? (
                    <span className="font-mono">{a.toolName}</span>
                  ) : (
                    <Link href={`/tool/${a.slug}`} className="hover:text-accent-300 hover:underline">
                      {a.toolName}
                    </Link>
                  )}
                </p>
                <p className="mt-0.5 font-mono text-xs tabular-nums text-zinc-400">{a.detail}</p>
                {a.kind === 'tool-retired' && (
                  <p className="mt-1 text-2xs text-zinc-500">{t('alerts.retiredHint')}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => acknowledge(a.slug)}
                className="shrink-0 rounded-xl border border-white/10 px-3 py-2 text-2xs font-bold text-zinc-300 hover:border-white/25 hover:text-white"
              >
                {t('alerts.acknowledge')}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
