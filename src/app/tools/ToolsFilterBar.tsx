'use client';

import React, { useState, useEffect, useRef, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, X, FlaskConical, SlidersHorizontal, Loader2 } from 'lucide-react';
import { CATEGORIES, PRICING_OPTIONS, type Category, type PricingOption } from '@/data/tools';
import { SORT_OPTIONS, buildToolsHref, type ToolQuery, type SortKey } from '@/lib/toolFilters';

/**
 * Client island for /tools. Deliberately small: it only reads the current
 * query and navigates. All filtering happens on the server (see
 * lib/toolFilters.ts), so the results themselves are always in the HTML.
 *
 * Audit fix 4.4 — every option now carries a live count, so you know what
 * you'll get before clicking, plus a "tested only" toggle and removable
 * chips for active filters.
 */

interface Facets {
  category: Map<string, number>;
  pricing: Map<string, number>;
  tested: number;
  total: number;
}

export function ToolsFilterBar({
  query,
  facets,
  resultCount,
}: {
  query: ToolQuery;
  facets: Facets;
  resultCount?: number;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [searchInput, setSearchInput] = useState(query.q);
  const [showAll, setShowAll] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const firstRender = useRef(true);

  const go = (next: Partial<ToolQuery>) => {
    startTransition(() => {
      // Any filter change resets to page 1.
      router.push(buildToolsHref({ ...query, ...next }, 1), { scroll: false });
    });
  };

  // Keep the input in sync when the user navigates back/forward.
  useEffect(() => {
    setSearchInput(query.q);
  }, [query.q]);

  /**
   * Log completed searches (audit fix 4.5). Fires once per settled query, not
   * per keystroke, and records only the query text and result count — no
   * identifiers, so it needs no consent banner.
   */
  useEffect(() => {
    if (!query.q || resultCount === undefined) return;
    const id = setTimeout(() => {
      void fetch('/api/search-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query.q,
          results: resultCount,
          category: query.category !== 'All' ? query.category : null,
        }),
        keepalive: true,
      }).catch(() => undefined);
    }, 1200);
    return () => clearTimeout(id);
  }, [query.q, query.category, resultCount]);

  // Debounced search navigation.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (searchInput !== query.q) go({ q: searchInput });
    }, 350);
    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const activeChips = [
    query.category !== 'All' && { label: query.category, clear: { category: 'All' as Category } },
    query.pricing !== 'All' && { label: query.pricing, clear: { pricing: 'All' as PricingOption } },
    query.testedOnly && { label: 'Tested only', clear: { testedOnly: false } },
    query.q && { label: `“${query.q}”`, clear: { q: '' } },
  ].filter(Boolean) as { label: string; clear: Partial<ToolQuery> }[];

  const visibleCategories = showAll ? CATEGORIES : CATEGORIES.slice(0, 8);

  return (
    <div className="mt-6 rounded-2xl border border-white/10 bg-surface-1 p-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search tools, tags, use cases…"
            aria-label="Search tools"
            className="w-full rounded-xl border border-white/10 bg-surface-2 py-2.5 pl-9 pr-9 text-sm text-white placeholder-zinc-500 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20"
          />
          {isPending ? (
            <Loader2
              className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-accent-400"
              aria-hidden="true"
            />
          ) : (
            searchInput && (
              <button
                onClick={() => setSearchInput('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded text-zinc-500 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-500"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )
          )}
        </div>

        <label className="sr-only" htmlFor="sort-select">
          Sort tools
        </label>
        <select
          id="sort-select"
          value={query.sort}
          onChange={(e) => go({ sort: e.target.value as SortKey })}
          className="rounded-xl border border-white/10 bg-surface-2 px-3 py-2.5 text-sm text-white focus:border-accent-500 focus:outline-none"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        {/* Audit fix 1.1 — lets readers see only what we can actually vouch for. */}
        <button
          onClick={() => go({ testedOnly: !query.testedOnly })}
          aria-pressed={query.testedOnly}
          className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors ${
            query.testedOnly
              ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-300'
              : 'border-white/10 bg-surface-2 text-zinc-300 hover:border-emerald-500/30'
          }`}
        >
          <FlaskConical className="h-4 w-4" aria-hidden="true" />
          Tested only
          <span className="font-mono tabular-nums opacity-70">({facets.tested})</span>
        </button>
      </div>

      {/* Category pills with counts */}
      <div className="mt-4 flex flex-wrap gap-2">
        {visibleCategories.map((cat) => {
          const count = cat === 'All' ? facets.total : facets.category.get(cat) || 0;
          const active = query.category === cat;
          if (count === 0 && cat !== 'All') return null;
          return (
            <button
              key={cat}
              onClick={() => go({ category: cat as Category })}
              aria-pressed={active}
              className={`rounded-full border px-3 py-1.5 text-2xs font-semibold transition-colors ${
                active
                  ? 'border-accent-500 bg-accent-500/20 text-accent-200'
                  : 'border-white/10 bg-surface-2 text-zinc-400 hover:border-accent-500/40 hover:text-accent-300'
              }`}
            >
              {cat}{' '}
              <span className="font-mono tabular-nums opacity-60">{count}</span>
            </button>
          );
        })}
        {!showAll && CATEGORIES.length > 8 && (
          <button
            onClick={() => setShowAll(true)}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-surface-2 px-3 py-1.5 text-2xs font-semibold text-zinc-400 hover:border-accent-500/40 hover:text-accent-300"
          >
            <SlidersHorizontal className="h-3 w-3" aria-hidden="true" />
            More categories
          </button>
        )}
      </div>

      {/* Pricing pills with counts */}
      <div className="mt-2 flex flex-wrap gap-2">
        {PRICING_OPTIONS.map((p) => {
          const count = p === 'All' ? facets.total : facets.pricing.get(p) || 0;
          const active = query.pricing === p;
          if (count === 0 && p !== 'All') return null;
          return (
            <button
              key={p}
              onClick={() => go({ pricing: p as PricingOption })}
              aria-pressed={active}
              className={`rounded-full border px-3 py-1.5 text-2xs font-semibold transition-colors ${
                active
                  ? 'border-emerald-500 bg-emerald-500/20 text-emerald-200'
                  : 'border-white/10 bg-surface-2 text-zinc-400 hover:border-emerald-500/40 hover:text-emerald-300'
              }`}
            >
              {p} <span className="font-mono tabular-nums opacity-60">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Removable active-filter chips */}
      {activeChips.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/5 pt-3">
          <span className="text-2xs text-zinc-500">Active:</span>
          {activeChips.map((chip) => (
            <button
              key={chip.label}
              onClick={() => go(chip.clear)}
              className="inline-flex items-center gap-1.5 rounded-full border border-accent-500/30 bg-accent-500/10 px-2.5 py-1 text-2xs font-semibold text-accent-200 hover:bg-accent-500/20"
            >
              {chip.label}
              <X className="h-3 w-3" aria-hidden="true" />
            </button>
          ))}
          <Link
            href="/tools"
            className="ml-1 text-2xs font-semibold text-zinc-500 underline hover:text-zinc-300"
          >
            Clear all
          </Link>
        </div>
      )}
    </div>
  );
}
