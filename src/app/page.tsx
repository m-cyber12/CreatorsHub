"use client";

import React, { useState, useMemo } from 'react';
import { INITIAL_TOOLS, CATEGORIES, Category, Tool } from '@/data/tools';
import { Header } from '@/components/Header';
import { ToolCard } from '@/components/ToolCard';
import { SubmitModal } from '@/components/SubmitModal';
import { Sparkles, Award, TrendingUp, Filter, CheckCircle2, Zap } from 'lucide-react';

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
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      <div>
        <Header
          onOpenSubmitModal={() => setIsSubmitModalOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-zinc-800/60 pb-16 pt-12 sm:pb-24 sm:pt-20">
          <div className="absolute inset-0 bg-hero-glow pointer-events-none -z-10" />

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            {/* Pill Announcement */}
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3.5 py-1.5 text-xs font-semibold text-purple-300 shadow-inner">
              <Sparkles className="h-3.5 w-3.5 text-purple-400" />
              <span>Tested &amp; Verified Video AI Tools for 2026</span>
            </div>

            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl">
              Supercharge Your <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-purple-400 via-indigo-400 to-pink-400 bg-clip-text text-transparent">
                Video Creation Workflow
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base text-zinc-400 sm:text-lg">
              No spam, no generic ChatGPT wrappers. Discover hand-curated AI video editors,
              Shorts clippers, realistic voice generators, and thumbnail tools — tested for real YouTubers &amp; editors.
            </p>

            {/* Quick Stats / Trust Banner */}
            <div className="mx-auto mt-10 flex flex-wrap items-center justify-center gap-8 border-y border-zinc-800/60 py-4 text-xs font-medium text-zinc-400 sm:max-w-3xl">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Zero Spam — Hand-Curated Tools</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-purple-400" />
                <span>Founder Verified Badges</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-400" />
                <span>Weekly AI Curation</span>
              </div>
            </div>
          </div>
        </section>

        {/* Founder Flywheel Notice Banner */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-6">
          <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-900/30 via-indigo-900/20 to-zinc-900/80 p-6 shadow-xl backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  Are you building an AI video tool? Get the Verified Founder Badge!
                </h3>
                <p className="text-xs text-zinc-400">
                  Add our verified badge on your website or mention us on Twitter/X to get priority listing &amp; permanent backlink.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsSubmitModalOpen(true)}
              className="shrink-0 rounded-xl bg-purple-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-purple-600/30 hover:bg-purple-500"
            >
              Submit Tool Free
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          {/* Category Filter Pills & Pricing Filter */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800/80 pb-6">
            {/* Categories */}
            <div className="flex flex-wrap items-center gap-2">
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                    selectedCategory === category
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                      : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white'
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
                className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-300 focus:border-purple-500 focus:outline-none"
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
            <section className="mt-12">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="h-5 w-5 text-purple-400" />
                <h2 className="text-xl font-bold tracking-tight text-white">
                  Featured AI Tools for Creators
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {featuredTools.map((tool) => (
                  <ToolCard key={tool.id} tool={tool} />
                ))}
              </div>
            </section>
          )}

          {/* All Tools Grid */}
          <section className="mt-14">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold tracking-tight text-white">
                {selectedCategory === 'All'
                  ? 'All Video AI Tools'
                  : `${selectedCategory} Tools`}
              </h2>
              <span className="text-xs font-medium text-zinc-500">
                Showing {filteredTools.length} {filteredTools.length === 1 ? 'tool' : 'tools'}
              </span>
            </div>

            {filteredTools.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredTools.map((tool) => (
                  <ToolCard key={tool.id} tool={tool} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/50 py-16 text-center">
                <p className="text-sm font-semibold text-zinc-400">
                  No AI tools found matching your search.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('All');
                    setSelectedPricing('All');
                    setSearchQuery('');
                  }}
                  className="mt-4 rounded-xl bg-purple-600/20 px-4 py-2 text-xs font-semibold text-purple-300 hover:bg-purple-600/30"
                >
                  Reset all filters
                </button>
              </div>
            )}
          </section>
        </main>
      </div>

      {/* Footer */}
      <footer className="mt-20 border-t border-zinc-800/80 bg-zinc-950/80 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-white">
                CreatorAI<span className="text-purple-400">Hub</span>
              </span>
            </div>
            <p className="mt-1 text-xs text-zinc-500">
              © 2026 CreatorAI Hub. Built for solo founders &amp; video creators.
            </p>
          </div>

          <div className="flex items-center gap-6 text-xs text-zinc-400">
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
