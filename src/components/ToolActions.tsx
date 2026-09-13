"use client";

import React from 'react';
import { GitCompareArrows } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCompare } from '@/context/AppProviders';
import { SaveToolButton } from '@/components/SaveToolButton';
import { track } from '@/lib/analytics';

/** Save + compare buttons for the tool detail page (client island). */
export function ToolActions({ slug, name }: { slug: string; name: string }) {
  const t = useTranslations('common');
  const { isCompared, toggleCompare } = useCompare();
  const compared = isCompared(slug);

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => {
          toggleCompare(slug);
          track(compared ? 'compare_removed' : 'compare_added', { slug });
        }}
        title={compared ? t('removeFromCompare') : t('compareName', { name })}
        aria-label={compared ? t('removeNameFromCompare', { name }) : t('addNameToCompare', { name })}
        aria-pressed={compared}
        className={`rounded-2xl border p-3 transition-colors ${
          compared
            ? 'border-accent-500 bg-accent-500/20 text-accent-300'
            : 'border-white/10 bg-zinc-900 text-zinc-400 hover:text-white hover:border-white/20'
        }`}
      >
        <GitCompareArrows className="h-4 w-4" aria-hidden="true" />
      </button>
      <SaveToolButton slug={slug} name={name} />
    </div>
  );
}
