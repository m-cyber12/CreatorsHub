'use client';

import { useMemo, useState } from 'react';
import Link from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { ExternalLink, History } from 'lucide-react';
import { useBookmarks, useSavedTools } from '@/context/AppProviders';
import { TOOL_STATUSES, type SavedTool, type ToolStatus } from '@/lib/workspace';
import { SmartImage } from '@/components/SmartImage';
import { ConfirmDeleteButton, EmptyState, type CatalogRow } from './shared';
import { track } from '@/lib/analytics';

function ToolRow({
  record,
  row,
  onStatus,
  onRemove,
}: {
  record: SavedTool;
  row?: CatalogRow;
  onStatus: (status: ToolStatus) => void;
  onRemove: () => void;
}) {
  const t = useTranslations('my');
  const [noteOpen, setNoteOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const { setNote } = useSavedTools();
  const [draft, setDraft] = useState<string | null>(null);

  return (
    <li className="rounded-2xl border border-white/10 bg-surface-1 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {row ? (
            <SmartImage src={row.logo} alt="" width={40} height={40} className="h-10 w-10 shrink-0 rounded-xl object-cover" />
          ) : (
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-dashed border-amber-500/40 bg-amber-500/5 font-mono text-xs text-amber-200/80">
              ?
            </span>
          )}
          <div className="min-w-0">
            {row ? (
              <Link href={`/tool/${row.slug}`} className="block truncate font-bold text-white hover:text-accent-300 hover:underline">
                {row.name}
              </Link>
            ) : (
              <p className="truncate font-mono text-sm font-bold text-amber-200/90">{record.slug}</p>
            )}
            <p className="truncate text-2xs text-zinc-500">
              {row ? (
                <>
                  {row.category} · {row.pricing}
                  {row.startingPrice ? ` · ${row.startingPrice}` : ''}
                </>
              ) : (
                t('tools.unknownText')
              )}
            </p>
          </div>
        </div>
        {row && (
          <a
            href={`/go/${row.slug}`}
            target="_blank"
            rel="noopener noreferrer nofollow"
            aria-label={t('tools.visitSite', { name: row.name })}
            title={t('tools.visitSite', { name: row.name })}
            onClick={() => track('go_click', { slug: row.slug, source: 'my_tools' })}
            className="rounded-xl border border-white/10 p-2 text-zinc-400 transition-colors hover:border-white/25 hover:text-white"
          >
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5" role="group" aria-label={t('statusLabel')}>
        {TOOL_STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onStatus(s)}
            aria-pressed={record.status === s}
            className={`rounded-full border px-2.5 py-1 text-2xs font-bold transition-colors ${
              record.status === s
                ? 'border-accent-500 bg-accent-500/20 text-accent-300'
                : 'border-white/10 bg-surface-2 text-zinc-400 hover:border-white/25 hover:text-white'
            }`}
          >
            {t(`status.${s}`)}
          </button>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-2xs">
        <button
          type="button"
          onClick={() => setNoteOpen((v) => !v)}
          aria-expanded={noteOpen}
          className="font-bold text-zinc-400 hover:text-white"
        >
          {record.note ? t('tools.editNote') : t('tools.addNote')}
        </button>
        {record.history.length > 1 && (
          <button
            type="button"
            onClick={() => setHistoryOpen((v) => !v)}
            aria-expanded={historyOpen}
            className="inline-flex items-center gap-1 font-bold text-zinc-400 hover:text-white"
          >
            <History className="h-3 w-3" aria-hidden="true" />
            {t('historyToggle', { count: record.history.length })}
          </button>
        )}
        <span className="text-zinc-600">
          {t('tools.savedOn')} <time className="font-mono tabular-nums">{record.savedAt.slice(0, 10)}</time>
        </span>
        <span className="ml-auto">
          <ConfirmDeleteButton
            small
            label={t('common.remove')}
            confirmLabel={t('common.confirmDelete')}
            onConfirm={onRemove}
          />
        </span>
      </div>

      {noteOpen && (
        <form
          className="mt-2 flex flex-col gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setNote(record.slug, draft ?? record.note);
            setDraft(null);
            setNoteOpen(false);
          }}
        >
          <textarea
            value={draft ?? record.note}
            onChange={(e) => setDraft(e.target.value)}
            rows={2}
            maxLength={500}
            placeholder={t('notePlaceholder')}
            aria-label={t('noteLabel')}
            className="w-full rounded-xl border border-white/15 bg-surface-2 px-3 py-2 text-xs text-zinc-200 placeholder:text-zinc-600 focus:border-accent-500/60 focus:outline-none"
          />
          <span className="flex gap-2">
            <button type="submit" className="rounded-lg bg-accent-500 px-3 py-1.5 text-2xs font-bold text-black hover:opacity-90">
              {t('saveNote')}
            </button>
            <button
              type="button"
              onClick={() => {
                setDraft(null);
                setNoteOpen(false);
              }}
              className="rounded-lg border border-white/10 px-3 py-1.5 text-2xs font-bold text-zinc-400 hover:text-white"
            >
              {t('cancel')}
            </button>
          </span>
        </form>
      )}
      {record.note && !noteOpen && <p className="mt-2 text-xs text-zinc-400">“{record.note}”</p>}

      {historyOpen && (
        <ol className="mt-2 space-y-1.5 border-l border-white/10 pl-3">
          {[...record.history].reverse().map((h, i) => (
            <li key={`${h.at}-${i}`} className="text-2xs text-zinc-400">
              <span className="font-bold text-zinc-200">{t(`status.${h.status}`)}</span>{' '}
              <time className="font-mono tabular-nums text-zinc-600">{h.at.slice(0, 10)}</time>
              {h.note && <span className="text-zinc-500"> — {h.note}</span>}
            </li>
          ))}
        </ol>
      )}
    </li>
  );
}

