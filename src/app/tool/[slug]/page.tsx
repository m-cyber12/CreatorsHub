"use client";

import React, { useState, useMemo } from 'react';
import { Header } from '@/components/Header';
import { ToolCard } from '@/components/ToolCard';
import { INITIAL_TOOLS, CATEGORIES, PRICING_OPTIONS, type Category, type PricingOption } from '@/data/tools';
import { Search, X, Grid3X3, List } from 'lucide-react';

export default function ToolsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [selectedPricing, setSelectedPricing] = useState<PricingOption>('All');
  const [sortBy, setSortBy] = useState<'rating' | 'newest' | 'price-low' | 'price-high'>('rating');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'rating': return b.rating - a.rating;
        case 'newest': return (b.launchDate || '').localeCompare(a.launchDate || '');
        case 'price-low': return (a.startingPrice || '').localeCompare(b.startingPrice || '');
        case 'price-high': return (b.startingPrice || '').localeCompare(a.startingPrice || '');
        default: return 0;
      }
    });
    return result;
  }, [searchQuery, selectedCategory, selectedPricing, sortBy]);

  return (
    <div className="min-h-screen bg-[#030305] text-white">
      <Header />
      <div className="px-4 pt-8 pb-20">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-3xl font-bold mb-2">All AI Tools</h1>
          <p className="text-sm text-zinc-500 mb-8">Browse all 50 curated AI tools for video creators</p>

          <div className="flex flex-wrap items-center gap-3 mb-6 p-4 rounded-2xl bg-zinc-900/50 border border-white/5">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tools..."
                className="w-full rounded-xl border border-white/10 bg-zinc-900 py-2.5 pl-9 pr-4 text-sm text-white placeholder-zinc-500 focus:border-purple-500 focus:outline-none"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as Category)}
              className="rounded-xl border border-white/10 bg-zinc-900 px-3 py-2.5 text-sm text-white focus:border-purple-500 focus:outline-none"
            >
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select
              value={selectedPricing}
              onChange={(e) => setSelectedPricing(e.target.value as PricingOption)}
              className="rounded-xl border border-white/10 bg-zinc-900 px-3 py-2.5 text-sm text-white focus:border-purple-500 focus:outline-none"
            >
              {PRICING_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="rounded-xl border border-white/10 bg-zinc-900 px-3 py-2.5 text-sm text-white focus:border-purple-500 focus:outline-none"
            >
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
            <div className="flex items-center gap-1 ml-auto">
              <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-purple-600 text-white' : 'text-zinc-500 hover:text-white'}`}>
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-purple-600 text-white' : 'text-zinc-500 hover:text-white'}`}>
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>

          <p className="text-sm text-zinc-500 mb-4">
            Showing <span className="text-white font-semibold">{filteredTools.length}</span> tools
          </p>

          {filteredTools.length > 0 ? (
            <div className={`grid gap-5 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
              {filteredTools.map((tool, i) => (
                <ToolCard key={tool.id} tool={tool} index={i} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-lg font-bold text-white mb-2">No tools found</h3>
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('All'); setSelectedPricing('All'); }}
                className="mt-4 rounded-xl bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-500"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
