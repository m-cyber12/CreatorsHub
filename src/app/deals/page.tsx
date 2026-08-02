"use client";

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { INITIAL_TOOLS, Tool } from '@/data/tools';
import { Sparkles, Tag, Clock, ExternalLink, Star, Award, Zap } from 'lucide-react';
import Link from 'next/link';

export default function CreatorDealsPage() {
  const [selectedType, setSelectedType] = useState<string>('All');

  // Filter tools with free trials, freemium discounts, or lifetime one-time deals
  const dealTools = INITIAL_TOOLS.filter(
    (t) =>
      t.pricing === 'Free Trial' ||
      t.pricing === 'Freemium' ||
      (t.startingPrice && t.startingPrice.includes('One-time'))
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      <div>
        <Header onOpenSubmitModal={() => {}} searchQuery="" onSearchChange={() => {}} />

        {/* Hero */}
        <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-white/10 text-center">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-xs font-bold text-purple-400">
              <Tag className="h-3.5 w-3.5" />
              <span>Creator Deals &amp; Exclusive Trials — Idea #5 from Blueprint v5.0</span>
            </div>
            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
              AI Tool <span className="text-cinematic-neon">Deals &amp; Free Trials</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm text-zinc-400 sm:text-lg">
              Test world-class video AI software for free before subscribing. Verified creator discounts and lifetime deals.
            </p>
          </div>
        </section>

        {/* Deals Grid */}
        <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {dealTools.map((tool) => (
              <div
                key={tool.id}
                className="cinematic-card flex flex-col justify-between rounded-3xl p-6 border border-white/10"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-3 py-1 text-xs font-extrabold text-emerald-400">
                      {tool.pricing === 'Free Trial'
                        ? '🎁 14-Day Free Trial'
                        : tool.startingPrice?.includes('One-time')
                        ? '🔥 Lifetime Deal'
                        : '⚡ Free Tier Available'}
                    </span>
                    <span className="text-xs font-bold text-amber-400">★ {tool.rating}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <img
                      src={tool.logo}
                      alt={tool.name}
                      className="h-12 w-12 rounded-2xl object-cover bg-zinc-950 p-1.5 border border-white/10"
                    />
                    <div>
                      <h3 className="text-base font-extrabold text-white">{tool.name}</h3>
                      <p className="text-xs text-purple-400 font-bold">{tool.category}</p>
                    </div>
                  </div>

                  <p className="mt-4 text-xs leading-relaxed text-zinc-300">
                    {tool.description}
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                  <Link
                    href={`/tool/${tool.slug}`}
                    className="text-xs font-bold text-zinc-400 hover:text-white"
                  >
                    Details ➔
                  </Link>

                  <a
                    href={tool.affiliateUrl || tool.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-2.5 text-xs font-extrabold text-white shadow-lg hover:scale-105 transition-all"
                  >
                    <span>Claim Deal / Try Free</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      <footer className="mt-24 border-t border-white/10 bg-zinc-950 py-12 text-center text-xs text-zinc-500">
        <p>© 2026 CreatorAI Hub. Creator Deals &amp; Free Trials.</p>
      </footer>
    </div>
  );
}
