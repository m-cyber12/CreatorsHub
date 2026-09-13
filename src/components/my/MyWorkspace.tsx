'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Bell, FlaskConical, GitCompareArrows, Layers, SlidersHorizontal, Wrench, Workflow as WorkflowIcon } from 'lucide-react';
import { useBookmarks } from '@/context/AppProviders';
import {
  WORKSPACE_CHANGED_EVENT,
  computeAlerts,
  decodeSharePayload,
  getExperiments,
  getSavedComparisons,
  getSavedStacks,
  getSavedWorkflows,
  getSavedTools,
  importSharedStack,
  importSharedWorkflow,
} from '@/lib/workspace';
import { ToolsTab } from './ToolsTab';
import { StacksTab } from './StacksTab';
import { WorkflowsTab } from './WorkflowsTab';
import { ComparisonsTab } from './ComparisonsTab';
import { ExperimentsTab } from './ExperimentsTab';
import { AlertsTab } from './AlertsTab';
import { PreferencesTab } from './PreferencesTab';
import type { CatalogRow } from './shared';
import { track } from '@/lib/analytics';

const TABS = ['tools', 'stacks', 'workflows', 'comparisons', 'experiments', 'alerts', 'preferences'] as const;
type Tab = (typeof TABS)[number];

const TAB_ICONS: Record<Tab, typeof Wrench> = {
  tools: Wrench,
  stacks: Layers,
  workflows: WorkflowIcon,
  comparisons: GitCompareArrows,
  experiments: FlaskConical,
  alerts: Bell,
  preferences: SlidersHorizontal,
};

function ImportBanner({ onImported }: { onImported: (tab: Tab) => void }) {
  const t = useTranslations('my');
  const [code, setCode] = useState<string | null>(null);

  useEffect(() => {
    const hash = window.location.hash;
    const m = hash.match(/^#import=(.+)$/);
    if (m) setCode(decodeURIComponent(m[1]));
  }, []);

  const payload = useMemo(() => (code ? decodeSharePayload(code) : null), [code]);
  if (!code) return null;

  const clear = () => {
    setCode(null);
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
  };

  const name = typeof payload?.data.name === 'string' ? payload.data.name : null;

  const doImport = () => {
    if (!payload) return;
    const ok =
      payload.kind === 'stack'
        ? importSharedStack(payload.data)
        : importSharedWorkflow(payload.data);
    if (ok) {
      track('workspace_imported', { kind: payload.kind });
      onImported(payload.kind === 'stack' ? 'stacks' : 'workflows');
    }
    clear();
  };

  return (
    <div className="mb-4 rounded-2xl border border-accent-500/30 bg-accent-500/10 p-4">
      {payload && name ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-white">
              {payload.kind === 'stack' ? t('import.sharedStackTitle') : t('import.sharedWorkflowTitle')}
            </p>
            <p className="mt-0.5 text-sm text-zinc-300">
              “{name}” — {t('import.sharedText')}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={doImport}
              className="rounded-xl bg-accent-500 px-4 py-2 text-sm font-bold text-black hover:opacity-90"
            >
              {t('import.import')}
            </button>
            <button
              type="button"
              onClick={clear}
              className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-zinc-300 hover:text-white"
            >
              {t('import.dismiss')}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-zinc-300">{t('import.invalid')}</p>
          <button
            type="button"
            onClick={clear}
            className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-zinc-300 hover:text-white"
          >
            {t('import.dismiss')}
          </button>
        </div>
      )}
    </div>
  );
}

function WorkspaceBody({ catalog }: { catalog: CatalogRow[] }) {
  const t = useTranslations('my');
  const sp = useSearchParams();
  const { bookmarks } = useBookmarks();
  const [tab, setTab] = useState<Tab>(() => {
    const q = sp.get('tab');
    return q && (TABS as readonly string[]).includes(q) ? (q as Tab) : 'tools';
  });
  const [counts, setCounts] = useState({ stacks: 0, workflows: 0, comparisons: 0, experiments: 0, alerts: 0 });

  const refreshCounts = useCallback(() => {
    try {
      setCounts({
        stacks: getSavedStacks().length,
        workflows: getSavedWorkflows().length,
        comparisons: getSavedComparisons().length,
        experiments: getExperiments().length,
        alerts: computeAlerts(getSavedTools()).length,
      });
    } catch {
      // private mode — counts stay zero
    }
  }, []);

  useEffect(() => {
    refreshCounts();
    window.addEventListener(WORKSPACE_CHANGED_EVENT, refreshCounts);
    window.addEventListener('storage', refreshCounts);
    window.addEventListener('focus', refreshCounts);
    return () => {
      window.removeEventListener(WORKSPACE_CHANGED_EVENT, refreshCounts);
      window.removeEventListener('storage', refreshCounts);
      window.removeEventListener('focus', refreshCounts);
    };
  }, [refreshCounts]);

  const select = (next: Tab) => {
    setTab(next);
    refreshCounts();
    const url = new URL(window.location.href);
    url.searchParams.set('tab', next);
    url.searchParams.delete('open');
    window.history.replaceState(null, '', url.toString());
  };

  const countFor = (id: Tab): number | null => {
    if (id === 'tools') return bookmarks.length;
    if (id === 'preferences') return null;
    return counts[id];
  };

  return (
    <div>
      <ImportBanner onImported={(next) => { select(next); refreshCounts(); }} />
      <div role="tablist" aria-label={t('title')} className="flex gap-1.5 overflow-x-auto pb-1">
        {TABS.map((id) => {
          const Icon = TAB_ICONS[id];
          const active = tab === id;
          const count = countFor(id);
          return (
            <button
              key={id}
              role="tab"
              aria-selected={active}
              onClick={() => select(id)}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-2 text-2xs font-bold transition-colors ${
                active
                  ? 'border-accent-500 bg-accent-500/20 text-accent-200'
                  : 'border-white/10 bg-surface-1 text-zinc-400 hover:border-white/25 hover:text-white'
              }`}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              {t(`tabs.${id}`)}
              {count !== null && count > 0 && (
                <span
                  className={`rounded-full px-1.5 py-0.5 font-mono text-2xs tabular-nums ${
                    id === 'alerts' ? 'bg-amber-500/25 text-amber-200' : 'bg-white/10 text-zinc-300'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div role="tabpanel" className="mt-5">
        {tab === 'tools' && <ToolsTab catalog={catalog} />}
        {tab === 'stacks' && <StacksTab catalog={catalog} />}
        {tab === 'workflows' && <WorkflowsTab catalog={catalog} />}
        {tab === 'comparisons' && <ComparisonsTab catalog={catalog} />}
        {tab === 'experiments' && <ExperimentsTab catalog={catalog} />}
        {tab === 'alerts' && <AlertsTab />}
        {tab === 'preferences' && <PreferencesTab catalog={catalog} />}
      </div>
    </div>
  );
}

export function MyWorkspace({ catalog }: { catalog: CatalogRow[] }) {
  return (
    <Suspense fallback={null}>
      <WorkspaceBody catalog={catalog} />
    </Suspense>
  );
}
