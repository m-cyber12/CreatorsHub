'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import {
  getSavedComparisons,
  removeComparison,
  renameComparison,
  type SavedComparison,
} from '@/lib/workspace';
import { ConfirmDeleteButton, EmptyState, ToolChip, type CatalogRow } from './shared';
import { track } from '@/lib/analytics';

export function ComparisonsTab({ catalog }: { catalog: CatalogRow[] }) {
  const t = useTranslations('my');
  const [items, setItems] = useState<SavedComparison[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [draft, setDraft] = useState('');

  const bySlug = useMemo(() => new Map(catalog.map((r) => [r.slug, r])), [catalog]);

  useEffect(() => {
    setItems(getSavedComparisons());
    setHydrated(true);
  }, []);

  if (!hydrated) return null;

  if (items.length === 0) {
    return (
      <EmptyState
        title={t('comparisons.emptyTitle')}
        text={t('comparisons.emptyText')}
        ctaHref="/compare"
        ctaLabel={t('comparisons.emptyCta')}
      />
    );
  }

  return (
    <ul className="grid gap-3 lg:grid-cols-2">
      {items.map((c) => (
        <li key={c.id} className="rounded-2xl border border-white/10 bg-surface-1 p-4">
          {renaming === c.id ? (
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (draft.trim()) setItems(renameComparison(c.id, draft.trim()));
                setRenaming(null);
              }}
            >
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                maxLength={80}
                aria-label={t('comparisons.nameLabel')}
                ref={(el) => {
                  el?.focus();
                }}
                className="min-w-0 flex-1 rounded-xl border border-white/15 bg-surface-2 px-3 py-2 text-sm text-zinc-100 focus:border-accent-500/60 focus:outline-none"
              />
              <button type="submit" className="shrink-0 rounded-xl bg-accent-500 px-4 py-2 text-2xs font-bold text-black hover:opacity-90">
                {t('common.save')}
              </button>
            </form>
          ) : (
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-bold text-white">{c.name}</p>
                <p className="mt-0.5 text-2xs text-zinc-500">
                  {t('comparisons.toolsCount', { count: c.slugs.length })} ·{' '}
                  <time className="font-mono tabular-nums">{c.savedAt.slice(0, 10)}</time>
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setRenaming(c.id);
                  setDraft(c.name);
                }}
                className="shrink-0 rounded-lg px-2 py-1 text-2xs font-bold text-zinc-500 hover:bg-white/5 hover:text-white"
              >
                {t('common.rename')}
              </button>
            </div>
          )}
          <div className="mt-2 flex flex-wrap gap-1.5">
            {c.slugs.map((slug) => (
              <ToolChip key={slug} slug={slug} catalog={bySlug} />
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <Link
              href={`/compare?tools=${c.slugs.map(encodeURIComponent).join(',')}`}
              onClick={() => track('comparison_opened', { id: c.id })}
              className="rounded-xl bg-accent-500 px-4 py-2 text-2xs font-bold text-black transition-opacity hover:opacity-90"
            >
              {t('comparisons.open')}
            </Link>
            <span className="ml-auto">
              <ConfirmDeleteButton
                small
                label={t('common.delete')}
                confirmLabel={t('common.confirmDelete')}
                onConfirm={() => {
                  setItems(removeComparison(c.id));
                  track('comparison_deleted', { id: c.id });
                }}
              />
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
