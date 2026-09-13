'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { FlaskConical } from 'lucide-react';
import {
  EXPERIMENT_STATUSES,
  getExperiments,
  removeExperiment,
  saveExperiment,
  updateExperiment,
  type Experiment,
  type ExperimentStatus,
} from '@/lib/workspace';
import { OUTCOMES } from '@/data/outcomes';
import {
  ConfirmDeleteButton,
  EmptyState,
  FieldLabel,
  ToolChip,
  ToolSearchPicker,
  inputCls,
  type CatalogRow,
} from './shared';
import { track } from '@/lib/analytics';

function ExperimentEditor({
  experiment,
  catalog,
  bySlug,
  onChange,
  onClose,
}: {
  experiment: Experiment;
  catalog: CatalogRow[];
  bySlug: Map<string, CatalogRow>;
  onChange: (list: Experiment[]) => void;
  onClose: () => void;
}) {
  const t = useTranslations('my');
  const [title, setTitle] = useState(experiment.title);
  const [hypothesis, setHypothesis] = useState(experiment.hypothesis);
  const [result, setResult] = useState(experiment.result);
  const [dirty, setDirty] = useState(false);

  const save = () => {
    if (!title.trim()) return;
    onChange(updateExperiment(experiment.id, { title: title.trim(), hypothesis, result }));
    setDirty(false);
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-surface-1 p-5 sm:p-6">
      <button
        type="button"
        onClick={onClose}
        className="text-2xs font-bold text-zinc-400 hover:text-white"
      >
        ← {t('common.backToList')}
      </button>

      <div className="mt-3">
        <FieldLabel htmlFor={`exp-title-${experiment.id}`}>{t('experiments.titleLabel')}</FieldLabel>
        <input
          id={`exp-title-${experiment.id}`}
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setDirty(true);
          }}
          maxLength={120}
          className={inputCls}
        />
      </div>

      <div className="mt-3">
        <span className="mb-1.5 block text-2xs font-bold uppercase tracking-wider text-zinc-500" id={`exp-status-${experiment.id}`}>
          {t('experiments.statusLabel')}
        </span>
        <div className="flex flex-wrap gap-1.5" role="group" aria-labelledby={`exp-status-${experiment.id}`}>
          {EXPERIMENT_STATUSES.map((s: ExperimentStatus) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                onChange(updateExperiment(experiment.id, { status: s }));
                track('experiment_status_changed', { id: experiment.id, status: s });
              }}
              aria-pressed={experiment.status === s}
              className={`rounded-full border px-3 py-1.5 text-2xs font-bold transition-colors ${
                experiment.status === s
                  ? 'border-accent-500 bg-accent-500/20 text-accent-300'
                  : 'border-white/10 bg-surface-2 text-zinc-400 hover:border-white/25 hover:text-white'
              }`}
            >
              {t(`experiments.status.${s}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <span className="mb-1.5 block text-2xs font-bold uppercase tracking-wider text-zinc-500">
            {t('experiments.toolLabel')}
          </span>
          {experiment.toolSlug ? (
            <ToolChip
              slug={experiment.toolSlug}
              catalog={bySlug}
              onRemove={() => onChange(updateExperiment(experiment.id, { toolSlug: '' }))}
              removeLabel={t('common.remove')}
            />
          ) : (
            <ToolSearchPicker
              id={`exp-tool-${experiment.id}`}
              catalog={catalog}
              onPick={(slug) => onChange(updateExperiment(experiment.id, { toolSlug: slug }))}
            />
          )}
        </div>
        <div>
          <FieldLabel htmlFor={`exp-outcome-${experiment.id}`}>{t('experiments.outcomeLabel')}</FieldLabel>
          <select
            id={`exp-outcome-${experiment.id}`}
            value={experiment.outcomeSlug ?? ''}
            onChange={(e) => onChange(updateExperiment(experiment.id, { outcomeSlug: e.target.value }))}
            className={inputCls}
          >
            <option value="">{t('experiments.noOutcome')}</option>
            {OUTCOMES.map((o) => (
              <option key={o.slug} value={o.slug}>
                {o.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-3">
        <FieldLabel htmlFor={`exp-hyp-${experiment.id}`}>{t('experiments.hypothesisLabel')}</FieldLabel>
        <textarea
          id={`exp-hyp-${experiment.id}`}
          value={hypothesis}
          onChange={(e) => {
            setHypothesis(e.target.value);
            setDirty(true);
          }}
          rows={2}
          maxLength={1000}
          placeholder={t('experiments.hypothesisPlaceholder')}
          className={inputCls}
        />
      </div>

      <div className="mt-3">
        <FieldLabel htmlFor={`exp-result-${experiment.id}`}>{t('experiments.resultLabel')}</FieldLabel>
        <textarea
          id={`exp-result-${experiment.id}`}
          value={result}
          onChange={(e) => {
            setResult(e.target.value);
            setDirty(true);
          }}
          rows={3}
          maxLength={2000}
          placeholder={t('experiments.resultPlaceholder')}
          className={inputCls}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/10 pt-4">
        <button
          type="button"
          onClick={save}
          disabled={!dirty || !title.trim()}
          className="rounded-xl bg-accent-500 px-4 py-2 text-sm font-bold text-black transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {t('common.save')}
        </button>
        <span className="ml-auto">
          <ConfirmDeleteButton
            label={t('common.delete')}
            confirmLabel={t('common.confirmDelete')}
            onConfirm={() => {
              onChange(removeExperiment(experiment.id));
              track('experiment_deleted', { id: experiment.id });
              onClose();
            }}
          />
        </span>
      </div>
      <p className="mt-3 text-2xs text-zinc-600">
        {t('common.updatedAt')}{' '}
        <time className="font-mono tabular-nums">{experiment.updatedAt.slice(0, 10)}</time>
      </p>
    </div>
  );
}

export function ExperimentsTab({ catalog }: { catalog: CatalogRow[] }) {
  const t = useTranslations('my');
  const [items, setItems] = useState<Experiment[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState('');

  const bySlug = useMemo(() => new Map(catalog.map((r) => [r.slug, r])), [catalog]);

  useEffect(() => {
    setItems(getExperiments());
    setHydrated(true);
  }, []);

  if (!hydrated) return null;

  const openEntry = openId ? items.find((e) => e.id === openId) ?? null : null;
  if (openEntry) {
    return (
      <ExperimentEditor
        experiment={openEntry}
        catalog={catalog}
        bySlug={bySlug}
        onChange={setItems}
        onClose={() => setOpenId(null)}
      />
    );
  }

  return (
    <div>
      <div className="rounded-3xl border border-white/10 bg-surface-1 p-5">
        <h3 className="flex items-center gap-2 text-sm font-bold text-white">
          <FlaskConical className="h-4 w-4 text-accent-400" aria-hidden="true" /> {t('experiments.newTitle')}
        </h3>
        <p className="mt-1 text-2xs text-zinc-500">{t('experiments.intro')}</p>
        <form
          className="mt-3 flex flex-col gap-2 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            if (!draftTitle.trim()) return;
            const list = saveExperiment({ title: draftTitle.trim() });
            setItems(list);
            setDraftTitle('');
            setOpenId(list[0]?.id ?? null);
            track('experiment_created', {});
          }}
        >
          <input
            value={draftTitle}
            onChange={(e) => setDraftTitle(e.target.value)}
            placeholder={t('experiments.titlePlaceholder')}
            maxLength={120}
            aria-label={t('experiments.titleLabel')}
            className={`${inputCls} sm:flex-1`}
          />
          <button
            type="submit"
            disabled={!draftTitle.trim()}
            className="rounded-xl bg-accent-500 px-5 py-2.5 text-sm font-bold text-black transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {t('experiments.create')}
          </button>
        </form>
      </div>

      {items.length === 0 ? (
        <div className="mt-4">
          <EmptyState title={t('experiments.emptyTitle')} text={t('experiments.emptyText')} />
        </div>
      ) : (
        <ul className="mt-4 grid gap-3 lg:grid-cols-2">
          {items.map((e) => (
            <li key={e.id} className="rounded-2xl border border-white/10 bg-surface-1 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-bold text-white">{e.title}</p>
                  <p className="mt-0.5 text-2xs text-zinc-500">
                    {t(`experiments.status.${e.status}`)} ·{' '}
                    <time className="font-mono tabular-nums">{e.updatedAt.slice(0, 10)}</time>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpenId(e.id)}
                  className="shrink-0 rounded-xl bg-accent-500 px-4 py-2 text-2xs font-bold text-black transition-opacity hover:opacity-90"
                >
                  {t('common.open')}
                </button>
              </div>
              {(e.toolSlug || e.outcomeSlug) && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {e.toolSlug && <ToolChip slug={e.toolSlug} catalog={bySlug} />}
                  {e.outcomeSlug && (
                    <span className="inline-flex items-center rounded-xl border border-white/10 bg-surface-2 px-2.5 py-1.5 text-2xs font-semibold text-zinc-300">
                      {OUTCOMES.find((o) => o.slug === e.outcomeSlug)?.title ?? e.outcomeSlug}
                    </span>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
