"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useCompare } from '@/context/AppProviders';
import { ALL_TOOLS } from '@/data/tools';
import { GitCompareArrows, X } from 'lucide-react';

/** Floating bar that appears when the user selects tools to compare. */
export function CompareBar() {
  const { compareList, toggleCompare, clearCompare } = useCompare();
  const router = useRouter();

  if (compareList.length === 0) return null;
  const tools = compareList
    .map((slug) => ALL_TOOLS.find((t) => t.slug === slug))
    .filter(Boolean);

  return (
    <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 w-[calc(100%-2rem)] max-w-lg">
      <div className="flex items-center gap-3 rounded-2xl border border-purple-500/30 bg-zinc-900/95 px-4 py-3 shadow-2xl shadow-purple-500/10 backdrop-blur-xl">
        <GitCompareArrows className="h-4 w-4 shrink-0 text-purple-400" />
        <div className="flex flex-1 items-center gap-2 overflow-x-auto">
          {tools.map((t) => (
            <span
              key={t!.slug}
              className="inline-flex shrink-0 items-center gap-1 rounded-full bg-purple-500/15 border border-purple-500/25 px-2.5 py-1 text-[11px] font-semibold text-purple-200"
            >
              {t!.name}
              <button onClick={() => toggleCompare(t!.slug)} aria-label={`Remove ${t!.name}`}>
                <X className="h-3 w-3 hover:text-white" />
              </button>
            </span>
          ))}
        </div>
        <button
          onClick={() => router.push(`/compare?tools=${compareList.join(',')}`)}
          disabled={compareList.length < 2}
          className="shrink-0 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 text-xs font-bold text-white disabled:opacity-40 hover:opacity-90 transition-opacity"
        >
          Compare ({compareList.length})
        </button>
        <button onClick={clearCompare} className="shrink-0 text-zinc-500 hover:text-white" aria-label="Clear compare list">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
