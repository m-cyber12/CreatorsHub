"use client";

import React from 'react';
import { Sparkles, PlusCircle, Search } from 'lucide-react';

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
  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand Identity */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 via-indigo-600 to-pink-500 shadow-lg shadow-purple-500/25">
            <Sparkles className="h-5 w-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-white">
                CreatorAI<span className="text-purple-400">Hub</span>
              </span>
              <span className="hidden rounded-full border border-purple-500/30 bg-purple-500/10 px-2 py-0.5 text-[10px] font-medium text-purple-300 sm:inline-block">
                For Video Creators
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              The Curated AI Toolbox for YouTubers &amp; Editors
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative hidden flex-1 max-w-md md:block">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search AI video tools, captions, voices, thumbnails..."
            className="w-full rounded-full border border-zinc-800 bg-zinc-900/80 py-2 pl-10 pr-4 text-sm text-zinc-200 placeholder-zinc-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
          />
        </div>

        {/* CTA Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSubmitModal}
            className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-600/25 transition-all hover:from-purple-500 hover:to-indigo-500 hover:shadow-purple-500/30 active:scale-95"
          >
            <PlusCircle className="h-4 w-4 transition-transform group-hover:rotate-90" />
            <span>Submit a Tool</span>
          </button>
        </div>
      </div>

      {/* Mobile Search Input */}
      <div className="border-t border-zinc-800/50 px-4 py-2 md:hidden">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search AI tools..."
            className="w-full rounded-full border border-zinc-800 bg-zinc-900 py-1.5 pl-10 pr-4 text-sm text-zinc-200 placeholder-zinc-500 focus:border-purple-500 focus:outline-none"
          />
        </div>
      </div>
    </header>
  );
};
