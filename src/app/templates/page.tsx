"use client";

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { CREATOR_TEMPLATES, CreatorTemplate } from '@/data/templates';
import { Sparkles, Star, ExternalLink, Download, ShoppingBag, Check } from 'lucide-react';

export default function TemplatesMarketplacePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Notion OS', 'AI Prompts', 'Google Sheets'];

  const filtered = selectedCategory === 'All'
    ? CREATOR_TEMPLATES
    : CREATOR_TEMPLATES.filter((t) => t.category === selectedCategory);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      <div>
        <Header onOpenSubmitModal={() => {}} searchQuery="" onSearchChange={() => {}} />

        {/* Hero */}
        <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-white/10 text-center">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-xs font-bold text-purple-400">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Zero Marginal Cost Creator Assets</span>
            </div>
            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
              Creator <span className="text-cinematic-neon">Notion &amp; AI Templates</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm text-zinc-400 sm:text-lg">
              Production systems, Midjourney prompt kits, and profit calculators designed to automate your channel.
            </p>

            {/* Category Pills */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-full px-5 py-2 text-xs font-extrabold transition-all ${
                    selectedCategory === cat
                      ? 'theme-btn-primary text-white shadow-lg'
                      : 'bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Grid */}
        <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-2">
            {filtered.map((template) => (
              <div
                key={template.id}
                className="cinematic-card group flex flex-col justify-between rounded-3xl overflow-hidden p-6 border border-white/10"
              >
                <div>
                  <div className="relative overflow-hidden rounded-2xl h-52 w-full bg-zinc-950 mb-6">
                    <img
                      src={template.coverImage}
                      alt={template.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3 rounded-full bg-purple-600 px-3 py-1 text-xs font-bold text-white shadow">
                      {template.category}
                    </div>
                    <div className="absolute top-3 right-3 rounded-full bg-zinc-900/90 border border-white/10 px-3 py-1 text-xs font-extrabold text-emerald-400 backdrop-blur-md">
                      {template.price}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-extrabold text-white group-hover:text-purple-400 transition-colors">
                      {template.title}
                    </h2>
                  </div>
                  <p className="mt-1 text-sm font-bold text-purple-400">{template.tagline}</p>
                  <p className="mt-2 text-xs leading-relaxed text-zinc-400">{template.description}</p>

                  <div className="mt-6 space-y-2 border-t border-white/5 pt-4">
                    <span className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                      Included in this Template:
                    </span>
                    <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                      {template.features.map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-zinc-300">
                          <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-4">
                  <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="font-bold text-white">{template.rating}</span>
                    <span>• {template.salesCount}</span>
                  </div>

                  <a
                    href={template.buyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3.5 text-xs font-extrabold text-white shadow-lg hover:from-purple-500 hover:to-indigo-500"
                  >
                    {template.isFree ? <Download className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
                    <span>{template.isFree ? 'Download Free' : `Buy Template (${template.price})`}</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      <footer className="mt-24 border-t border-white/10 bg-zinc-950 py-12 text-center text-xs text-zinc-500">
        <p>© 2026 CreatorAI Hub Templates &amp; Notion OS Shop. Zero marginal cost assets.</p>
      </footer>
    </div>
  );
}
