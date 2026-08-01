"use client";

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { CustomSelect } from '@/components/CustomSelect';
import { INITIAL_TOOLS, Tool } from '@/data/tools';
import { Sparkles, Star, ExternalLink } from 'lucide-react';

export default function ComparePage() {
  const [toolA, setToolA] = useState<Tool>(INITIAL_TOOLS[0]); // OpusClip
  const [toolB, setToolB] = useState<Tool>(INITIAL_TOOLS[4]); // Submagic

  const options = INITIAL_TOOLS.map((t) => ({
    value: t.slug,
    label: t.name,
    category: t.category,
  }));

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      <div>
        <Header onOpenSubmitModal={() => {}} searchQuery="" onSearchChange={() => {}} />

        <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-white/10 text-center">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-xs font-bold text-purple-400">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Side-by-Side Comparison Engine</span>
            </div>
            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
              AI Tools <span className="text-cinematic-neon">Head-to-Head</span>
            </h1>

            <div className="mt-10 mx-auto max-w-3xl grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="rounded-2xl border border-purple-500/30 bg-zinc-900/60 p-5 backdrop-blur-xl">
                <CustomSelect
                  label="Select First Tool (A)"
                  options={options}
                  value={toolA.slug}
                  onChange={(val) => {
                    const found = INITIAL_TOOLS.find((t) => t.slug === val);
                    if (found) setToolA(found);
                  }}
                  iconColor="text-purple-400"
                />
              </div>

              <div className="rounded-2xl border border-pink-500/30 bg-zinc-900/60 p-5 backdrop-blur-xl">
                <CustomSelect
                  label="Select Second Tool (B)"
                  options={options}
                  value={toolB.slug}
                  onChange={(val) => {
                    const found = INITIAL_TOOLS.find((t) => t.slug === val);
                    if (found) setToolB(found);
                  }}
                  iconColor="text-pink-400"
                />
              </div>
            </div>
          </div>
        </section>

        <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-white/10 bg-zinc-900 overflow-hidden shadow-2xl">
            <div className="grid grid-cols-3 border-b border-white/10 bg-zinc-950/60 p-6 text-center text-xs sm:text-sm font-extrabold">
              <div className="text-left text-zinc-400">Feature / Spec</div>
              <div className="text-purple-400">{toolA.name}</div>
              <div className="text-pink-400">{toolB.name}</div>
            </div>

            <div className="divide-y divide-white/5 text-xs sm:text-sm">
              <div className="grid grid-cols-3 p-5 items-center">
                <span className="font-bold text-zinc-400">Category</span>
                <span className="text-center font-semibold text-white">{toolA.category}</span>
                <span className="text-center font-semibold text-white">{toolB.category}</span>
              </div>

              <div className="grid grid-cols-3 p-5 items-center">
                <span className="font-bold text-zinc-400">Pricing Model</span>
                <span className="text-center font-bold text-emerald-400">{toolA.pricing} ({toolA.startingPrice || 'Free'})</span>
                <span className="text-center font-bold text-emerald-400">{toolB.pricing} ({toolB.startingPrice || 'Free'})</span>
              </div>

              <div className="grid grid-cols-3 p-5 items-center">
                <span className="font-bold text-zinc-400">Creator Rating</span>
                <div className="flex items-center justify-center gap-1">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="font-extrabold text-white">{toolA.rating}</span>
                </div>
                <div className="flex items-center justify-center gap-1">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="font-extrabold text-white">{toolB.rating}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 p-6 items-center bg-zinc-950/40">
                <span className="font-extrabold text-white">Direct Link</span>
                <div className="text-center">
                  <a href={toolA.affiliateUrl || toolA.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg hover:bg-purple-500">
                    <span>Try {toolA.name}</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
                <div className="text-center">
                  <a href={toolB.affiliateUrl || toolB.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-xl bg-pink-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg hover:bg-pink-500">
                    <span>Try {toolB.name}</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <footer className="mt-24 border-t border-white/10 bg-zinc-950 py-12 text-center text-xs text-zinc-500">
        <p>© 2026 CreatorAI Hub Tools Comparison Engine. Built for solo founders.</p>
      </footer>
    </div>
  );
}
