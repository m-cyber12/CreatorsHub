'use client';

import { useMemo, useState } from 'react';
import Link from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { Check, Copy, PackageSearch, Search, Trash2 } from 'lucide-react';
import { SmartImage } from '@/components/SmartImage';
import type { CatalogRow } from './catalog';

export type { CatalogRow } from './catalog';

export function EmptyState({
  title,
  text,
  ctaHref,
  ctaLabel,
}: {
  title: string;
  text: string;
  ctaHref?: string;
  ctaLabel?: string;
}) {
  return (
    <div className="flex flex-col items-center rounded-3xl border border-dashed border-white/15 bg-surface-1/50 px-6 py-12 text-center">
      <PackageSearch className="h-8 w-8 text-zinc-600" aria-hidden="true" />
      <h3 className="mt-3 text-base font-bold text-white">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-zinc-400">{text}</p>
      {ctaHref && ctaLabel && (
        <Link
          href={ctaHref}
          className="mt-4 rounded-xl bg-accent-500 px-5 py-2.5 text-sm font-bold text-black transition-opacity hover:opacity-90"
        >
          {ctaLabel}
        </Link>
      )}
    </div>
  );
}

/** Tool chip with logo + name. Unknown (unlisted) slugs render distinctly, never dropped. */
export function ToolChip({
  slug,
  catalog,
  onRemove,
  removeLabel,
}: {
  slug: string;
  catalog: Map<string, CatalogRow>;
  onRemove?: () => void;
  removeLabel?: string;
}) {
  const t = useTranslations('my');
  const row = catalog.get(slug);
  if (!row) {
    return (
      <span className="inline-flex items-center gap-2 rounded-xl border border-dashed border-amber-500/40 bg-amber-500/5 px-2.5 py-1.5 text-xs text-amber-200/90">
        <span className="font-mono">{slug}</span>
        <span className="text-2xs text-amber-200/60">{t('common.unknownTool')}</span>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            aria-label={removeLabel ?? slug}
            className="rounded-md px-1 hover:bg-white/10"
          >
            ×
          </button>
        )}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-surface-2 py-1.5 pl-1.5 pr-2 text-xs font-semibold text-zinc-100">
      <SmartImage src={row.logo} alt="" width={20} height={20} className="h-5 w-5 rounded-md object-cover" />
      <Link href={`/tool/${row.slug}`} className="hover:text-accent-300 hover:underline">
        {row.name}
      </Link>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={removeLabel ?? row.name}
          className="rounded-md px-1 text-zinc-500 hover:bg-white/10 hover:text-white"
        >
          ×
        </button>
      )}
    </span>
  );
}

/** Search-as-you-type catalog picker. Excludes slugs already in `exclude`. */
export function ToolSearchPicker({
  catalog,
  exclude = [],
  onPick,
  id,
}: {
  catalog: CatalogRow[];
  exclude?: string[];
  onPick: (slug: string) => void;
  id: string;
}) {
  const t = useTranslations('my');
  const [q, setQ] = useState('');
  const excluded = useMemo(() => new Set(exclude), [exclude]);
  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (needle.length < 2) return [];
    return catalog
      .filter(
        (r) =>
          !excluded.has(r.slug) &&
          (r.name.toLowerCase().includes(needle) ||
            r.category.toLowerCase().includes(needle) ||
            r.tags.some((tag) => tag.toLowerCase().includes(needle)))
      )
      .slice(0, 6);
  }, [q, catalog, excluded]);

  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" aria-hidden="true" />
      <input
        id={id}
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t('common.searchPlaceholder')}
        aria-label={t('common.searchPlaceholder')}
        autoComplete="off"
        className="w-full rounded-xl border border-white/15 bg-surface-2 py-2.5 pl-9 pr-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-accent-500/60 focus:outline-none"
      />
      {results.length > 0 && (
        <ul
          role="listbox"
          aria-label={t('common.searchPlaceholder')}
          className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-white/15 bg-surface-2 p-1 shadow-2xl"
        >
          {results.map((r) => (
            <li key={r.slug} role="option" aria-selected="false">
              <button
                type="button"
                onClick={() => {
                  onPick(r.slug);
                  setQ('');
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left hover:bg-white/5"
              >
                <SmartImage src={r.logo} alt="" width={24} height={24} className="h-6 w-6 rounded-md object-cover" />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-zinc-100">{r.name}</span>
                  <span className="block truncate text-2xs text-zinc-500">
                    {r.category} · {r.pricing}
                    {r.startingPrice ? ` · ${r.startingPrice}` : ''}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Two-click delete: first click arms, second confirms. Resets on blur. */
export function ConfirmDeleteButton({
  label,
  confirmLabel,
  onConfirm,
  small = false,
}: {
  label: string;
  confirmLabel: string;
  onConfirm: () => void;
  small?: boolean;
}) {
  const [armed, setArmed] = useState(false);
  if (!armed) {
    return (
      <button
        type="button"
        onClick={() => setArmed(true)}
        title={label}
        aria-label={label}
        className={`inline-flex items-center gap-1.5 rounded-xl border border-white/10 text-zinc-500 transition-colors hover:border-red-500/50 hover:text-red-400 ${
          small ? 'px-2 py-1 text-2xs' : 'px-3 py-2 text-xs'
        }`}
      >
        <Trash2 className={small ? 'h-3 w-3' : 'h-3.5 w-3.5'} aria-hidden="true" />
        {!small && <span className="font-bold">{label}</span>}
      </button>
    );
  }
  return (
    <span className={`inline-flex items-center gap-1.5 ${small ? 'text-2xs' : 'text-xs'}`}>
      <span className="font-semibold text-red-300">{confirmLabel}</span>
      <button
        type="button"
        onClick={onConfirm}
        className="rounded-lg bg-red-500/20 px-2.5 py-1 font-bold text-red-300 hover:bg-red-500/30"
      >
        {confirmLabel}
      </button>
      <button
        type="button"
        onClick={() => setArmed(false)}
        onBlur={() => setArmed(false)}
        className="rounded-lg border border-white/10 px-2.5 py-1 font-bold text-zinc-400 hover:text-white"
      >
        ×
      </button>
    </span>
  );
}

/** Copy-to-clipboard button with transient "copied" state. */
export function CopyLinkButton({ getText, label, copiedLabel }: { getText: () => string; label: string; copiedLabel: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(getText());
          setCopied(true);
          window.setTimeout(() => setCopied(false), 2000);
        } catch {
          // clipboard unavailable (permissions) — no silent failure: select via prompt fallback
          const text = getText();
          window.prompt(label, text);
        }
      }}
      className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-zinc-300 transition-colors hover:border-white/25 hover:text-white"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
      ) : (
        <Copy className="h-3.5 w-3.5" aria-hidden="true" />
      )}
      {copied ? copiedLabel : label}
    </button>
  );
}

export function FieldLabel({ htmlFor, children }: { htmlFor?: string; children: React.ReactNode }) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block text-2xs font-bold uppercase tracking-wider text-zinc-500"
    >
      {children}
    </label>
  );
}

export const inputCls =
  'w-full rounded-xl border border-white/15 bg-surface-2 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-accent-500/60 focus:outline-none';