export function ToolsTab({ catalog }: { catalog: CatalogRow[] }) {
  const t = useTranslations('my');
  const { savedTools, setStatus, refresh } = useSavedTools();
  const { toggleBookmark } = useBookmarks();
  const [statusFilter, setStatusFilter] = useState<'all' | ToolStatus>('all');
  const [q, setQ] = useState('');

  const bySlug = useMemo(() => new Map(catalog.map((r) => [r.slug, r])), [catalog]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return savedTools.filter((r) => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (!needle) return true;
      const row = bySlug.get(r.slug);
      return (
        r.slug.includes(needle) ||
        r.note.toLowerCase().includes(needle) ||
        (row?.name.toLowerCase().includes(needle) ?? false)
      );
    });
  }, [savedTools, statusFilter, q, bySlug]);

  if (savedTools.length === 0) {
    return (
      <EmptyState
        title={t('tools.emptyTitle')}
        text={t('tools.emptyText')}
        ctaHref="/tools"
        ctaLabel={t('tools.emptyCta')}
      />
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label={t('statusLabel')}>
          {(['all', ...TOOL_STATUSES] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              aria-pressed={statusFilter === s}
              className={`rounded-full border px-3 py-1.5 text-2xs font-bold transition-colors ${
                statusFilter === s
                  ? 'border-accent-500 bg-accent-500/20 text-accent-300'
                  : 'border-white/10 bg-surface-2 text-zinc-400 hover:border-white/25 hover:text-white'
              }`}
            >
              {s === 'all' ? t('tools.filterAll') : t(`status.${s}`)}
            </button>
          ))}
        </div>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t('tools.searchPlaceholder')}
          aria-label={t('tools.searchPlaceholder')}
          className="w-full rounded-xl border border-white/15 bg-surface-2 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-accent-500/60 focus:outline-none sm:ml-auto sm:max-w-2xs"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-white/10 bg-surface-1 p-6 text-center text-sm text-zinc-400">
          {t('tools.noMatches')}
        </p>
      ) : (
        <ul className="mt-4 grid gap-3 lg:grid-cols-2">
          {filtered.map((r) => (
            <ToolRow
              key={r.slug}
              record={r}
              row={bySlug.get(r.slug)}
              onStatus={(s) => {
                setStatus(r.slug, s);
                track('tool_status_changed', { slug: r.slug, status: s });
              }}
              onRemove={() => {
                toggleBookmark(r.slug);
                track('tool_unsaved', { slug: r.slug, source: 'my_tools' });
                refresh();
              }}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
