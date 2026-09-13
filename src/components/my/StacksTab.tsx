'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowLeft, ArrowUp, ArrowDown, Copy, ExternalLink, Layers, TriangleAlert } from 'lucide-react';
import {
  STACK_BUDGET_KEYS,
  STACK_GOAL_KEYS,
  STACK_GOAL_TO_WORKFLOW,
  duplicateStackEntry,
  encodeSharePayload,
  findStackOverlaps,
  getSavedStacks,
  parsePriceNumber,
  removeStackEntry,
  saveStackEntry,
  updateStackEntry,
  type SavedStackEntry,
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

function orderedSlugs(picks: Record<number, string>): string[] {
  return Object.keys(picks)
    .map(Number)
    .filter((n) => Number.isFinite(n))
    .sort((a, b) => a - b)
    .map((n) => picks[n])
    .filter(Boolean);
}

function slugsToPicks(slugs: string[]): Record<number, string> {
  return Object.fromEntries(slugs.map((s, i) => [i, s]));
}

function stackShareUrl(locale: string, entry: SavedStackEntry): string {
  const code = encodeSharePayload('stack', entry);
  if (!code) return '';
  return `${window.location.origin}/${locale}/my?tab=stacks#import=${code}`;
}

function useGoalBudgetLabels() {
  const t = useTranslations('stackBuilder');
  return useMemo(
    () => ({
      goalLabel: (g: string) => {
        try {
          return t(`goals.${g}.label`);
        } catch {
          return g;
        }
      },
      budgetLabel: (b: string) => {
        try {
          return t(`budgets.${b}.label`);
        } catch {
          return b;
        }
      },
    }),
    [t]
  );
}

function StackEditor({
  entry,
  catalog,
  bySlug,
  onChange,
  onClose,
}: {
  entry: SavedStackEntry;
  catalog: CatalogRow[];
  bySlug: Map<string, CatalogRow>;
  onChange: (list: SavedStackEntry[]) => void;
  onClose: () => void;
}) {
  const t = useTranslations('my');
  const locale = useLocale();
  const { goalLabel, budgetLabel } = useGoalBudgetLabels();
  const [name, setName] = useState(entry.name);
  const [notes, setNotes] = useState(entry.notes ?? '');
  const [notesDirty, setNotesDirty] = useState(false);

  const slugs = useMemo(() => orderedSlugs(entry.picks), [entry.picks]);

  const estimate = useMemo(() => {
    let total = 0;
    let priced = 0;
    let unpriced = 0;
    for (const slug of slugs) {
      const n = parsePriceNumber(bySlug.get(slug)?.startingPrice);
      if (n === null) unpriced += 1;
      else {
        total += n;
        priced += 1;
      }
    }
    return { total, priced, unpriced };
  }, [slugs, bySlug]);

  const overlaps = useMemo(() => findStackOverlaps(slugs), [slugs]);

  const move = (idx: number, dir: -1 | 1) => {
    const next = [...slugs];
    const j = idx + dir;
    if (j < 0 || j >= next.length) return;
    [next[idx], next[j]] = [next[j], next[idx]];
    onChange(updateStackEntry(entry.id, { picks: slugsToPicks(next) }));
  };

  const builderHref =
    `/stack-builder?goal=${encodeURIComponent(entry.goal)}` +
    `&budget=${encodeURIComponent(entry.budget)}` +
    (slugs.length > 0 ? `&pick=${slugs.map(encodeURIComponent).join(',')}` : '');

  return (
    <div className="rounded-3xl border border-white/10 bg-surface-1 p-5 sm:p-6">
      <button
        type="button"
        onClick={onClose}
        className="inline-flex items-center gap-1.5 text-2xs font-bold text-zinc-400 hover:text-white"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" /> {t('common.backToList')}
      </button>

      <div className="mt-3 flex flex-col gap-3">
        <div>
          <FieldLabel htmlFor={`stack-name-${entry.id}`}>{t('stacks.nameLabel')}</FieldLabel>
          <input
            id={`stack-name-${entry.id}`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => {
              if (name.trim() && name.trim() !== entry.name) {
                onChange(updateStackEntry(entry.id, { name: name.trim() }));
              } else {
                setName(entry.name);
              }
            }}
            maxLength={80}
            className={inputCls}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <FieldLabel htmlFor={`stack-goal-${entry.id}`}>{t('stacks.goalLabel')}</FieldLabel>
            <select
              id={`stack-goal-${entry.id}`}
              value={STACK_GOAL_KEYS.includes(entry.goal as (typeof STACK_GOAL_KEYS)[number]) ? entry.goal : ''}
              onChange={(e) => e.target.value && onChange(updateStackEntry(entry.id, { goal: e.target.value }))}
              className={inputCls}
            >
              {!STACK_GOAL_KEYS.includes(entry.goal as (typeof STACK_GOAL_KEYS)[number]) && (
                <option value="">{entry.goal}</option>
              )}
              {STACK_GOAL_KEYS.map((g) => (
                <option key={g} value={g}>
                  {goalLabel(g)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <FieldLabel htmlFor={`stack-budget-${entry.id}`}>{t('stacks.budgetLabel')}</FieldLabel>
            <select
              id={`stack-budget-${entry.id}`}
              value={STACK_BUDGET_KEYS.includes(entry.budget as (typeof STACK_BUDGET_KEYS)[number]) ? entry.budget : ''}
              onChange={(e) => e.target.value && onChange(updateStackEntry(entry.id, { budget: e.target.value }))}
              className={inputCls}
            >
              {!STACK_BUDGET_KEYS.includes(entry.budget as (typeof STACK_BUDGET_KEYS)[number]) && (
                <option value="">{entry.budget}</option>
              )}
              {STACK_BUDGET_KEYS.map((b) => (
                <option key={b} value={b}>
                  {budgetLabel(b)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-surface-2/60 p-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-sm font-bold text-white">{t('stacks.toolsTitle', { count: slugs.length })}</h3>
          {estimate.priced > 0 ? (
            <p className="text-sm">
              <span className="font-mono text-base font-black tabular-nums text-emerald-300">
                ≈ ${estimate.total.toFixed(estimate.total % 1 === 0 ? 0 : 2)}
              </span>{' '}
              <span className="text-2xs text-zinc-500">{t('stacks.perMonth')}</span>
            </p>
          ) : (
            slugs.length > 0 && <p className="text-2xs text-zinc-500">{t('stacks.noListedPrices')}</p>
          )}
        </div>
        {estimate.priced > 0 && estimate.unpriced > 0 && (
          <p className="mt-1 text-2xs text-zinc-500">{t('stacks.estimateNote', { count: estimate.unpriced })}</p>
        )}
        {slugs.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-500">{t('stacks.noToolsYet')}</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {slugs.map((slug, i) => {
              const row = bySlug.get(slug);
              return (
                <li
                  key={`${slug}-${i}`}
                  className="flex items-center gap-2 rounded-xl border border-white/10 bg-surface-1 px-2 py-1.5"
                >
                  <span className="w-6 shrink-0 text-center font-mono text-2xs tabular-nums text-zinc-600">{i + 1}</span>
                  <span className="min-w-0 flex-1">
                    <ToolChip
                      slug={slug}
                      catalog={bySlug}
                      onRemove={() => onChange(updateStackEntry(entry.id, { picks: slugsToPicks(slugs.filter((_, j) => j !== i)) }))}
                      removeLabel={t('common.remove')}
                    />
                  </span>
                  {row?.startingPrice && (
                    <span className="hidden shrink-0 font-mono text-2xs tabular-nums text-zinc-500 sm:inline">
                      {row.startingPrice}
                    </span>
                  )}
                  <span className="flex shrink-0">
                    <button
                      type="button"
                      onClick={() => move(i, -1)}
                      disabled={i === 0}
                      aria-label={t('stacks.moveUp')}
                      className="rounded-lg p-1.5 text-zinc-500 hover:bg-white/5 hover:text-white disabled:opacity-30"
                    >
                      <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => move(i, 1)}
                      disabled={i === slugs.length - 1}
                      aria-label={t('stacks.moveDown')}
                      className="rounded-lg p-1.5 text-zinc-500 hover:bg-white/5 hover:text-white disabled:opacity-30"
                    >
                      <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </span>
                </li>
              );
            })}
          </ul>
        )}
        <div className="mt-3">
          <ToolSearchPicker
            id={`stack-add-${entry.id}`}
            catalog={catalog}
            exclude={slugs}
            onPick={(slug) => onChange(updateStackEntry(entry.id, { picks: slugsToPicks([...slugs, slug]) }))}
          />
        </div>
      </div>

      {overlaps.length > 0 && (
        <div className="mt-4 rounded-2xl border border-amber-500/25 bg-amber-500/5 p-4">
          <h3 className="flex items-center gap-2 text-sm font-bold text-amber-200">
            <TriangleAlert className="h-4 w-4" aria-hidden="true" /> {t('stacks.optimizeTitle')}
          </h3>
          <ul className="mt-2 space-y-1.5">
            {overlaps.map((g, i) => (
              <li key={i} className="text-xs text-amber-100/80">
                {g.kind === 'category'
                  ? t('stacks.overlapCategory', { signal: g.signal, count: g.slugs.length })
                  : t('stacks.overlapTag', { signal: g.signal, count: g.slugs.length })}{' '}
                <span className="text-amber-200/60">
                  {g.slugs.map((s) => bySlug.get(s)?.name ?? s).join(' · ')}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-2xs text-amber-200/50">{t('stacks.optimizeNote')}</p>
        </div>
      )}

      <div className="mt-4">
        <FieldLabel htmlFor={`stack-notes-${entry.id}`}>{t('stacks.notesLabel')}</FieldLabel>
        <textarea
          id={`stack-notes-${entry.id}`}
          value={notes}
          onChange={(e) => {
            setNotes(e.target.value);
            setNotesDirty(true);
          }}
          rows={2}
          maxLength={500}
          placeholder={t('stacks.notesPlaceholder')}
          className={inputCls}
        />
        {notesDirty && (
          <button
            type="button"
            onClick={() => {
              onChange(updateStackEntry(entry.id, { notes }));
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
          getText={() => stackShareUrl(locale, entry)}
          label={t('common.share')}
          copiedLabel={t('common.copied')}
        />
        <Link
          href={builderHref}
          onClick={() => track('stack_opened_in_builder', { id: entry.id })}
          className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-zinc-300 transition-colors hover:border-white/25 hover:text-white"
        >
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /> {t('stacks.openInBuilder')}
        </Link>
        {STACK_GOAL_TO_WORKFLOW[entry.goal as keyof typeof STACK_GOAL_TO_WORKFLOW] && (
          <Link
            href={`/workflows/${STACK_GOAL_TO_WORKFLOW[entry.goal as keyof typeof STACK_GOAL_TO_WORKFLOW]}`}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-zinc-300 transition-colors hover:border-white/25 hover:text-white"
          >
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /> {t('stacks.openWorkflow')}
          </Link>
        )}
        <button
          type="button"
          onClick={() => {
            const list = duplicateStackEntry(entry.id);
            onChange(list);
            track('stack_duplicated', { id: entry.id });
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
              onChange(removeStackEntry(entry.id));
              track('stack_deleted', { id: entry.id });
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

export function StacksTab({ catalog }: { catalog: CatalogRow[] }) {
  const t = useTranslations('my');
  const sp = useSearchParams();
  const [stacks, setStacks] = useState<SavedStackEntry[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [draftGoal, setDraftGoal] = useState<string>('faceless');
  const [draftBudget, setDraftBudget] = useState<string>('budget');
  const [prefill] = useState(() => ({
    fresh: sp.get('new') === '1',
    tools: (sp.get('tools') ?? '').split(',').map((s) => s.trim()).filter(Boolean),
    goal: sp.get('goal') ?? '',
    name: sp.get('name') ?? '',
  }));
  const { goalLabel, budgetLabel } = useGoalBudgetLabels();

  const bySlug = useMemo(() => new Map(catalog.map((r) => [r.slug, r])), [catalog]);

  useEffect(() => {
    setStacks(getSavedStacks());
    setHydrated(true);
    const open = sp.get('open');
    if (open) setOpenId(open);
    if (prefill.fresh) {
      setCreating(true);
      if (prefill.name) setDraftName(prefill.name.slice(0, 80));
      if ((STACK_GOAL_KEYS as readonly string[]).includes(prefill.goal)) setDraftGoal(prefill.goal);
    }
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

  const openEntry = openId ? stacks.find((s) => s.id === openId) ?? null : null;
  if (openEntry) {
    return (
      <StackEditor
        entry={openEntry}
        catalog={catalog}
        bySlug={bySlug}
        onChange={setStacks}
        onClose={() => setOpenId(null)}
      />
    );
  }

  const create = () => {
    const name = draftName.trim() || t('stacks.untitled');
    // Unknown slugs are kept deliberately — they render as "no longer listed".
    const picks = slugsToPicks(prefill.tools.slice(0, 24));
    const list = saveStackEntry({ name, goal: draftGoal, budget: draftBudget, picks });
    setStacks(list);
    setCreating(false);
    setDraftName('');
    setOpenId(list[0]?.id ?? null);
    track('stack_created', { tools: Object.keys(picks).length });
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-zinc-400">{t('stacks.intro')}</p>
        {!creating && (
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="rounded-xl bg-accent-500 px-4 py-2.5 text-sm font-bold text-black transition-opacity hover:opacity-90"
          >
            {t('stacks.newStack')}
          </button>
        )}
      </div>

      {creating && (
        <div className="mt-4 rounded-3xl border border-accent-500/25 bg-accent-500/5 p-5">
          <h3 className="flex items-center gap-2 text-sm font-bold text-white">
            <Layers className="h-4 w-4 text-accent-400" aria-hidden="true" /> {t('stacks.newStack')}
          </h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <div className="sm:col-span-1">
              <FieldLabel htmlFor="new-stack-name">{t('stacks.nameLabel')}</FieldLabel>
              <input
                id="new-stack-name"
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                placeholder={t('stacks.namePlaceholder')}
                maxLength={80}
                className={inputCls}
              />
            </div>
            <div>
              <FieldLabel htmlFor="new-stack-goal">{t('stacks.goalLabel')}</FieldLabel>
              <select id="new-stack-goal" value={draftGoal} onChange={(e) => setDraftGoal(e.target.value)} className={inputCls}>
                {STACK_GOAL_KEYS.map((g) => (
                  <option key={g} value={g}>
                    {goalLabel(g)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <FieldLabel htmlFor="new-stack-budget">{t('stacks.budgetLabel')}</FieldLabel>
              <select id="new-stack-budget" value={draftBudget} onChange={(e) => setDraftBudget(e.target.value)} className={inputCls}>
                {STACK_BUDGET_KEYS.map((b) => (
                  <option key={b} value={b}>
                    {budgetLabel(b)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {prefill.tools.length > 0 && (
            <p className="mt-2 text-2xs text-zinc-400">{t('stacks.prefillNote', { count: prefill.tools.length })}</p>
          )}
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={create}
              className="rounded-xl bg-accent-500 px-4 py-2 text-sm font-bold text-black transition-opacity hover:opacity-90"
            >
              {t('stacks.create')}
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

      {stacks.length === 0 && !creating ? (
        <div className="mt-4">
          <EmptyState title={t('stacks.emptyTitle')} text={t('stacks.emptyText')} ctaHref="/stack-builder" ctaLabel={t('stacks.emptyCta')} />
        </div>
      ) : (
        <ul className="mt-4 grid gap-3 lg:grid-cols-2">
          {stacks.map((s) => {
            const count = Object.keys(s.picks).length;
            return (
              <li key={s.id} className="rounded-2xl border border-white/10 bg-surface-1 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-bold text-white">{s.name}</p>
                    <p className="mt-0.5 text-2xs text-zinc-500">
                      {goalLabel(s.goal)} · {budgetLabel(s.budget)} · {t('stacks.toolsCount', { count })}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpenId(s.id)}
                    className="shrink-0 rounded-xl bg-accent-500 px-4 py-2 text-2xs font-bold text-black transition-opacity hover:opacity-90"
                  >
                    {t('common.open')}
                  </button>
                </div>
                {count > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {orderedSlugs(s.picks).slice(0, 6).map((slug) => (
                      <ToolChip key={slug} slug={slug} catalog={bySlug} />
                    ))}
                    {count > 6 && <span className="text-2xs text-zinc-500">+{count - 6}</span>}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
