"use client";

import React, { useState, useEffect } from 'react';
import { Sparkles, PlusCircle, Search, Moon, Sun, BookOpen, Repeat } from 'lucide-react';
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
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 via-indigo-600 to-pink-500 shadow-lg shadow-purple-500/25">
              <Sparkles className="h-5 w-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-extrabold tracking-tight text-zinc-900 dark:text-white">
                  CreatorAI<span className="text-purple-600 dark:text-purple-400">Hub</span>
                </span>
                <span className="hidden rounded-full border border-purple-500/30 bg-purple-500/10 px-2 py-0.5 text-[10px] font-bold text-purple-600 dark:text-purple-300 sm:inline-block">
                  Bold Studio
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 hidden sm:block">
                The Curated AI Toolbox for Video Creators
              </p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-5 pl-4 border-l border-white/10 text-xs font-bold text-zinc-400">
            <Link href="/" className="hover:text-white transition-colors">Directory</Link>
            <Link href="/compare" className="flex items-center gap-1 hover:text-purple-400 transition-colors">
              <Repeat className="h-3.5 w-3.5" /> <span>Compare</span>
            </Link>
            <Link href="/blog" className="flex items-center gap-1 hover:text-pink-400 transition-colors">
              <BookOpen className="h-3.5 w-3.5" /> <span>SEO Guides</span>
            </Link>
          </nav>
        </div>

        <div className="relative hidden flex-1 max-w-md lg:block">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search AI video tools, captions, voices..."
            className="w-full rounded-full border border-zinc-300 dark:border-zinc-800 bg-zinc-100/80 dark:bg-zinc-900/80 py-2 pl-10 pr-4 text-sm text-zinc-900 dark:text-zinc-200 placeholder-zinc-500 focus:border-purple-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 rounded-full border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-900 px-3.5 py-2 text-xs font-bold text-zinc-800 dark:text-zinc-200 shadow-sm hover:border-purple-500"
          >
            {isDark ? (
              <> <Sun className="h-4 w-4 text-amber-400" /> <span className="hidden sm:inline">Light</span> </>
            ) : (
              <> <Moon className="h-4 w-4 text-purple-600" /> <span className="hidden sm:inline">Dark</span> </>
            )}
          </button>
          <button
            onClick={onOpenSubmitModal}
            className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 text-xs sm:text-sm font-extrabold text-white shadow-lg shadow-purple-600/25"
          >
            <PlusCircle className="h-4 w-4" /> <span>Submit Tool</span>
          </button>
        </div>
      </div>
    </header>
  );
};
