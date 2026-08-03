'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ArrowRight } from 'lucide-react';
import { SEARCH_SUGGESTIONS } from '@/lib/search';

/**
 * Small client island for the homepage hero.
 *
 * Audit fix 5.5 — the homepage used to be entirely "use client", shipping the
 * whole 200-tool dataset and the fuzzy search engine to every visitor just to
 * power this box. Now it only navigates to /tools, where filtering happens on
 * the server. The dataset never reaches the browser on first load.
 */
export function HomeSearch() {
  const router = useRouter();
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // ⌘K / Ctrl-K focuses search — a 2026 baseline expectation (audit 4.4).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const submit = (q: string) => {
    const trimmed = q.trim();
    router.push(trimmed ? `/tools?q=${encodeURIComponent(trimmed)}` : '/tools');
  };

  return (
    <div className="mx-auto max-w-xl">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          submit(value);
        }}
        className="relative"
      >
        <label htmlFor="hero-search" className="sr-only">
          Search AI tools
        </label>
        <Search
          className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500"
          aria-hidden="true"
        />
        <input
          id="hero-search"
          ref={inputRef}
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Try “free voice cloning” or “caption generator”…"
          className="w-full rounded-2xl border border-white/10 bg-surface-1 py-4 pl-12 pr-28 text-sm text-white placeholder-zinc-500 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 inline-flex -translate-y-1/2 items-center gap-1.5 rounded-xl bg-accent-500 px-4 py-2 text-2xs font-bold text-black hover:opacity-90"
        >
          Search
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </form>

      <div className="mt-4 flex flex-wrap justify-center gap-1.5">
        {SEARCH_SUGGESTIONS.slice(0, 5).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => submit(s)}
            className="rounded-full border border-white/5 bg-surface-1 px-3 py-1 text-2xs text-zinc-500 transition-colors hover:border-accent-500/30 hover:text-accent-300"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
