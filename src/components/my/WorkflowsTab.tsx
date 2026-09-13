'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowDown, ArrowLeft, ArrowUp, Copy, ExternalLink, ListChecks, Workflow as WorkflowIcon } from 'lucide-react';
import { WORKFLOWS, getWorkflow, type WorkflowTemplate } from '@/data/workflows';
import {
  duplicateWorkflowEntry,
  encodeSharePayload,
  getSavedWorkflows,
  newWorkspaceId,
  removeWorkflowEntry,
  saveWorkflowEntry,
  updateWorkflowEntry,
  type SavedWorkflowEntry,
  type WorkflowStep,
} from '@/lib/workspace';
import {
  ConfirmDeleteButton,
  CopyLinkButton,
  EmptyState,
  FieldLabel,
  ToolChip,
  ToolSearchPicker,
  inputCls,
  type CatalogRow,
} from './shared';
import { track } from '@/lib/analytics';

function workflowShareUrl(locale: string, entry: SavedWorkflowEntry): string {
  const code = encodeSharePayload('workflow', entry);
  if (!code) return '';
  return `${window.location.origin}/${locale}/my?tab=workflows#import=${code}`;
}

function RunMode({ steps }: { steps: { id: string; title: string }[] }) {
  const t = useTranslations('my');
  const [done, setDone] = useState<Set<string>>(new Set());
  const toggle = (id: string) =>
    setDone((cur) => {
      const next = new Set(cur);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  return (
    <div className="mt-4 rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-sm font-bold text-emerald-200">
          <ListChecks className="h-4 w-4" aria-hidden="true" /> {t('workflows.runTitle')}
        </h3>
        <p className="font-mono text-2xs tabular-nums text-emerald-200/70">
          {t('workflows.runProgress', { done: done.size, total: steps.length })}
        </p>
      </div>
      <p className="mt-1 text-2xs text-emerald-200/50">{t('workflows.runNote')}</p>
      <ol className="mt-3 space-y-2">
        {steps.map((s, i) => {
          const checked = done.has(s.id);
          return (
            <li key={s.id}>
              <label
                className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 text-sm transition-colors ${
                  checked ? 'border-emerald-500/40 bg-emerald-500/10 text-zinc-400 line-through' : 'border-white/10 bg-surface-1 text-zinc-100 hover:border-white/25'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(s.id)}
                  className="h-4 w-4 shrink-0 accent-emerald-500"
                />
                <span className="font-mono text-2xs tabular-nums text-zinc-600">{i + 1}</span>
                <span className="min-w-0 flex-1 truncate">{s.title}</span>
              </label>
            </li>
          );
        })}
      </ol>
      {done.size > 0 && (
        <button
          type="button"
          onClick={() => setDone(new Set())}
          className="mt-3 rounded-lg border border-white/10 px-3 py-1.5 text-2xs font-bold text-zinc-300 hover:text-white"
        >
          {t('workflows.runReset')}
        </button>
      )}
    </div>
  );
}

function WorkflowEditor({
  entry,
  catalog,
  bySlug,
  onChange,
  onClose,
}: {
  entry: SavedWorkflowEntry;
  catalog: CatalogRow[];
  bySlug: Map<string, CatalogRow>;
  onChange: (list: SavedWorkflowEntry[]) => void;
  onClose: () => void;
}) {
  const t = useTranslations('my');
  const locale = useLocale();
  const [name, setName] = useState(entry.name);
  const [notes, setNotes] = useState(entry.notes ?? '');
  const [notesDirty, setNotesDirty] = useState(false);
  const [runOpen, setRunOpen] = useState(false);

  const template: WorkflowTemplate | undefined =
    entry.slug === 'custom' ? undefined : getWorkflow(entry.slug);
  const steps: WorkflowStep[] = useMemo(
    () => (entry.slug === 'custom' ? (entry.steps ?? []) : []),
    [entry.slug, entry.steps]
  );

  const playbookHref =
    template != null
      ? `/workflows/${template.slug}${
          Object.keys(entry.picks).length > 0
            ? `?pick=${Object.entries(entry.picks).map(([id, sl]) => `${id}:${sl}`).join(',')}`
            : ''
        }`
      : null;

  const setStepTool = (nodeId: string, slug: string) =>
    onChange(updateWorkflowEntry(entry.id, { picks: { ...entry.picks, [nodeId]: slug } }));
  const clearStepTool = (nodeId: string) => {
    const next = { ...entry.picks };
    delete next[nodeId];
    onChange(updateWorkflowEntry(entry.id, { picks: next }));
  };

  const patchSteps = (next: WorkflowStep[]) => onChange(updateWorkflowEntry(entry.id, { steps: next }));
  const moveStep = (idx: number, dir: -1 | 1) => {
    const next = [...steps];
    const j = idx + dir;
    if (j < 0 || j >= next.length) return;
    [next[idx], next[j]] = [next[j], next[idx]];
    patchSteps(next);
  };

  const runSteps: { id: string; title: string }[] =
    template != null
      ? template.nodes.map((n) => ({ id: n.id, title: n.label }))
      : steps.map((s) => ({ id: s.id, title: s.title }));

  return (
    <div className="rounded-3xl border border-white/10 bg-surface-1 p-5 sm:p-6">
      <button
        type="button"
        onClick={onClose}
        className="inline-flex items-center gap-1.5 text-2xs font-bold text-zinc-400 hover:text-white"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" /> {t('common.backToList')}
      </button>

      <div className="mt-3">
        <FieldLabel htmlFor={`wf-name-${entry.id}`}>{t('workflows.nameLabel')}</FieldLabel>
        <input
          id={`wf-name-${entry.id}`}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => {
            if (name.trim() && name.trim() !== entry.name) onChange(updateWorkflowEntry(entry.id, { name: name.trim() }));
            else setName(entry.name);
          }}
          maxLength={80}
          className={inputCls}
        />
      </div>

      {template != null && (
        <div className="mt-4">
          <h3 className="text-sm font-bold text-white">{t('workflows.stepsTitle', { count: template.nodes.length })}</h3>
          <p className="mt-0.5 text-2xs text-zinc-500">{t('workflows.playbookNote', { title: template.title })}</p>
          <ol className="mt-3 space-y-2">
            {template.nodes.map((n, i) => {
              const effective = entry.picks[n.id] ?? n.tool;
              return (
                <li key={n.id} className="rounded-xl border border-white/10 bg-surface-2/60 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-2xs tabular-nums text-zinc-600">{i + 1}</span>
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold text-zinc-100">{n.label}</span>
                    {entry.picks[n.id] && (
                      <button
                        type="button"
                        onClick={() => clearStepTool(n.id)}
                        title={t('workflows.resetStep')}
                        className="shrink-0 rounded-lg px-2 py-1 text-2xs font-bold text-zinc-500 hover:bg-white/5 hover:text-white"
                      >
                        {t('workflows.resetStep')}
                      </button>
                    )}
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    {effective ? (
                      <ToolChip slug={effective} catalog={bySlug} />
                    ) : (
                      <span className="text-2xs text-zinc-600">{t('workflows.noTool')}</span>
                    )}
                  </div>
                  <details className="mt-1.5">
                    <summary className="cursor-pointer text-2xs font-bold text-zinc-500 hover:text-white">
                      {t('workflows.changeTool')}
                    </summary>
                    <div className="mt-2">
                      <ToolSearchPicker
                        id={`wf-pick-${entry.id}-${n.id}`}
                        catalog={catalog}
                        exclude={effective ? [effective] : []}
                        onPick={(slug) => setStepTool(n.id, slug)}
                      />
                    </div>
                  </details>
                </li>
              );
            })}
          </ol>
        </div>
      )}

      {entry.slug === 'custom' && (
        <div className="mt-4">
          <h3 className="text-sm font-bold text-white">{t('workflows.stepsTitle', { count: steps.length })}</h3>
          {steps.length === 0 ? (
            <p className="mt-1 text-sm text-zinc-500">{t('workflows.noStepsYet')}</p>
          ) : (
            <ol className="mt-3 space-y-2">
              {steps.map((s, i) => (
                <li key={s.id} className="rounded-xl border border-white/10 bg-surface-2/60 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-2xs tabular-nums text-zinc-600">{i + 1}</span>
                    <input
                      value={s.title}
                      onChange={(e) => {
                        const next = [...steps];
                        next[i] = { ...s, title: e.target.value };
                        patchSteps(next);
                      }}
                      maxLength={120}
                      aria-label={t('workflows.stepTitleLabel', { index: i + 1 })}
                      className="min-w-0 flex-1 rounded-lg border border-transparent bg-transparent px-1 py-0.5 text-sm font-semibold text-zinc-100 focus:border-accent-500/60 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => moveStep(i, -1)}
                      disabled={i === 0}
                      aria-label={t('stacks.moveUp')}
                      className="rounded-lg p-1 text-zinc-500 hover:bg-white/5 hover:text-white disabled:opacity-30"
                    >
                      <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveStep(i, 1)}
                      disabled={i === steps.length - 1}
                      aria-label={t('stacks.moveDown')}
                      className="rounded-lg p-1 text-zinc-500 hover:bg-white/5 hover:text-white disabled:opacity-30"
                    >
                      <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => patchSteps(steps.filter((_, j) => j !== i))}
                      aria-label={t('workflows.removeStep')}
                      className="rounded-lg p-1 text-zinc-500 hover:bg-white/5 hover:text-red-400"
                    >
                      ×
                    </button>
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    {s.toolSlug ? (
                      <ToolChip
                        slug={s.toolSlug}
                        catalog={bySlug}
                        onRemove={() => {
                          const next = [...steps];
                          next[i] = { ...s, toolSlug: undefined };
                          patchSteps(next);
                        }}
                        removeLabel={t('common.remove')}
                      />
                    ) : (
                      <span className="text-2xs text-zinc-600">{t('workflows.noTool')}</span>
                    )}
                  </div>
                  <details className="mt-1.5">
                    <summary className="cursor-pointer text-2xs font-bold text-zinc-500 hover:text-white">
                      {s.toolSlug ? t('workflows.changeTool') : t('workflows.linkTool')}
                    </summary>
                    <div className="mt-2">
                      <ToolSearchPicker
                        id={`wf-custom-${entry.id}-${s.id}`}
                        catalog={catalog}
                        exclude={s.toolSlug ? [s.toolSlug] : []}
                        onPick={(slug) => {
                          const next = [...steps];
                          next[i] = { ...s, toolSlug: slug };
                          patchSteps(next);
                        }}
                      />
                    </div>
                  </details>
                </li>
              ))}
            </ol>
          )}
          <button
            type="button"
            onClick={() =>
              patchSteps([...steps, { id: newWorkspaceId('step'), title: t('workflows.newStepTitle') }].slice(0, 24))
            }
            className="mt-3 rounded-xl border border-dashed border-white/20 px-4 py-2 text-sm font-bold text-zinc-300 hover:border-white/40 hover:text-white"
          >
            {t('workflows.addStep')}
          </button>
        </div>
      )}

      {entry.slug !== 'custom' && template == null && (
        <p className="mt-4 rounded-2xl border border-dashed border-amber-500/40 bg-amber-500/5 p-4 text-sm text-amber-200/90">
          {t('workflows.playbookGone', { slug: entry.slug })}
        </p>
      )}

      {runSteps.length > 0 && (
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setRunOpen((v) => !v)}
            aria-expanded={runOpen}
            className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-bold text-emerald-200 hover:bg-emerald-500/20"
          >
            {runOpen ? t('workflows.hideRun') : t('workflows.startRun')}
          </button>
          {runOpen && <RunMode steps={runSteps} />}
        </div>
      )}

      <div className="mt-4">
        <FieldLabel htmlFor={`wf-notes-${entry.id}`}>{t('workflows.notesLabel')}</FieldLabel>
        <textarea
          id={`wf-notes-${entry.id}`}
          value={notes}
          onChange={(e) => {
            setNotes(e.target.value);
            setNotesDirty(true);
          }}
          rows={2}
          maxLength={500}
          placeholder={t('workflows.notesPlaceholder')}
          className={inputCls}
        />
        {notesDirty && (
          <button
            type="button"
            onClick={() => {
              onChange(updateWorkflowEntry(entry.id, { notes }));
              setNotesDirty(false);
            }}
            className="mt-2 rounded-lg bg-accent-500 px-3 py-1.5 text-2xs font-bold text-black hover:opacity-90"
          >
            {t('common.save')}
          </button>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/10 pt-4">
        <CopyLinkButton
          getText={() => workflowShareUrl(locale, entry)}
          label={t('common.share')}
          copiedLabel={t('common.copied')}
        />
        {playbookHref && (
          <Link
            href={playbookHref}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-zinc-300 transition-colors hover:border-white/25 hover:text-white"
          >
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /> {t('workflows.openPlaybook')}
          </Link>
        )}
        <button
          type="button"
          onClick={() => {
            const list = duplicateWorkflowEntry(entry.id);
            onChange(list);
            track('workflow_duplicated', { id: entry.id });
          }}
          className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-zinc-300 transition-colors hover:border-white/25 hover:text-white"
        >
          <Copy className="h-3.5 w-3.5" aria-hidden="true" /> {t('common.duplicate')}
        </button>
        <span className="ml-auto">
          <ConfirmDeleteButton
            label={t('common.delete')}
            confirmLabel={t('common.confirmDelete')}
            onConfirm={() => {
              onChange(removeWorkflowEntry(entry.id));
              track('workflow_deleted', { id: entry.id });
              onClose();
            }}
          />
        </span>
      </div>
      <p className="mt-3 text-2xs text-zinc-600">
        {t('common.updatedAt')}{' '}
        <time className="font-mono tabular-nums">{(entry.updatedAt ?? entry.savedAt).slice(0, 10)}</time>
      </p>
    </div>
  );
}

