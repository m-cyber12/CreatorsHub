"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { INITIAL_TOOLS, CATEGORIES, Category, Tool } from '@/data/tools';
import { Header } from '@/components/Header';
import { ToolCard } from '@/components/ToolCard';
import { SubmitModal } from '@/components/SubmitModal';
import { Hero3D } from '@/components/Hero3D';
import { ScrollMarquee } from '@/components/ScrollMarquee';
import { AIChatAssistant } from '@/components/AIChatAssistant';
import { Award, TrendingUp, Filter } from 'lucide-react';

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [selectedPricing, setSelectedPricing] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState<boolean>(false);

  const [settings, setSettings] = useState<Record<string, string>>({
    theme_accent: 'purple',
    grid_layout: 'grid-3',
    tool_sort_by: 'featured',
    card_style: '3d-glass',
    hero_animation: 'enabled',
    footer_copyright: '© 2026 CreatorAI Hub. Built for solo founders.',
  });

  const [dbTools, setDbTools] = useState<Tool[]>(INITIAL_TOOLS);

  useEffect(() => {
    fetch(`/api/settings?t=${Date.now()}`, { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : {}))
      .then((data: Record<string, string>) => {
        if (data && Object.keys(data).length > 0) {
          setSettings((prev) => ({
            ...prev,
            ...data,
          }));
        }
      })
      .catch(() => {});

    fetch(`/api/tools?t=${Date.now()}`, { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setDbTools(data);
        }
      })
      .catch(() => {});
  }, []);

  const filteredTools = useMemo(() => {
    let list = dbTools.filter((tool) => {
      const matchesCategory =
        selectedCategory === 'All' || tool.category === selectedCategory;
      const matchesPricing =
        selectedPricing === 'All' || tool.pricing === selectedPricing;
      const matchesSearch =
        searchQuery === '' ||
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (Array.isArray(tool.tags) &&
          tool.tags.some((tag) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase())
          ));

      return matchesCategory && matchesPricing && matchesSearch;
    });

    const sortBy = settings.tool_sort_by || 'featured';
    if (sortBy === 'rating') {
      list = [...list].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'reviews') {
      list = [...list].sort((a, b) => (b.reviewsCount || 0) - (a.reviewsCount || 0));
    } else if (sortBy === 'newest') {
      list = [...list].reverse();
    } else if (sortBy === 'featured') {
      list = [...list].sort((a, b) => {
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        return (b.rating || 0) - (a.rating || 0);
      });
    }

    return list;
  }, [dbTools, selectedCategory, selectedPricing, searchQuery, settings.tool_sort_by]);

  const featuredTools = useMemo(
    () => dbTools.filter((t) => t.isFeatured),
    [dbTools]
  );

  const getGridClass = () => {
    switch (settings.grid_layout) {
      case 'grid-1':
        return 'grid grid-cols-1 gap-6';
      case 'grid-2':
        return 'grid grid-cols-1 sm:grid-cols-2 gap-6';
      default:
        return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6';
    }
  };

  return (
    <div
      className={`min-h-screen bg-background text-foreground flex flex-col justify-between overflow-x-hidden theme-${
        settings.theme_accent || 'purple'
      }`}
    >
      <div>
        <Header
          onOpenSubmitModal={() => setIsSubmitModalOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <Hero3D onOpenSubmitModal={() => setIsSubmitModalOpen(true)} />
        <ScrollMarquee />

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
              className="theme-btn-primary shrink-0 rounded-2xl px-6 py-3.5 text-xs font-extrabold text-white shadow-lg transition-all active:scale-95"
            >
              Submit Tool Free
            </button>
          </div>
        </div>

        <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8" id="explore">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-6">
            <div className="flex flex-wrap items-center gap-2">
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`rounded-full px-5 py-2.5 text-xs font-extrabold transition-all ${
                    selectedCategory === category
                      ? 'theme-btn-primary text-white shadow-lg scale-105'
                      : 'bg-zinc-900/80 border border-white/5 text-zinc-400 hover:bg-zinc-800 hover:text-white'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

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
              <div className={getGridClass()}>
                {featuredTools.map((tool) => (
                  <ToolCard key={tool.id} tool={tool} />
                ))}
              </div>
            </section>
          )}

          <section className="mt-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight text-white">
                  {selectedCategory === 'All'
                    ? 'All AI Tools'
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
              <div className={getGridClass()}>
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

      <footer className="mt-24 border-t border-white/10 bg-zinc-950/95 py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <span className="text-lg font-extrabold tracking-tight text-white">
              CreatorAI<span className="text-purple-400">Hub</span>
            </span>
            <p className="mt-1 text-xs text-zinc-500">
              {settings.footer_copyright || '© 2026 CreatorAI Hub. Built for solo founders.'}
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
              href="#top"
              className="hover:text-purple-400 transition-colors"
            >
              Back to Top
            </a>
          </div>
        </div>
      </footer>

      <SubmitModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
      />

      <AIChatAssistant tools={dbTools} />
    </div>
  );
}
