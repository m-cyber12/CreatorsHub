"use client";

import React from 'react';
import { Bookmark, GitCompareArrows } from 'lucide-react';
import { useBookmarks, useCompare } from '@/context/AppProviders';

/** Bookmark + compare buttons for the tool detail page (client island). */
export function ToolActions({ slug, name }: { slug: string; name: string }) {
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const { isCompared, toggleCompare } = useCompare();
  const bookmarked = isBookmarked(slug);
  const compared = isCompared(slug);

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => toggleCompare(slug)}
        title={compared ? 'Remove from compare' : `Compare ${name}`}
        className={`rounded-2xl border p-3 transition-colors ${
          compared
            ? 'border-purple-500 bg-purple-500/20 text-purple-300'
            : 'border-white/10 bg-zinc-900 text-zinc-400 hover:text-white hover:border-white/20'
        }`}
      >
        <GitCompareArrows className="h-4 w-4" />
      </button>
      <button
        onClick={() => toggleBookmark(slug)}
        title={bookmarked ? 'Remove bookmark' : `Save ${name}`}
        className={`rounded-2xl border p-3 transition-colors ${
          bookmarked
            ? 'border-purple-500 bg-purple-500/20 text-purple-300'
            : 'border-white/10 bg-zinc-900 text-zinc-400 hover:text-white hover:border-white/20'
        }`}
      >
        <Bookmark className="h-4 w-4" fill={bookmarked ? 'currentColor' : 'none'} />
      </button>
    </div>
  );
}
