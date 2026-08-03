"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Zap, User as UserIcon, LogOut, Bookmark } from 'lucide-react';
import { useAuth, useBookmarks } from '@/context/AppProviders';

// Legacy props kept optional so older pages passing them don't break the build.
interface HeaderProps {
  onOpenSubmitModal?: () => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
}

export function Header(_props: HeaderProps = {}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { bookmarks } = useBookmarks();

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/tools', label: 'All Tools' },
    { href: '/compare', label: 'Compare' },
    { href: '/stack-builder', label: 'Stack Builder' },
    { href: '/blog', label: 'Blog' },
    { href: '/deals', label: 'Deals' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#030305]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-pink-600">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold text-white hidden sm:block">
            CreatorAI <span className="text-purple-400">Hub</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-400 hover:bg-white/5 hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/account"
            className="relative hidden sm:inline-flex items-center rounded-lg p-2 text-zinc-400 hover:bg-white/5 hover:text-white transition-colors"
            aria-label="Saved tools"
          >
            <Bookmark className="h-4 w-4" />
            {bookmarks.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-purple-600 px-1 text-[9px] font-bold text-white">
                {bookmarks.length}
              </span>
            )}
          </Link>

          {user ? (
            <div className="relative hidden sm:block">
              <button
                onClick={() => setAccountOpen(!accountOpen)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-pink-600 text-xs font-bold text-white ring-2 ring-white/10"
                aria-label="Account menu"
              >
                {(user.email || 'U')[0].toUpperCase()}
              </button>
              {accountOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-xl border border-white/10 bg-zinc-900 p-2 shadow-2xl">
                  <p className="truncate px-3 py-2 text-[11px] text-zinc-500">{user.email}</p>
                  <Link
                    href="/account"
                    onClick={() => setAccountOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-zinc-300 hover:bg-white/5"
                  >
                    <UserIcon className="h-3.5 w-3.5" /> My Account
                  </Link>
                  <button
                    onClick={() => { signOut(); setAccountOpen(false); }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-white/5"
                  >
                    <LogOut className="h-3.5 w-3.5" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center rounded-lg border border-white/10 px-3 py-2 text-xs font-bold text-zinc-300 hover:bg-white/5 hover:text-white transition-colors"
            >
              Sign In
            </Link>
          )}

          <Link
            href="/submit"
            className="hidden sm:inline-flex items-center rounded-lg bg-purple-600 px-3 py-2 text-xs font-bold text-white hover:bg-purple-500 transition-colors"
          >
            Submit Tool
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden rounded-lg p-2 text-zinc-400 hover:bg-white/5 hover:text-white transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-white/5 px-4 py-4 md:hidden bg-[#030305]/95 backdrop-blur-xl">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-400 hover:bg-white/5 hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href={user ? '/account' : '/login'}
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-400 hover:bg-white/5 hover:text-white transition-colors"
            >
              {user ? 'My Account' : 'Sign In'}
            </Link>
            <Link
              href="/submit"
              onClick={() => setMobileMenuOpen(false)}
              className="mt-2 rounded-lg bg-purple-600 px-3 py-2.5 text-sm font-bold text-white text-center hover:bg-purple-500 transition-colors"
            >
              Submit Tool
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
