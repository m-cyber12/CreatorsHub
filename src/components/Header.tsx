'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Zap, User as UserIcon, LogOut, Bookmark, ChevronDown } from 'lucide-react';
import { useAuth, useBookmarks } from '@/context/AppProviders';
import { REAL_CATEGORIES, categorySlug } from '@/lib/categories';

/**
 * Audit fixes 3.3, 4.6, 6.1.
 *
 * - /benchmark and /graveyard were orphaned: linked from nowhere in the site,
 *   despite being the two most distinctive pages. Both are now in the nav.
 * - Accessibility: the mobile menu had no aria-expanded, no Escape handling
 *   and no focus management; the account dropdown did not close on outside
 *   click or Escape. All fixed.
 * - Removed the legacy HeaderProps (onOpenSubmitModal, searchQuery,
 *   onSearchChange) which no caller passed — dead API surface.
 */

const NAV_LINKS = [
  { href: '/tools', label: 'All Tools' },
  { href: '/benchmark', label: 'Benchmark' },
  { href: '/compare', label: 'Compare' },
  { href: '/stack-builder', label: 'Stack Builder' },
  { href: '/graveyard', label: 'Graveyard' },
  { href: '/blog', label: 'Guides' },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { bookmarks } = useBookmarks();

  const accountRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // Escape closes any open layer, returning focus to the menu trigger.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (mobileOpen) {
        setMobileOpen(false);
        menuButtonRef.current?.focus();
      }
      setAccountOpen(false);
      setCategoriesOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [mobileOpen]);

  // Click outside closes dropdowns.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (accountRef.current && !accountRef.current.contains(target)) setAccountOpen(false);
      if (categoriesRef.current && !categoriesRef.current.contains(target)) setCategoriesOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  // Prevent background scroll while the mobile sheet is open.
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-surface-0/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2" aria-label="CreatorAI Hub — home">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-500">
            <Zap className="h-4 w-4 text-black" aria-hidden="true" />
          </span>
          <span className="hidden text-lg font-bold text-white sm:block">
            CreatorAI <span className="text-accent-400">Hub</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {/* Categories dropdown */}
          <div className="relative" ref={categoriesRef}>
            <button
              onClick={() => setCategoriesOpen(!categoriesOpen)}
              aria-expanded={categoriesOpen}
              aria-haspopup="true"
              className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
            >
              Categories
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform ${categoriesOpen ? 'rotate-180' : ''}`}
                aria-hidden="true"
              />
            </button>
            {categoriesOpen && (
              <div className="absolute left-0 mt-2 grid w-[30rem] grid-cols-2 gap-1 rounded-xl border border-white/10 bg-surface-1 p-2 shadow-2xl">
                {REAL_CATEGORIES.map((c) => (
                  <Link
                    key={c}
                    href={`/category/${categorySlug(c)}`}
                    onClick={() => setCategoriesOpen(false)}
                    className="rounded-lg px-3 py-2 text-2xs font-medium text-zinc-300 hover:bg-white/5 hover:text-accent-300"
                  >
                    {c}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/account"
            className="relative hidden rounded-lg p-2 text-zinc-400 transition-colors hover:bg-white/5 hover:text-white sm:inline-flex"
            aria-label={`Saved tools${bookmarks.length ? ` (${bookmarks.length})` : ''}`}
          >
            <Bookmark className="h-4 w-4" aria-hidden="true" />
            {bookmarks.length > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-500 px-1 font-mono text-[0.625rem] font-bold tabular-nums text-black">
                {bookmarks.length}
              </span>
            )}
          </Link>

          {user ? (
            <div className="relative hidden sm:block" ref={accountRef}>
              <button
                onClick={() => setAccountOpen(!accountOpen)}
                aria-expanded={accountOpen}
                aria-haspopup="true"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-500 text-2xs font-bold text-black ring-2 ring-white/10"
                aria-label="Account menu"
              >
                {(user.email || 'U')[0].toUpperCase()}
              </button>
              {accountOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-xl border border-white/10 bg-surface-1 p-2 shadow-2xl">
                  <p className="truncate px-3 py-2 text-2xs text-zinc-500">{user.email}</p>
                  <Link
                    href="/account"
                    onClick={() => setAccountOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-2xs font-semibold text-zinc-300 hover:bg-white/5"
                  >
                    <UserIcon className="h-3.5 w-3.5" aria-hidden="true" /> My Account
                  </Link>
                  <button
                    onClick={() => {
                      signOut();
                      setAccountOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-2xs font-semibold text-rose-400 hover:bg-white/5"
                  >
                    <LogOut className="h-3.5 w-3.5" aria-hidden="true" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden items-center rounded-lg border border-white/10 px-3 py-2 text-2xs font-bold text-zinc-300 transition-colors hover:bg-white/5 hover:text-white sm:inline-flex"
            >
              Sign In
            </Link>
          )}

          <Link
            href="/submit"
            className="hidden items-center rounded-lg bg-accent-500 px-3 py-2 text-2xs font-bold text-black transition-opacity hover:opacity-90 sm:inline-flex"
          >
            Submit Tool
          </Link>

          <button
            ref={menuButtonRef}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-white/5 hover:text-white lg:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div
          id="mobile-menu"
          className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-white/5 bg-surface-0 px-4 py-4 lg:hidden"
        >
          <nav className="flex flex-col gap-1" aria-label="Mobile">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-300 hover:bg-white/5 hover:text-white"
              >
                {link.label}
              </Link>
            ))}

            <p className="mt-3 px-3 text-2xs font-bold uppercase tracking-wider text-zinc-600">
              Categories
            </p>
            {REAL_CATEGORIES.map((c) => (
              <Link
                key={c}
                href={`/category/${categorySlug(c)}`}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-2 text-2xs text-zinc-400 hover:bg-white/5 hover:text-white"
              >
                {c}
              </Link>
            ))}

            <Link
              href={user ? '/account' : '/login'}
              onClick={() => setMobileOpen(false)}
              className="mt-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-300 hover:bg-white/5"
            >
              {user ? 'My Account' : 'Sign In'}
            </Link>
            <Link
              href="/submit"
              onClick={() => setMobileOpen(false)}
              className="mt-2 rounded-lg bg-accent-500 px-3 py-2.5 text-center text-sm font-bold text-black"
            >
              Submit Tool
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
