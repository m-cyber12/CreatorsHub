'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { SlidersHorizontal } from 'lucide-react';
import {
  getPreferences,
  savePreferences,
  type CreatorPreferences,
} from '@/lib/workspace';
import { FieldLabel, ToolChip, ToolSearchPicker, inputCls, type CatalogRow } from './shared';
import { track } from '@/lib/analytics';

const TEXT_FIELDS = [
  'creatorType',
  'platform',
  'contentFormat',
  'frequency',
  'budget',
  'skillLevel',
  'workflowStyle',
] as const;
type TextField = (typeof TEXT_FIELDS)[number];

export function PreferencesTab({ catalog }: { catalog: CatalogRow[] }) {
  const t = useTranslations('my');
  const [prefs, setPrefs] = useState<CreatorPreferences>({ currentTools: [] });
  const [hydrated, setHydrated] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  const bySlug = useMemo(() => new Map(catalog.map((r) => [r.slug, r])), [catalog]);

  useEffect(() => {
    setPrefs(getPreferences());
    setHydrated(true);
  }, []);

  if (!hydrated) return null;

  const set = (patch: Partial<CreatorPreferences>) => setPrefs((cur) => ({ ...cur, ...patch }));

  const save = () => {
    savePreferences(prefs);
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 2000);
    track('preferences_saved', {});
  };

  const clear = () => {
    const cleared: CreatorPreferences = { currentTools: [] };
    savePreferences({ ...cleared, creatorType: '', platform: '', contentFormat: '', frequency: '', budget: '', skillLevel: '', workflowStyle: '' });
    setPrefs(cleared);
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-surface-1 p-5 sm:p-6">
      <h3 className="flex items-center gap-2 text-sm font-bold text-white">
        <SlidersHorizontal className="h-4 w-4 text-accent-400" aria-hidden="true" /> {t('preferences.title')}
      </h3>
      <p className="mt-1 text-sm text-zinc-400">{t('preferences.intro')}</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {TEXT_FIELDS.map((f: TextField) => (
          <div key={f}>
            <FieldLabel htmlFor={`pref-${f}`}>{t(`preferences.fields.${f}`)}</FieldLabel>
            <input
              id={`pref-${f}`}
              value={prefs[f] ?? ''}
              onChange={(e) => set({ [f]: e.target.value } as Partial<CreatorPreferences>)}
              placeholder={t(`preferences.placeholders.${f}`)}
              maxLength={60}
              className={inputCls}
            />
          </div>
        ))}
      </div>

      <div className="mt-4">
        <span className="mb-1.5 block text-2xs font-bold uppercase tracking-wider text-zinc-500">
          {t('preferences.currentTools')}
        </span>
        {prefs.currentTools.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {prefs.currentTools.map((slug) => (
              <ToolChip
                key={slug}
                slug={slug}
                catalog={bySlug}
                onRemove={() => set({ currentTools: prefs.currentTools.filter((s) => s !== slug) })}
                removeLabel={t('common.remove')}
              />
            ))}
          </div>
        )}
        <ToolSearchPicker
          id="pref-tools"
          catalog={catalog}
          exclude={prefs.currentTools}
          onPick={(slug) => set({ currentTools: [...prefs.currentTools, slug].slice(0, 30) })}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/10 pt-4">
        <button
          type="button"
          onClick={save}
          className="rounded-xl bg-accent-500 px-5 py-2.5 text-sm font-bold text-black transition-opacity hover:opacity-90"
        >
          {savedFlash ? t('preferences.saved') : t('common.save')}
        </button>
        <Link
          href="/advisor?from=my"
          onClick={() => track('preferences_used_in_advisor', {})}
          className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-bold text-zinc-200 hover:border-white/25 hover:text-white"
        >
          {t('preferences.useInAdvisor')}
        </Link>
        <button
          type="button"
          onClick={clear}
          className="ml-auto rounded-xl px-3 py-2 text-2xs font-bold text-zinc-500 hover:text-red-300"
        >
          {t('preferences.clear')}
        </button>
      </div>
      {prefs.updatedAt && (
        <p className="mt-3 text-2xs text-zinc-600">
          {t('common.updatedAt')}{' '}
          <time className="font-mono tabular-nums">{prefs.updatedAt.slice(0, 10)}</time>
        </p>
      )}
    </div>
  );
}
