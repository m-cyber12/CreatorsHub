'use client';

import { useState } from 'react';
import Link from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { BookmarkCheck, History, StickyNote } from 'lucide-react';
import { useBookmarks, useSavedTools } from '@/context/AppProviders';
import { TOOL_STATUSES, type ToolStatus } from '@/lib/workspace';
import { track } from '@/lib/analytics';

/**
 * "My NOXIFERA" mini-panel for tool pages: status (Interested / Using /
 * Testing / Replaced / Cancelled), a private note, and the status history.
 * Rendered only when the tool is saved; otherwise a compact save prompt.
 */
export function ToolWorkspacePanel({ slug, name }: { slug: string; name: string }) {
  const t = useTranslations('my');
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const { savedTools, setNote, setStatus } = useSavedTools();
  const [editingNote, setEditingNote] = useState(false);
  const [draft, setDraft] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const saved = isBookmarked(slug);
  const record = savedTools.find((r) => r.slug === slug) ?? null;

  if (!saved || !record) {
    return (
      <section className="mt-6 rounded-2xl border border-dashed border-white/15 bg-surface-1/50 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <BookmarkCheck className="h-5 w-5 text-accent-400" aria-hidden="true" />
            <div>
              <h2 className="text-sm font-bold text-white">{t('trackTitle', { name })}</h2>
              <p className="mt-0.5 text-2xs text-zinc-400">{t('trackText')}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              toggleBookmark(slug);
              track('tool_saved', { slug, source: 'tool_panel' });
            }}
            className="rounded-xl bg-accent-500 px-4 py-2.5 text-2xs font-bold text-black transition-opacity hover:opacity-90"
          >
            {t('saveThisTool')}
          </button>
        </div>
      </section>
    );
  }

  const noteValue = draft ?? record.note;

  return (
    <section className="mt-6 rounded-2xl border border-accent-500/25 bg-accent-500/5 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-bold text-white">
          <BookmarkCheck className="h-4 w-4 text-accent-400" aria-hidden="true" />
          {t('inWorkspace')}
        </h2>
        <Link href="/my" className="text-2xs font-bold text-accent-400 underline hover:text-accent-300">
          {t('openMy')}
        </Link>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-2xs font-bold uppercase tracking-wider text-zinc-500">
            {t('statusLabel')}
          </span>
          <span className="flex flex-wrap gap-1.5" role="group" aria-label={t('statusLabel')}>
            {TOOL_STATUSES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setStatus(slug, s as ToolStatus);
                  track('tool_status_changed', { slug, status: s });
                }}
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
          </span>
        </label>

        <div>
          <span className="mb-1.5 flex items-center gap-1.5 text-2xs font-bold uppercase tracking-wider text-zinc-500">
            <StickyNote className="h-3 w-3" aria-hidden="true" /> {t('noteLabel')}
          </span>
          {editingNote ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setNote(slug, noteValue);
                setEditingNote(false);
                setDraft(null);
              }}
              className="flex flex-col gap-2"
            >
              <textarea
                value={noteValue}
                onChange={(e) => setDraft(e.target.value)}
                rows={2}
                maxLength={500}
                placeholder={t('notePlaceholder')}
                aria-label={t('noteLabel')}
                className="w-full rounded-xl border border-white/15 bg-surface-2 px-3 py-2 text-xs text-zinc-200 placeholder:text-zinc-600 focus:border-accent-500/60 focus:outline-none"
              />
              <span className="flex gap-2">
                <button
                  type="submit"
                  className="rounded-lg bg-accent-500 px-3 py-1.5 text-2xs font-bold text-black hover:opacity-90"
                >
                  {t('saveNote')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingNote(false);
                    setDraft(null);
                  }}
                  className="rounded-lg border border-white/10 px-3 py-1.5 text-2xs font-bold text-zinc-400 hover:text-white"
                >
                  {t('cancel')}
                </button>
              </span>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setEditingNote(true)}
              className="block w-full rounded-xl border border-white/10 bg-surface-2 px-3 py-2 text-left text-xs text-zinc-300 hover:border-white/25"
            >
              {record.note || <span className="text-zinc-600">{t('notePlaceholder')}</span>}
            </button>
          )}
        </div>
      </div>

      {record.history.length > 1 && (
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setShowHistory((v) => !v)}
            aria-expanded={showHistory}
            className="inline-flex items-center gap-1.5 text-2xs font-bold text-zinc-400 hover:text-white"
          >
            <History className="h-3.5 w-3.5" aria-hidden="true" />
            {t('historyToggle', { count: record.history.length })}
          </button>
          {showHistory && (
            <ol className="mt-2 space-y-1.5 border-l border-white/10 pl-3">
              {[...record.history].reverse().map((h, i) => (
                <li key={`${h.at}-${i}`} className="text-2xs text-zinc-400">
                  <span className="font-bold text-zinc-200">{t(`status.${h.status}`)}</span>{' '}
                  <time className="font-mono tabular-nums text-zinc-600">
                    {h.at.slice(0, 10)}
                  </time>
                  {h.note && <span className="text-zinc-500"> — {h.note}</span>}
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </section>
  );
}