export function WorkflowsTab({ catalog }: { catalog: CatalogRow[] }) {
  const t = useTranslations('my');
  const sp = useSearchParams();
  const [workflows, setWorkflows] = useState<SavedWorkflowEntry[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [draftTemplate, setDraftTemplate] = useState<string>('custom');

  const bySlug = useMemo(() => new Map(catalog.map((r) => [r.slug, r])), [catalog]);

  useEffect(() => {
    setWorkflows(getSavedWorkflows());
    setHydrated(true);
    const open = sp.get('open');
    if (open) setOpenId(open);
    if (sp.get('new') === '1') setCreating(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const url = new URL(window.location.href);
    if (openId) url.searchParams.set('open', openId);
    else url.searchParams.delete('open');
    window.history.replaceState(null, '', url.toString());
  }, [openId, hydrated]);

  if (!hydrated) return null;

  const openEntry = openId ? workflows.find((w) => w.id === openId) ?? null : null;
  if (openEntry) {
    return (
      <WorkflowEditor
        entry={openEntry}
        catalog={catalog}
        bySlug={bySlug}
        onChange={setWorkflows}
        onClose={() => setOpenId(null)}
      />
    );
  }

  const create = () => {
    const template = draftTemplate === 'custom' ? undefined : getWorkflow(draftTemplate);
    const name = draftName.trim() || template?.title || t('workflows.untitled');
    const list = saveWorkflowEntry({ name, slug: template?.slug ?? 'custom', picks: {}, steps: [] });
    setWorkflows(list);
    setCreating(false);
    setDraftName('');
    setOpenId(list[0]?.id ?? null);
    track('workflow_created', { template: template?.slug ?? 'custom' });
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-zinc-400">{t('workflows.intro')}</p>
        {!creating && (
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="rounded-xl bg-accent-500 px-4 py-2.5 text-sm font-bold text-black transition-opacity hover:opacity-90"
          >
            {t('workflows.newWorkflow')}
          </button>
        )}
      </div>

      {creating && (
        <div className="mt-4 rounded-3xl border border-accent-500/25 bg-accent-500/5 p-5">
          <h3 className="flex items-center gap-2 text-sm font-bold text-white">
            <WorkflowIcon className="h-4 w-4 text-accent-400" aria-hidden="true" /> {t('workflows.newWorkflow')}
          </h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <FieldLabel htmlFor="new-wf-name">{t('workflows.nameLabel')}</FieldLabel>
              <input
                id="new-wf-name"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                placeholder={t('workflows.namePlaceholder')}
                maxLength={80}
                className={inputCls}
              />
            </div>
            <div>
              <FieldLabel htmlFor="new-wf-template">{t('workflows.templateLabel')}</FieldLabel>
              <select
                id="new-wf-template"
                value={draftTemplate}
                onChange={(e) => setDraftTemplate(e.target.value)}
                className={inputCls}
              >
                <option value="custom">{t('workflows.templateCustom')}</option>
                {WORKFLOWS.map((w) => (
                  <option key={w.slug} value={w.slug}>
                    {w.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={create}
              className="rounded-xl bg-accent-500 px-4 py-2 text-sm font-bold text-black transition-opacity hover:opacity-90"
            >
              {t('workflows.create')}
            </button>
            <button
              type="button"
              onClick={() => setCreating(false)}
              className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-zinc-300 hover:text-white"
            >
              {t('cancel')}
            </button>
          </div>
        </div>
      )}

      {workflows.length === 0 && !creating ? (
        <div className="mt-4">
          <EmptyState title={t('workflows.emptyTitle')} text={t('workflows.emptyText')} ctaHref="/workflows" ctaLabel={t('workflows.emptyCta')} />
        </div>
      ) : (
        <ul className="mt-4 grid gap-3 lg:grid-cols-2">
          {workflows.map((w) => {
            const template = w.slug === 'custom' ? undefined : getWorkflow(w.slug);
            const stepCount = template?.nodes.length ?? w.steps?.length ?? 0;
            return (
              <li key={w.id} className="rounded-2xl border border-white/10 bg-surface-1 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-bold text-white">{w.name}</p>
                    <p className="mt-0.5 text-2xs text-zinc-500">
                      {template ? template.title : t('workflows.customBadge')} ·{' '}
                      {t('workflows.stepsCount', { count: stepCount })}
                      {Object.keys(w.picks).length > 0 && ` · ${t('workflows.editedCount', { count: Object.keys(w.picks).length })}`}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpenId(w.id)}
                    className="shrink-0 rounded-xl bg-accent-500 px-4 py-2 text-2xs font-bold text-black transition-opacity hover:opacity-90"
                  >
                    {t('common.open')}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
