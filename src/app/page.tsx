"use client";

import React, { useState, useMemo } from 'react';
import { INITIAL_TOOLS, CATEGORIES, Category } from '@/data/tools';
import { Header } from '@/components/Header';
import { ToolCard } from '@/components/ToolCard';
import { SubmitModal } from '@/components/SubmitModal';
import { Hero3D } from '@/components/Hero3D';
import { ScrollMarquee } from '@/components/ScrollMarquee';
import { Sparkles, Award, TrendingUp, Filter, CheckCircle2, Zap, ShieldCheck } from 'lucide-react';

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [selectedPricing, setSelectedPricing] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState<boolean>(false);

  // Filter tools
  const filteredTools = useMemo(() => {
    return INITIAL_TOOLS.filter((tool) => {
      const matchesCategory =
        selectedCategory === 'All' || tool.category === selectedCategory;
      const matchesPricing =
        selectedPricing === 'All' || tool.pricing === selectedPricing;
      const matchesSearch =
        searchQuery === '' ||
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCategory && matchesPricing && matchesSearch;
    });
  }, [selectedCategory, selectedPricing, searchQuery]);

  const featuredTools = useMemo(
    () => INITIAL_TOOLS.filter((t) => t.isFeatured),
    []
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between overflow-x-hidden">
      <div>
        <Header
          onOpenSubmitModal={() => setIsSubmitModalOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* 3D Animated Hero Section (MotionSites.ai Sky Estate Style) */}
        <Hero3D onOpenSubmitModal={() => setIsSubmitModalOpen(true)} />

        {/* Infinite Cinematic Brand/Tool Marquee */}
        <ScrollMarquee />

        {/* Founder Flywheel Notice Banner - Glassmorphism Neon Ribbon */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
          <div className="cinematic-card rounded-3xl border border-purple-500/40 bg-gradient-to-r from-purple-950/60 via-indigo-950/40 to-zinc-950/90 p-6 sm:p-8 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/40 shadow-inner">
                <Award className="h-7 w-7 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-white">
                    Are you building an AI video tool? Get the Verified Founder Badge!
                  </h3>
                  <span className="hidden sm:inline-block rounded-full bg-purple-500/20 px-2.5 py-0.5 text-[10px] font-bold text-purple-300">
                    Free Backlink
                  </span>
                </div>
                <p className="mt-1.5 text-xs text-zinc-300 leading-relaxed max-w-xl">
                  Add our verified badge on your website or mention CreatorAI Hub on Twitter/X to receive priority listing &amp; permanent SEO backlink.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsSubmitModalOpen(true)}
              className="shrink-0 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 px-6 py-3.5 text-xs font-extrabold text-white shadow-lg shadow-purple-600/30 hover:from-purple-500 hover:to-indigo-500 transition-all active:scale-95"
            >
              Submit Tool Free
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8" id="explore">
          {/* Category Filter Pills & Pricing Filter */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-6">
            {/* Categories */}
            <div className="flex flex-wrap items-center gap-2">
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`rounded-full px-5 py-2.5 text-xs font-extrabold transition-all ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-600/30 scale-105'
                      : 'bg-zinc-900/80 border border-white/5 text-zinc-400 hover:bg-zinc-800 hover:text-white'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Pricing Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-zinc-500" />
              <select
                value={selectedPricing}
                onChange={(e) => setSelectedPricing(e.target.value)}
                className="rounded-xl border border-white/10 bg-zinc-900 px-3.5 py-2 text-xs font-bold text-zinc-300 focus:border-purple-500 focus:outline-none"
              >
                <option value="All">All Pricing</option>
                <option value="Free">Free</option>
                <option value="Freemium">Freemium</option>
                <option value="Free Trial">Free Trial</option>
                <option value="Paid">Paid</option>
              </select>
            </div>
          </div>

          {/* Featured Tools Row (Only show when selectedCategory is All and no search) */}
          {selectedCategory === 'All' && searchQuery === '' && (
            <section className="mt-14">
              <div className="flex items-center gap-3 mb-8">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-2xl font-extrabold tracking-tight text-white">
                    Featured AI Tools for Creators
                  </h2>
                  <p className="text-xs text-zinc-400">Hand-selected by our editorial team for performance &amp; high CTR</p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {featuredTools.map((tool) => (
                  <ToolCard key={tool.id} tool={tool} />
                ))}
              </div>
            </section>
          )}

          {/* All Tools Grid */}
          <section className="mt-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight text-white">
                  {selectedCategory === 'All'
                    ? 'All Video AI Tools'
                    : `${selectedCategory} Tools`}
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Explore 2026&apos;s highest-rated AI tools for video editing, Shorts, &amp; audio
                </p>
              </div>
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider bg-zinc-900 px-3 py-1.5 rounded-full border border-white/5">
                {filteredTools.length} {filteredTools.length === 1 ? 'tool' : 'tools'} found
              </span>
            </div>

            {filteredTools.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredTools.map((tool) => (
                  <ToolCard key={tool.id} tool={tool} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-zinc-950/50 py-20 text-center">
                <p className="text-sm font-bold text-zinc-400">
                  No AI tools found matching your search.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('All');
                    setSelectedPricing('All');
                    setSearchQuery('');
                  }}
                  className="mt-4 rounded-xl bg-purple-600/20 px-5 py-2.5 text-xs font-bold text-purple-300 hover:bg-purple-600/30 transition-all"
                >
                  Reset all filters
                </button>
              </div>
            )}
          </section>
        </main>
      </div>

      {/* Footer */}
      <footer className="mt-24 border-t border-white/10 bg-zinc-950/95 py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-extrabold tracking-tight text-white">
                CreatorAI<span className="text-purple-400">Hub</span>
              </span>
              <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-[10px] font-bold text-purple-300">
                MotionSites 3D Edition
              </span>
            </div>
            <p className="mt-1 text-xs text-zinc-500">
              © 2026 CreatorAI Hub. Cinematic AI Web Experience — Built for solo founders.
            </p>
          </div>

          <div className="flex items-center gap-6 text-xs font-bold text-zinc-400">
            <button
              onClick={() => setIsSubmitModalOpen(true)}
              className="hover:text-purple-400 transition-colors"
            >
              Submit Tool
            </button>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-purple-400 transition-colors"
            >
              GitHub Repo
            </a>
            <a
              href="#top"
              className="hover:text-purple-400 transition-colors"
            >
              Back to Top
            </a>
          </div>
        </div>
      </footer>

      {/* Submit Modal */}
      <SubmitModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
      />
    </div>
  );
}
