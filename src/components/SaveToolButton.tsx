'use client';

import { Bookmark } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useBookmarks } from '@/context/AppProviders';
import { track } from '@/lib/analytics';

/**
 * "Save Tool" button for cards and tool pages. One tap adds the tool to
 * My NOXIFERA (with a pricing snapshot for change detection); a second tap
 * removes it. Works for guests — no account required.
 */
export function SaveToolButton({
  slug,
  name,
  size = 'md',
  showLabel = false,
  className = '',
}: {
  slug: string;
  name: string;
  size?: 'sm' | 'md';
  showLabel?: boolean;
  className?: string;
}) {
  const t = useTranslations('common');
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const saved = isBookmarked(slug);

  const pad = size === 'sm' ? 'p-2' : 'p-3';

  return (
    <button
      type="button"
      onClick={() => {
        toggleBookmark(slug);
        track(saved ? 'tool_unsaved' : 'tool_saved', { slug });
      }}
      title={saved ? t('unsaveTool', { name }) : t('saveTool', { name })}
      aria-label={saved ? t('unsaveTool', { name }) : t('saveTool', { name })}
      aria-pressed={saved}
      className={`inline-flex items-center gap-1.5 rounded-2xl border transition-colors ${pad} ${
        saved
          ? 'border-accent-500 bg-accent-500/20 text-accent-300'
          : 'border-white/10 bg-zinc-900 text-zinc-400 hover:border-white/20 hover:text-white'
      } ${className}`}
    >
      <Bookmark className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} fill={saved ? 'currentColor' : 'none'} aria-hidden="true" />
      {showLabel && (
        <span className="text-2xs font-bold">{saved ? t('saved') : t('save')}</span>
      )}
    </button>
  );
}
