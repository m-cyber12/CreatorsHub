"use client";

import React, { useState, useMemo } from 'react';
import { Header } from '@/components/Header';
import { ToolCard } from '@/components/ToolCard';
import { INITIAL_TOOLS, CATEGORIES, PRICING_OPTIONS, type Category, type PricingOption } from '@/data/tools';
import { Search, SlidersHorizontal, X, Sparkles, TrendingUp, Award, Zap } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [selectedPricing, setSelectedPricing] = useState<PricingOption>('All');
  const [showFilters, setShowFilters] = useState(false);

  const filteredTools = useMemo(() => {
    let result = INITIAL_TOOLS;
    if (selectedCategory !== 'All') {
      result = result.filter((t) => t.category === selectedCategory);
    }
    if (selectedPricing !== 'All') {
      result = result.filter((t) => t.pricing === selectedPricing);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.tagline.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    }
    return result;
  }, [searchQuery, selectedCategory, selectedPricing]);

  const featuredTools = useMemo(() => INITIAL_TOOLS.filter((t) => t.isFeatured).slice(0, 6), []);
  const trendingTools = useMemo(() => INITIAL_TOOLS.filter((t) => t.isTrending).slice(0, 4), []);
  const newTools = useMemo(() => INITIAL_TOOLS.filter((t) => t.isNew).slice(0, 4), []);

  return (
    <div className="min-h-screen bg-[#030305] text-white">
      <Header />

      {/* FTC Disclosure */}
      <div className="bg-zinc-900/50 border-b border-white/5 px-4 py-2 text-center text-[11px] text-zinc-400">
        <span className="font-semibold text-zinc-300">FTC Affiliate Disclosure:</span> Some links are referral affiliate links. We may earn a commission at no extra cost to you.{" "}
        <Link href="/disclosure" className="underline text-purple-400 hover:text-purple-300">Read Disclosure →</Link>
      </div>

      {/* Hero Section */}
      <section className="relative px-4 pt-16 pb-12 md:pt-24 md:pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-transparent to-transparent pointer-events-none" />
        <div className="relative mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-purple-500/10 border border-purple-500/20 px-4 py-1.5 text-xs font-semibold text-purple-300 mb-6">
            <Zap className="h-3.5 w-3.5" /> The Curated AI Toolbox for Video Creators
          </span>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4 leading-tight">
            Stop Searching.
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">
              Start Creating.
            </span>
          </h1>
          <p className="text-base md:text-lg text-zinc-400 max-w-2xl mx-auto mb-8 leading-relaxed">
            Hand-picked, tested, and compared — the best 50 AI tools for YouTubers, video editors, and content creators in 2026.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tools, features, or categories..."
                className="w-full rounded-2xl border border-white/10 bg-zinc-900/80 py-4 pl-12 pr-4 text-sm text-white placeholder-zinc-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 backdrop-blur-xl"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Quick Category Pills */}
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {CATEGORIES.slice(0, 6).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat as Category)}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all border ${
                  selectedCategory === cat
                    ? 'bg-purple-600 text-white border-purple-500'
                    : 'bg-zinc-900/60 text-zinc-400 border-white/10 hover:border-purple-500/30 hover:text-purple-300'
                }`}
              >
                {cat}
              </button>
            ))}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold bg-zinc-900/60 text-zinc-400 border border-white/10 hover:border-purple-500/30 hover:text-purple-300 transition-all"
            >
              <SlidersHorizontal className="h-3 w-3" /> Filters
            </button>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="flex flex-wrap justify-center gap-2 animate-in fade-in slide-in-from-top-2">
              {CATEGORIES.slice(6).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat as Category)}
                  className={`rounded-full px-3 py-1 text-[11px] font-semibold transition-all border ${
                    selectedCategory === cat
                      ? 'bg-purple-600 text-white border-purple-500'
                      : 'bg-zinc-900/60 text-zinc-400 border-white/10 hover:border-purple-500/30'
                  }`}
                >
                  {cat}
                </button>
              ))}
              <div className="w-full" />
              {PRICING_OPTIONS.map((p) => (
                <button
                  key={p}
                  onClick={() => setSelectedPricing(p as PricingOption)}
                  className={`rounded-full px-3 py-1 text-[11px] font-semibold transition-all border ${
                    selectedPricing === p
                      ? 'bg-emerald-600 text-white border-emerald-500'
                      : 'bg-zinc-900/60 text-zinc-400 border-white/10 hover:border-emerald-500/30'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Section */}
      {selectedCategory === 'All' && selectedPricing === 'All' && !searchQuery && (
        <>
          <section className="px-4 pb-12">
            <div className="mx-auto max-w-7xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-amber-400" />
                  <div>
                    <h2 className="text-xl font-bold text-white">Featured AI Tools</h2>
                    <p className="text-xs text-zinc-500 mt-0.5">Hand-selected by our editorial team for performance & high CTR</p>
                  </div>
                </div>
                <Link href="/tools" className="text-xs font-semibold text-purple-400 hover:text-purple-300">View All →</Link>
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {featuredTools.map((tool, i) => (
                  <ToolCard key={tool.id} tool={tool} index={i} />
                ))}
              </div>
            </div>
          </section>

          {/* Trending Strip */}
          <section className="px-4 pb-12">
            <div className="mx-auto max-w-7xl">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-rose-400" /> Trending Now
              </h2>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {trendingTools.map((tool, i) => (
                  <ToolCard key={tool.id} tool={tool} index={i} />
                ))}
              </div>
            </div>
          </section>

          {/* New Tools Strip */}
          <section className="px-4 pb-12">
            <div className="mx-auto max-w-7xl">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-emerald-400" /> Recently Added
              </h2>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {newTools.map((tool, i) => (
                  <ToolCard key={tool.id} tool={tool} index={i} />
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {/* All Tools / Filtered Results */}
      <section className="px-4 pb-20">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">
                {searchQuery ? `Search: "${searchQuery}"` : selectedCategory === 'All' ? 'All AI Tools' : `${selectedCategory} Tools`}
              </h2>
              <p className="text-xs text-zinc-500 mt-1">
                Explore 2026's highest-rated AI tools for video editing, Shorts, & audio
              </p>
            </div>
            <span className="text-sm font-semibold text-zinc-400">
              <span className="text-white">{filteredTools.length}</span> {filteredTools.length === 1 ? 'tool' : 'tools'} found
            </span>
          </div>

          {filteredTools.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredTools.map((tool, i) => (
                <ToolCard key={tool.id} tool={tool} index={i} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-lg font-bold text-white mb-2">No tools found</h3>
              <p className="text-sm text-zinc-500 max-w-md">
                Try adjusting your search query or filters. We have 50 curated tools across 7 categories.
              </p>
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('All'); setSelectedPricing('All'); }}
                className="mt-4 rounded-xl bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-500 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter */}
      <section className="border-t border-white/5 bg-zinc-900/30 px-4 py-16">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Join 5,000+ Creators</h2>
          <p className="text-sm text-zinc-400 mb-6">Get weekly AI tool reviews, prompt kits, and creator monetization hacks. No spam.</p>
          <form className="flex gap-2 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-purple-500 focus:outline-none"
            />
            <button className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 text-sm font-bold text-white hover:opacity-90 transition-opacity whitespace-nowrap">
              Subscribe
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-black px-4 py-12">
        <div className="mx-auto max-w-7xl grid grid-cols-2 md:grid-cols-4 gap-8 text-xs">
          <div>
            <h4 className="font-bold text-white mb-3">CreatorAI Hub</h4>
            <p className="text-zinc-500 leading-relaxed">The curated AI toolbox for video creators. Stop searching, start creating.</p>
          </div>
          <div>
            <h4 className="font-bold text-white mb-3">Directory</h4>
            <ul className="space-y-2 text-zinc-500">
              <li><Link href="/tools" className="hover:text-purple-400">All Tools</Link></li>
              <li><Link href="/compare" className="hover:text-purple-400">Compare</Link></li>
              <li><Link href="/stack-builder" className="hover:text-purple-400">Stack Builder</Link></li>
              <li><Link href="/deals" className="hover:text-purple-400">Deals</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-3">Company</h4>
            <ul className="space-y-2 text-zinc-500">
              <li><Link href="/about" className="hover:text-purple-400">About</Link></li>
              <li><Link href="/disclosure" className="hover:text-purple-400">Disclosure</Link></li>
              <li><Link href="/contact" className="hover:text-purple-400">Contact</Link></li>
              <li><Link href="/blog" className="hover:text-purple-400">Blog</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-3">Legal</h4>
            <ul className="space-y-2 text-zinc-500">
              <li><Link href="/privacy" className="hover:text-purple-400">Privacy</Link></li>
              <li><Link href="/terms" className="hover:text-purple-400">Terms</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 text-center text-[11px] text-zinc-600">
          © 2026 CreatorAI Hub. All rights reserved. | <Link href="/disclosure" className="hover:text-zinc-400">Affiliate Disclosure</Link>
        </div>
      </footer>
    </div>
  );
}
