"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ToolCard } from '@/components/ToolCard';
import { CompareBar } from '@/components/CompareBar';
import { NewsletterForm } from '@/components/NewsletterForm';
import { ALL_TOOLS, CATEGORIES, PRICING_OPTIONS, type Category, type PricingOption } from '@/data/tools';
import { searchToolsAdvanced, SEARCH_SUGGESTIONS } from '@/lib/search';
import { BLOG_POSTS } from '@/data/posts';
import { Search, SlidersHorizontal, X, Sparkles, TrendingUp, Award, Zap, BookOpen, ShieldCheck, FlaskConical, BadgeDollarSign } from 'lucide-react';
import Link from 'next/link';

const VISIBLE_STEP = 24;

export default function HomePage() {
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [selectedPricing, setSelectedPricing] = useState<PricingOption>('All');
  const [showFilters, setShowFilters] = useState(false);
  const [visibleCount, setVisibleCount] = useState(VISIBLE_STEP);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // debounced instant search
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearchQuery(searchInput);
      setVisibleCount(VISIBLE_STEP);
    }, 200);
    return () => clearTimeout(debounceRef.current);
  }, [searchInput]);

  const filteredTools = useMemo(() => {
    let result = ALL_TOOLS;
    if (selectedCategory !== 'All') result = result.filter((t) => t.category === selectedCategory);
    if (selectedPricing !== 'All') result = result.filter((t) => t.pricing === selectedPricing);
    if (searchQuery.trim()) result = searchToolsAdvanced(searchQuery, result, 200);
    return result;
  }, [searchQuery, selectedCategory, selectedPricing]);

  const featuredTools = useMemo(() => ALL_TOOLS.filter((t) => t.isFeatured).slice(0, 6), []);
  const trendingTools = useMemo(() => ALL_TOOLS.filter((t) => t.isTrending).slice(0, 4), []);
  const newTools = useMemo(() => ALL_TOOLS.filter((t) => t.isNew).slice(0, 4), []);
  const isDefaultView = selectedCategory === 'All' && selectedPricing === 'All' && !searchQuery;

  return (
    <div className="min-h-screen bg-[#030305] text-white">
      <Header />

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
            Hand-picked, tested, and compared — {ALL_TOOLS.length}+ AI tools for YouTubers, video editors, and content creators in 2026.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-xl mx-auto mb-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder='Try "free voice cloning" or "caption generator for Shorts"…'
                className="w-full rounded-2xl border border-white/10 bg-zinc-900/80 py-4 pl-12 pr-4 text-sm text-white placeholder-zinc-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 backdrop-blur-xl"
                aria-label="Search AI tools"
              />
              {searchInput && (
                <button
                  onClick={() => setSearchInput('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Search suggestions */}
          {!searchInput && (
            <div className="flex flex-wrap justify-center gap-1.5 mb-6">
              {SEARCH_SUGGESTIONS.slice(0, 5).map((s) => (
                <button
                  key={s}
                  onClick={() => setSearchInput(s)}
                  className="rounded-full bg-zinc-900/60 border border-white/5 px-3 py-1 text-[10px] text-zinc-500 hover:text-purple-300 hover:border-purple-500/30 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Quick Category Pills */}
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {CATEGORIES.slice(0, 7).map((cat) => (
              <button
                key={cat}
                onClick={() => { setSelectedCategory(cat as Category); setVisibleCount(VISIBLE_STEP); }}
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
              <SlidersHorizontal className="h-3 w-3" /> More Filters
            </button>
          </div>

          {showFilters && (
            <div className="flex flex-wrap justify-center gap-2">
              {CATEGORIES.slice(7).map((cat) => (
                <button
                  key={cat}
                  onClick={() => { setSelectedCategory(cat as Category); setVisibleCount(VISIBLE_STEP); }}
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
                  onClick={() => { setSelectedPricing(p as PricingOption); setVisibleCount(VISIBLE_STEP); }}
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

          {/* Trust strip */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] text-zinc-500">
            <span className="inline-flex items-center gap-1.5"><FlaskConical className="h-3.5 w-3.5 text-purple-400" /> Independently tested</span>
            <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Reviewed Aug 2026</span>
            <span className="inline-flex items-center gap-1.5"><BadgeDollarSign className="h-3.5 w-3.5 text-amber-400" /> Pricing verified</span>
            <Link href="/about" className="underline hover:text-zinc-300">Our methodology →</Link>
          </div>
        </div>
      </section>

      {isDefaultView && (
        <>
          {/* Featured */}
          <section className="px-4 pb-12">
            <div className="mx-auto max-w-7xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-amber-400" />
                  <div>
                    <h2 className="text-xl font-bold text-white">Featured AI Tools</h2>
                    <p className="text-xs text-zinc-500 mt-0.5">Hand-selected by our editorial team after hands-on testing</p>
                  </div>
                </div>
                <Link href="/tools" className="text-xs font-semibold text-purple-400 hover:text-purple-300">View All →</Link>
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {featuredTools.map((tool, i) => <ToolCard key={tool.slug} tool={tool} index={i} />)}
              </div>
            </div>
          </section>

          {/* Trending */}
          <section className="px-4 pb-12">
            <div className="mx-auto max-w-7xl">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-rose-400" /> Trending Now
              </h2>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {trendingTools.map((tool, i) => <ToolCard key={tool.slug} tool={tool} index={i} />)}
              </div>
            </div>
          </section>

          {/* New */}
          <section className="px-4 pb-12">
            <div className="mx-auto max-w-7xl">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-emerald-400" /> Recently Added
              </h2>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {newTools.map((tool, i) => <ToolCard key={tool.slug} tool={tool} index={i} />)}
              </div>
            </div>
          </section>

          {/* Guides strip */}
          <section className="px-4 pb-12">
            <div className="mx-auto max-w-7xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-400" /> Latest Guides & Comparisons
                </h2>
                <Link href="/blog" className="text-xs font-semibold text-purple-400 hover:text-purple-300">All Articles →</Link>
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {BLOG_POSTS.slice(0, 3).map((post) => (
                  <Link
                    key={post.slug}
                    href={`/blog/${post.slug}`}
                    className="group rounded-2xl border border-white/10 bg-zinc-900/40 overflow-hidden hover:border-purple-500/30 transition-colors"
                  >
                    <div className="h-36 overflow-hidden">
                      <img src={post.coverImage} alt={post.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    </div>
                    <div className="p-4">
                      <span className="text-[10px] font-bold text-purple-400">{post.category}</span>
                      <h3 className="mt-1 text-sm font-bold text-white line-clamp-2 group-hover:text-purple-200 transition-colors">{post.title}</h3>
                      <p className="mt-1.5 text-[11px] text-zinc-500">{post.date} · {post.readTime}</p>
                    </div>
                  </Link>
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
                Explore 2026&apos;s highest-rated AI tools across {CATEGORIES.length - 1} categories
              </p>
            </div>
            <span className="text-sm font-semibold text-zinc-400">
              <span className="text-white">{filteredTools.length}</span> {filteredTools.length === 1 ? 'tool' : 'tools'} found
            </span>
          </div>

          {filteredTools.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredTools.slice(0, visibleCount).map((tool, i) => <ToolCard key={tool.slug} tool={tool} index={i} />)}
              </div>
              {filteredTools.length > visibleCount && (
                <div className="mt-8 text-center">
                  <button
                    onClick={() => setVisibleCount((c) => c + VISIBLE_STEP)}
                    className="rounded-xl border border-purple-500/30 bg-purple-500/10 px-6 py-3 text-sm font-bold text-purple-300 hover:bg-purple-500/20 transition-colors"
                  >
                    Load More ({filteredTools.length - visibleCount} remaining)
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-lg font-bold text-white mb-2">No tools found</h3>
              <p className="text-sm text-zinc-500 max-w-md">
                Try adjusting your search query or filters. We have {ALL_TOOLS.length} curated tools across {CATEGORIES.length - 1} categories.
              </p>
              <button
                onClick={() => { setSearchInput(''); setSelectedCategory('All'); setSelectedPricing('All'); }}
                className="mt-4 rounded-xl bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-500 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter — honest copy, functional form */}
      <section className="border-t border-white/5 bg-zinc-900/30 px-4 py-16">
        <div className="mx-auto max-w-xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-[10px] font-bold text-emerald-300 mb-3">
            <Sparkles className="h-3 w-3" /> FOUNDING MEMBER ACCESS
          </span>
          <h2 className="text-2xl font-bold text-white mb-2">Be One of Our First 500 Creators</h2>
          <p className="text-sm text-zinc-400 mb-6">
            We just launched. Join early and get weekly hands-on AI tool reviews, prompt kits, and exclusive deals — plus a permanent founding-member badge when accounts go live. No spam, unsubscribe anytime.
          </p>
          <NewsletterForm />
        </div>
      </section>

      <CompareBar />
      <Footer />
    </div>
  );
}
