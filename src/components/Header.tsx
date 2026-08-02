"use client";

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  PlusCircle,
  Search,
  Moon,
  Sun,
  BookOpen,
  Repeat,
  Menu,
  X,
  Layers,
} from 'lucide-react';
import Link from 'next/link';

interface HeaderProps {
  onOpenSubmitModal: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSubmitModal,
  searchQuery,
  onSearchChange,
}) => {
  const [isDark, setIsDark] = useState<boolean>(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl transition-colors duration-300">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand Identity */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 via-indigo-600 to-pink-500 shadow-lg shadow-purple-500/25 transition-transform group-hover:scale-105">
              <Sparkles className="h-5 w-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-extrabold tracking-tight text-zinc-900 dark:text-white">
                  CreatorAI<span className="text-purple-600 dark:text-purple-400">Hub</span>
                </span>
                <span className="hidden sm:inline-block rounded-full border border-purple-500/30 bg-purple-500/10 px-2 py-0.5 text-[10px] font-bold text-purple-600 dark:text-purple-300">
                  Bold Studio
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 hidden sm:block">
                The Curated AI Toolbox for Video Creators
              </p>
            </div>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="relative hidden flex-1 max-w-md lg:block">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search AI video tools, captions, voices..."
            className="w-full rounded-full border border-zinc-300 dark:border-zinc-800 bg-zinc-100/80 dark:bg-zinc-900/80 py-2 pl-10 pr-4 text-sm text-zinc-900 dark:text-zinc-200 placeholder-zinc-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-colors"
          />
        </div>

        {/* Actions: Theme Toggle + Submit Button + HAMBURGER MENU */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="flex items-center gap-2 rounded-full border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-900 px-3.5 py-2 text-xs font-bold text-zinc-800 dark:text-zinc-200 shadow-sm hover:border-purple-500 transition-all active:scale-95"
          >
            {isDark ? (
              <>
                <Sun className="h-4 w-4 text-amber-400" />
                <span className="hidden sm:inline">Light</span>
              </>
            ) : (
              <>
                <Moon className="h-4 w-4 text-purple-600" />
                <span className="hidden sm:inline">Dark</span>
              </>
            )}
          </button>

          {/* Submit Tool Button */}
          <button
            onClick={onOpenSubmitModal}
            className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 text-xs sm:text-sm font-extrabold text-white shadow-lg shadow-purple-600/25 transition-all hover:from-purple-500 hover:to-indigo-500 hover:shadow-purple-500/30 active:scale-95"
          >
            <PlusCircle className="h-4 w-4 transition-transform group-hover:rotate-90" />
            <span className="hidden sm:inline">Submit Tool</span>
          </button>

          {/* HAMBURGER MENU BUTTON */}
          <button
            onClick={() => setIsDrawerOpen(!isDrawerOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-zinc-300 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-white transition-transform hover:scale-105 active:scale-95"
            aria-label="Toggle Navigation Drawer"
          >
            {isDrawerOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* FUTURISTIC VERTICAL GLASS HAMBURGER DRAWER */}
      {isDrawerOpen && (
        <div className="fixed inset-x-0 top-16 z-50 border-b border-zinc-200 dark:border-white/10 bg-white/95 dark:bg-zinc-950/95 p-6 shadow-2xl backdrop-blur-2xl animate-drawer">
          <div className="mx-auto max-w-xl">
            <div className="mb-4 flex items-center justify-between border-b border-zinc-200 dark:border-white/10 pb-3">
              <span className="text-xs font-extrabold uppercase tracking-wider text-purple-500">
                Navigation Menu
              </span>
              <span className="text-[11px] font-semibold text-zinc-500">
                MotionSites Interactive Drawer
              </span>
            </div>

            {/* VERTICAL STACKED MENU (AS REQUESTED) */}
            <div className="flex flex-col space-y-3">
              {/* Directory */}
              <Link
                href="/"
                onClick={() => setIsDrawerOpen(false)}
                className="group flex items-center gap-4 rounded-2xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900/80 p-4 transition-all hover:border-purple-500 hover:bg-purple-500/10"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/20 text-purple-500 dark:text-purple-400 group-hover:scale-110 transition-transform">
                  <Layers className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-extrabold text-zinc-900 dark:text-white group-hover:text-purple-400">
                    Directory
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Explore all tested AI video &amp; creator tools
                  </p>
                </div>
              </Link>

              {/* Head-to-Head Compare */}
              <Link
                href="/compare"
                onClick={() => setIsDrawerOpen(false)}
                className="group flex items-center gap-4 rounded-2xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900/80 p-4 transition-all hover:border-pink-500 hover:bg-pink-500/10"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-pink-500/20 text-pink-500 dark:text-pink-400 group-hover:scale-110 transition-transform">
                  <Repeat className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-extrabold text-zinc-900 dark:text-white group-hover:text-pink-400">
                    Head-to-Head Compare
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Compare features, CTR &amp; pricing side-by-side
                  </p>
                </div>
              </Link>

              {/* SEO Blog */}
              <Link
                href="/blog"
                onClick={() => setIsDrawerOpen(false)}
                className="group flex items-center gap-4 rounded-2xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900/80 p-4 transition-all hover:border-blue-500 hover:bg-blue-500/10"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/20 text-blue-500 dark:text-blue-400 group-hover:scale-110 transition-transform">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-extrabold text-zinc-900 dark:text-white group-hover:text-blue-400">
                    SEO Blog &amp; Guides
                  </h3>
                  <p className="text-xs text-zinc-500">
                    In-depth creator growth strategies &amp; reviews
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
