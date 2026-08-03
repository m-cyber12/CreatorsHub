"use client";

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ToolCard } from '@/components/ToolCard';
import { CompareBar } from '@/components/CompareBar';
import { ALL_TOOLS, CATEGORIES, PRICING_OPTIONS, type Category, type PricingOption } from '@/data/tools';
import { searchToolsAdvanced } from '@/lib/search';
import { Search, X, Grid3X3, List } from 'lucide-react';

type SortKey = 'rating' | 'newest' | 'price-low' | 'price-high' | 'name';
const PAGE_SIZE = 24;

function priceValue(s?: string): number {
  if (!s) return 0;
  const m = s.match(/[\d.]+/);
  return m ? parseFloat(m[0]) : 0;
}

export function ToolsClient() {
  const router = useRouter();
  const params = useSearchParams();

  const [searchInput, setSearchInput] = useState(params.get('q') || '');
  const [searchQuery, setSearchQuery] = useState(params.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState<Category>(
    (CATEGORIES as readonly string[]).includes(params.get('category') || '') ? (params.get('category') as Category) : 'All'
  );
  const [selectedPricing, setSelectedPricing] = useState<PricingOption>(
    (PRICING_OPTIONS as readonly string[]).includes(params.get('pricing') || '') ? (params.get('pricing') as PricingOption) : 'All'
  );
  const [sortBy, setSortBy] = useState<SortKey>((params.get('sort') as SortKey) || 'rating');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // debounce search input
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { setSearchQuery(searchInput); setVisibleCount(PAGE_SIZE); }, 200);
    return () => clearTimeout(debounceRef.current);
  }, [searchInput]);

  // keep URL shareable
  const syncUrl = useCallback((q: string, cat: string, pricing: string, sort: string) => {
    const sp = new URLSearchParams();
    if (q) sp.set('q', q);
    if (cat !== 'All') sp.set('category', cat);
    if (pricing !== 'All') sp.set('pricing', pricing);
    if (sort !== 'rating') sp.set('sort', sort);
    router.replace(`/tools${sp.toString() ? `?${sp.toString()}` : ''}`, { scroll: false });
  }, [router]);

  useEffect(() => {
    syncUrl(searchQuery, selectedCategory, selectedPricing, sortBy);
  }, [searchQuery, selectedCategory, selectedPricing, sortBy, syncUrl]);

  const filteredTools = useMemo(() => {
    let result = ALL_TOOLS;
    if (selectedCategory !== 'All') result = result.filter((t) => t.category === selectedCategory);
    if (selectedPricing !== 'All') result = result.filter((t) => t.pricing === selectedPricing);
    if (searchQuery.trim()) result = searchToolsAdvanced(searchQuery, result, 300);
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'rating': return b.rating - a.rating;
        case 'newest': return (b.launchDate || '').localeCompare(a.launchDate || '');
        case 'price-low': return priceValue(a.startingPrice) - priceValue(b.startingPrice);
        case 'price-high': return priceValue(b.startingPrice) - priceValue(a.startingPrice);
        case 'name': return a.name.localeCompare(b.name);
        default: return 0;
      }
    });
    return result;
  }, [searchQuery, selectedCategory, selectedPricing, sortBy]);

  const activeFilters = [
    selectedCategory !== 'All' && { label: selectedCategory, clear: () => setSelectedCategory('All') },
    selectedPricing !== 'All' && { label: selectedPricing, clear: () => setSelectedPricing('All') },
    !!searchQuery && { label: `"${searchQuery}"`, clear: () => setSearchInput('') },
  ].filter(Boolean) as { label: string; clear: () => void }[];

  return (
    <div className="min-h-screen bg-[#030305] text-white">
      <Header />
      <div className="px-4 pt-8 pb-20">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-3xl font-bold mb-2">All AI Tools</h1>
          <p className="text-sm text-zinc-500 mb-8">
            Browse {ALL_TOOLS.length}+ curated AI tools for video creators — independently reviewed, pricing verified August 2026.
          </p>

          <div className="flex flex-wrap items-center gap-3 mb-4 p-4 rounded-2xl bg-zinc-900/50 border border-white/5">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search tools, tags, use cases…"
                className="w-full rounded-xl border border-white/10 bg-zinc-900 py-2.5 pl-9 pr-4 text-sm text-white placeholder-zinc-500 focus:border-purple-500 focus:outline-none"
                aria-label="Search tools"
              />
              {searchInput && (
                <button onClick={() => setSearchInput('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white" aria-label="Clear search">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value as Category); setVisibleCount(PAGE_SIZE); }}
              className="rounded-xl border border-white/10 bg-zinc-900 px-3 py-2.5 text-sm text-white focus:border-purple-500 focus:outline-none"
              aria-label="Filter by category"
            >
              {CATEGORIES.map((c) => <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>)}
            </select>
            <select
              value={selectedPricing}
              onChange={(e) => { setSelectedPricing(e.target.value as PricingOption); setVisibleCount(PAGE_SIZE); }}
              className="rounded-xl border border-white/10 bg-zinc-900 px-3 py-2.5 text-sm text-white focus:border-purple-500 focus:outline-none"
              aria-label="Filter by pricing"
            >
              {PRICING_OPTIONS.map((p) => <option key={p} value={p}>{p === 'All' ? 'All Pricing' : p}</option>)}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortKey)}
              className="rounded-xl border border-white/10 bg-zinc-900 px-3 py-2.5 text-sm text-white focus:border-purple-500 focus:outline-none"
              aria-label="Sort tools"
            >
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name A–Z</option>
            </select>
            <div className="flex items-center gap-1 ml-auto">
              <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-purple-600 text-white' : 'text-zinc-500 hover:text-white'}`} aria-label="Grid view">
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-purple-600 text-white' : 'text-zinc-500 hover:text-white'}`} aria-label="List view">
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Active filter chips */}
          {activeFilters.length > 0 && (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold text-zinc-500">Active filters:</span>
              {activeFilters.map((f) => (
                <button
                  key={f.label}
                  onClick={f.clear}
                  className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/15 border border-purple-500/30 px-3 py-1 text-[11px] font-semibold text-purple-200 hover:bg-purple-500/25 transition-colors"
                >
                  {f.label} <X className="h-3 w-3" />
                </button>
              ))}
            </div>
          )}

          <p className="text-sm text-zinc-500 mb-4">
            Showing <span className="text-white font-semibold">{Math.min(visibleCount, filteredTools.length)}</span> of{' '}
            <span className="text-white font-semibold">{filteredTools.length}</span> tools
          </p>

          {filteredTools.length > 0 ? (
            <>
              <div className={`grid gap-5 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1 max-w-3xl'}`}>
                {filteredTools.slice(0, visibleCount).map((tool, i) => <ToolCard key={tool.slug} tool={tool} index={i} />)}
              </div>
              {filteredTools.length > visibleCount && (
                <div className="mt-8 text-center">
                  <button
                    onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                    className="rounded-xl border border-purple-500/30 bg-purple-500/10 px-6 py-3 text-sm font-bold text-purple-300 hover:bg-purple-500/20 transition-colors"
                  >
                    Load More ({filteredTools.length - visibleCount} remaining)
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-lg font-bold text-white mb-2">No tools found</h3>
              <p className="text-sm text-zinc-500">Try different keywords — our search understands typos and synonyms.</p>
              <button
                onClick={() => { setSearchInput(''); setSelectedCategory('All'); setSelectedPricing('All'); }}
                className="mt-4 rounded-xl bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-500"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </div>
      <CompareBar />
      <Footer />
    </div>
  );
}
