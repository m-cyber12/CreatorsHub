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
  ShoppingBag,
  Briefcase,
  ChevronDown,
  ChevronRight,
  FolderOpen,
  ShieldCheck,
  Mail,
  FileText,
  Compass,
  Zap,
  Tag,
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
  const [isDirectoryOpen, setIsDirectoryOpen] = useState<boolean>(true);

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
            placeholder="Search 50+ AI video tools, captions, voices..."
            className="w-full rounded-full border border-zinc-300 dark:border-zinc-800 bg-zinc-100/80 dark:bg-zinc-900/80 py-2 pl-10 pr-4 text-sm text-zinc-900 dark:text-zinc-200 placeholder-zinc-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-colors"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={toggleTheme}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="flex items-center gap-2 rounded-full border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-900 px-3.5 py-2 text-xs font-bold text-zinc-800 dark:text-zinc-200 shadow-sm hover:border-purple-500 transition-all active:scale-95"
          >
            {isDark ? (
              <> <Sun className="h-4 w-4 text-amber-400" /> <span className="hidden sm:inline">Light</span> </>
            ) : (
              <> <Moon className="h-4 w-4 text-purple-600" /> <span className="hidden sm:inline">Dark</span> </>
            )}
          </button>

          {/* PRIMARY CTA: Explore AI Tools (as recommended by audit) */}
          <a
            href="/#explore"
            className="hidden sm:flex items-center gap-1.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 text-xs font-extrabold text-white shadow-lg shadow-purple-600/25 transition-all hover:from-purple-500 hover:to-indigo-500 active:scale-95"
          >
            <Compass className="h-4 w-4" />
            <span>Explore Tools</span>
          </a>

          {/* SECONDARY CTA: Submit Tool */}
          <button
            onClick={onOpenSubmitModal}
            className="flex items-center gap-1.5 rounded-full border border-purple-500/40 bg-purple-500/10 px-3.5 py-2 text-xs font-bold text-purple-300 hover:bg-purple-500/20 active:scale-95"
          >
            <PlusCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Submit Tool</span>
          </button>

          {/* HAMBURGER MENU BUTTON */}
          <button
            onClick={() => setIsDrawerOpen(!isDrawerOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-zinc-300 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-white transition-transform hover:scale-105 active:scale-95"
            aria-label="Toggle Navigation Menu"
          >
            {isDrawerOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* FUTURISTIC VERTICAL GLASS HAMBURGER DRAWER */}
      {isDrawerOpen && (
        <div className="fixed inset-x-0 top-16 z-50 border-b border-zinc-200 dark:border-white/10 bg-white/95 dark:bg-zinc-950/95 p-6 shadow-2xl backdrop-blur-2xl animate-drawer">
          <div className="mx-auto max-w-2xl">
            <div className="mb-4 flex items-center justify-between border-b border-zinc-200 dark:border-white/10 pb-3">
              <span className="text-xs font-extrabold uppercase tracking-wider text-purple-500">
                CreatorAI Hub — All Platforms &amp; Trust Pages
              </span>
              <span className="text-[11px] font-semibold text-zinc-500">
                Independent AI Curation
              </span>
            </div>

            <div className="flex flex-col space-y-3">
              {/* BUSINESS 1: DIRECTORY MODULE */}
              <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900/80 overflow-hidden transition-all">
                <button
                  onClick={() => setIsDirectoryOpen(!isDirectoryOpen)}
                  className="w-full flex items-center justify-between p-4 text-left transition-colors hover:bg-purple-500/10"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/20 text-purple-500 dark:text-purple-400">
                      <Layers className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-zinc-900 dark:text-white">
                        1. AI Tools Directory Platform
                      </h3>
                      <p className="text-xs text-zinc-500">
                        50+ Hand-Curated Tools, Compare Engine &amp; SEO Blog
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-purple-400 bg-purple-500/15 px-2 py-0.5 rounded-full">
                      5 Sections
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 text-zinc-400 transition-transform duration-200 ${
                        isDirectoryOpen ? 'rotate-180 text-purple-400' : ''
                      }`}
                    />
                  </div>
                </button>

                {isDirectoryOpen && (
                  <div className="border-t border-zinc-200 dark:border-white/5 bg-zinc-100/50 dark:bg-zinc-950/60 p-3 space-y-1.5">
                    <Link
                      href="/"
                      onClick={() => setIsDrawerOpen(false)}
                      className="flex items-center justify-between rounded-xl p-3 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-purple-500/15 hover:text-purple-400 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <FolderOpen className="h-4 w-4 text-purple-400" />
                        <span>All AI Tools (Directory Index)</span>
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 opacity-50" />
                    </Link>

                    <Link
                      href="/stack-builder"
                      onClick={() => setIsDrawerOpen(false)}
                      className="flex items-center justify-between rounded-xl p-3 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-amber-500/15 hover:text-amber-400 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Zap className="h-4 w-4 text-amber-400" />
                        <span>Creator Stack Builder ⚡ (Goal + Budget)</span>
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 opacity-50" />
                    </Link>

                    <Link
                      href="/compare"
                      onClick={() => setIsDrawerOpen(false)}
                      className="flex items-center justify-between rounded-xl p-3 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-pink-500/15 hover:text-pink-400 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Repeat className="h-4 w-4 text-pink-400" />
                        <span>Head-to-Head Compare Engine</span>
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 opacity-50" />
                    </Link>

                    <Link
                      href="/deals"
                      onClick={() => setIsDrawerOpen(false)}
                      className="flex items-center justify-between rounded-xl p-3 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-emerald-500/15 hover:text-emerald-400 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Tag className="h-4 w-4 text-emerald-400" />
                        <span>Creator Deals &amp; Free Trials 🎁</span>
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 opacity-50" />
                    </Link>

                    <Link
                      href="/blog"
                      onClick={() => setIsDrawerOpen(false)}
                      className="flex items-center justify-between rounded-xl p-3 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-blue-500/15 hover:text-blue-400 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <BookOpen className="h-4 w-4 text-blue-400" />
                        <span>SEO Guides &amp; Blog</span>
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 opacity-50" />
                    </Link>
                  </div>
                )}
              </div>

              {/* BUSINESS 2: NOTION & PROMPT TEMPLATES SHOP */}
              <Link
                href="/templates"
                onClick={() => setIsDrawerOpen(false)}
                className="group flex items-center gap-4 rounded-2xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900/80 p-4 transition-all hover:border-emerald-500 hover:bg-emerald-500/10"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-500 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                  <ShoppingBag className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-extrabold text-zinc-900 dark:text-white group-hover:text-emerald-400">
                      2. Notion &amp; Prompt Templates Shop
                    </h3>
                    <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                      Zero Marginal Cost
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500">
                    YouTube Creator Notion OS, 50 Viral Midjourney Prompts &amp; Google Sheets
                  </p>
                </div>
              </Link>

              {/* BUSINESS 3: AI EDITOR JOB BOARD */}
              <Link
                href="/jobs"
                onClick={() => setIsDrawerOpen(false)}
                className="group flex items-center gap-4 rounded-2xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-900/80 p-4 transition-all hover:border-amber-500 hover:bg-amber-500/10"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/20 text-amber-500 dark:text-amber-400 group-hover:scale-110 transition-transform">
                  <Briefcase className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-extrabold text-zinc-900 dark:text-white group-hover:text-amber-400">
                      3. AI Creator &amp; Editor Job Board
                    </h3>
                    <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-400">
                      $49 Featured Slots
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500">
                    Hiring ElevenLabs, Midjourney &amp; OpusClip video editors &amp; artists
                  </p>
                </div>
              </Link>

              {/* TRUST & LEGAL COMPLIANCE PAGES (AUDIT PRIORITY) */}
              <div className="pt-3 border-t border-zinc-200 dark:border-white/10">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                  Trust, Legal &amp; Compliance Pages
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs font-bold text-zinc-500 dark:text-zinc-400">
                  <Link
                    href="/about"
                    onClick={() => setIsDrawerOpen(false)}
                    className="flex items-center gap-1.5 rounded-xl p-2.5 hover:bg-white/5 hover:text-white transition-colors"
                  >
                    <ShieldCheck className="h-4 w-4 text-purple-400" />
                    <span>About Us</span>
                  </Link>
                  <Link
                    href="/privacy"
                    onClick={() => setIsDrawerOpen(false)}
                    className="flex items-center gap-1.5 rounded-xl p-2.5 hover:bg-white/5 hover:text-white transition-colors"
                  >
                    <FileText className="h-4 w-4 text-purple-400" />
                    <span>Privacy &amp; FTC</span>
                  </Link>
                  <Link
                    href="/terms"
                    onClick={() => setIsDrawerOpen(false)}
                    className="flex items-center gap-1.5 rounded-xl p-2.5 hover:bg-white/5 hover:text-white transition-colors"
                  >
                    <FileText className="h-4 w-4 text-purple-400" />
                    <span>Terms of Service</span>
                  </Link>
                  <Link
                    href="/contact"
                    onClick={() => setIsDrawerOpen(false)}
                    className="flex items-center gap-1.5 rounded-xl p-2.5 hover:bg-white/5 hover:text-white transition-colors"
                  >
                    <Mail className="h-4 w-4 text-purple-400" />
                    <span>Contact Founder</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
