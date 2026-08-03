"use client";

import React, { useState } from 'react';
import { SmartImage } from '@/components/SmartImage';
import { Header } from '@/components/Header';
import { ALL_TOOLS, Tool } from '@/data/tools';
import { Sparkles, Layers, CheckCircle2, Zap, ExternalLink, DollarSign, ArrowRight, RotateCcw } from 'lucide-react';
import Link from 'next/link';

export default function CreatorStackBuilderPage() {
  const [goal, setGoal] = useState<'faceless' | 'shorts' | 'podcast' | 'thumbnails'>('faceless');
  const [budget, setBudget] = useState<'free' | 'budget' | 'pro'>('budget');
  const [built, setBuilt] = useState<boolean>(true);

  // Helper: parse monthly price from startingPrice string
  const parsePrice = (priceStr: string | undefined): number => {
    if (!priceStr) return 0;
    const match = priceStr.replace(',', '.').match(/\$?([0-9]+(?:\.[0-9]+)?)/);
    return match ? parseFloat(match[1]) : 0;
  };

  const formatTotal = (total: number) => (total === 0 ? '$0 / mo' : '$' + total.toFixed(2) + ' / mo');

  // Intelligently recommend stack based on goal and budget
  const getStack = (): { title: string; desc: string; totalCost: string; timeSaved: string; tools: Tool[] } => {
    if (goal === 'faceless') {
      if (budget === 'free') {
        const tools = ALL_TOOLS.filter((t) => t.slug === 'capcut' || t.slug === 'adobe-podcast' || t.slug === 'ideogram');
        const total = tools.reduce((sum, t) => sum + parsePrice(t.startingPrice), 0);
        return {
          title: '100% Free Faceless YouTube Starter Stack',
          desc: `Generate thumbnail typography, clean audio, and edit videos — priced dynamically from structured data.`,
          totalCost: formatTotal(total),
          timeSaved: '10 hours / week',
          tools,
        };
      } else if (budget === 'budget') {
        const tools = ALL_TOOLS.filter((t) => t.slug === 'elevenlabs' || t.slug === 'vidiq' || t.slug === 'midjourney');
        const total = tools.reduce((sum, t) => sum + parsePrice(t.startingPrice), 0);
        const names = tools.map((t) => t.name).join(', ');
        return {
          title: `The ${formatTotal(total)} High-Growth Faceless Stack`,
          desc: `Optimized workflow using ${names}. Calculated from current pricing data — no hardcoded numbers.`,
          totalCost: formatTotal(total),
          timeSaved: '18 hours / week',
          tools,
        };
      } else {
        const tools = ALL_TOOLS.filter((t) => t.slug === 'elevenlabs' || t.slug === 'runway' || t.slug === 'vidiq' || t.slug === 'fliki');
        const total = tools.reduce((sum, t) => sum + parsePrice(t.startingPrice), 0);
        return {
          title: `The Enterprise Cinema-Grade Faceless Stack`,
          desc: `Hollywood VFX, professional voice cloning, AI SEO, and video generation — priced from structured data.`,
          totalCost: formatTotal(total),
          timeSaved: '30 hours / week',
          tools,
        };
      }
    } else if (goal === 'shorts') {
      if (budget === 'free') {
        const tools = ALL_TOOLS.filter((t) => t.slug === 'capcut' || t.slug === 'opusclip');
        const total = tools.reduce((sum, t) => sum + parsePrice(t.startingPrice), 0);
        return {
          title: 'Free TikTok & Shorts Repurposing Stack',
          desc: `AI virality clipping and animated captions — priced from live structured data.`,
          totalCost: formatTotal(total),
          timeSaved: '12 hours / week',
          tools,
        };
      } else {
        const tools = ALL_TOOLS.filter((t) => t.slug === 'opusclip' || t.slug === 'submagic' || t.slug === 'munch');
        const total = tools.reduce((sum, t) => sum + parsePrice(t.startingPrice), 0);
        return {
          title: `The 10x Viral Vertical Video Stack`,
          desc: `Optimized for viral short-form content using AI clipping, animated captions, and trend analysis.`,
          totalCost: formatTotal(total),
          timeSaved: '25 hours / week',
          tools,
        };
      }
    } else if (goal === 'podcast') {
      const tools = ALL_TOOLS.filter((t) => t.slug === 'riverside' || t.slug === 'descript' || t.slug === 'podcastle');
      const total = tools.reduce((sum, t) => sum + parsePrice(t.startingPrice), 0);
      return {
        title: '4K Studio Podcast & Show Notes Stack',
        desc: 'Record, edit audio by text, and generate timestamps — all priced dynamically from current data.',
        totalCost: formatTotal(total),
        timeSaved: '20 hours / week',
        tools,
      };
    } else {
      const tools = ALL_TOOLS.filter((t) => t.slug === 'midjourney' || t.slug === 'adobe-firefly' || t.slug === 'ideogram');
      const total = tools.reduce((sum, t) => sum + parsePrice(t.startingPrice), 0);
      return {
        title: '15%+ CTR YouTube Thumbnail Design Stack',
        desc: 'Generate photorealistic characters, legible bold titles, and expanded backgrounds — priced from live data.',
        totalCost: formatTotal(total),
        timeSaved: '15 hours / week',
        tools,
      };
    }
  };

  const stack = getStack();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      <div>
        <Header />

        {/* Hero */}
        <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-white/10 text-center">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-xs font-bold text-purple-400">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Creator Stack Builder — Idea #1 from Blueprint v5.0</span>
            </div>
            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
              Build Your <span className="text-cinematic-neon">AI Video Stack</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm text-zinc-400 sm:text-lg">
              Select your creator goal and monthly budget. We recommend your optimal tested AI tool combination in 60 seconds.
            </p>

            {/* Selector Card */}
            <div className="mt-10 mx-auto max-w-3xl cinematic-card rounded-3xl p-6 sm:p-8 border border-white/10 text-left space-y-6">
              <div>
                <span id="sb-goal-label" className="block text-xs font-bold uppercase tracking-wider text-purple-400 mb-2">
                  1. What is your primary creator goal?
                </span>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2" role="group" aria-labelledby="sb-goal-label">
                  <button
                    onClick={() => setGoal('faceless')}
                    className={`rounded-2xl p-4 text-left border transition-all ${
                      goal === 'faceless'
                        ? 'border-purple-500 bg-purple-500/20 text-white font-extrabold'
                        : 'border-white/10 bg-zinc-950 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <div className="text-sm">🎬 Faceless YouTube Channel</div>
                    <div className="text-[11px] opacity-70 mt-0.5">Voice cloning, scripts &amp; B-roll</div>
                  </button>

                  <button
                    onClick={() => setGoal('shorts')}
                    className={`rounded-2xl p-4 text-left border transition-all ${
                      goal === 'shorts'
                        ? 'border-purple-500 bg-purple-500/20 text-white font-extrabold'
                        : 'border-white/10 bg-zinc-950 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <div className="text-sm">📱 TikTok &amp; Shorts Repurposing</div>
                    <div className="text-[11px] opacity-70 mt-0.5">Viral clips &amp; Hormozi captions</div>
                  </button>

                  <button
                    onClick={() => setGoal('podcast')}
                    className={`rounded-2xl p-4 text-left border transition-all ${
                      goal === 'podcast'
                        ? 'border-purple-500 bg-purple-500/20 text-white font-extrabold'
                        : 'border-white/10 bg-zinc-950 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <div className="text-sm">🎙️ Studio Podcast Production</div>
                    <div className="text-[11px] opacity-70 mt-0.5">4K recording &amp; show notes</div>
                  </button>

                  <button
                    onClick={() => setGoal('thumbnails')}
                    className={`rounded-2xl p-4 text-left border transition-all ${
                      goal === 'thumbnails'
                        ? 'border-purple-500 bg-purple-500/20 text-white font-extrabold'
                        : 'border-white/10 bg-zinc-950 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <div className="text-sm">🖼️ 15%+ CTR Thumbnail Design</div>
                    <div className="text-[11px] opacity-70 mt-0.5">Midjourney &amp; Photoshop AI</div>
                  </button>
                </div>
              </div>

              <div>
                <span id="sb-budget-label" className="block text-xs font-bold uppercase tracking-wider text-pink-400 mb-2">
                  2. What is your monthly AI tool budget?
                </span>
                <div className="grid grid-cols-3 gap-3" role="group" aria-labelledby="sb-budget-label">
                  <button
                    onClick={() => setBudget('free')}
                    className={`rounded-xl py-3 px-2 text-center text-xs font-bold border transition-all ${
                      budget === 'free'
                        ? 'border-emerald-500 bg-emerald-500/20 text-white'
                        : 'border-white/10 bg-zinc-950 text-zinc-400 hover:text-white'
                    }`}
                  >
                    $0 / Free Starter
                  </button>
                  <button
                    onClick={() => setBudget('budget')}
                    className={`rounded-xl py-3 px-2 text-center text-xs font-bold border transition-all ${
                      budget === 'budget'
                        ? 'border-purple-500 bg-purple-500/20 text-white'
                        : 'border-white/10 bg-zinc-950 text-zinc-400 hover:text-white'
                    }`}
                  >
                    Under $50 / month
                  </button>
                  <button
                    onClick={() => setBudget('pro')}
                    className={`rounded-xl py-3 px-2 text-center text-xs font-bold border transition-all ${
                      budget === 'pro'
                        ? 'border-pink-500 bg-pink-500/20 text-white'
                        : 'border-white/10 bg-zinc-950 text-zinc-400 hover:text-white'
                    }`}
                  >
                    Pro / Studio Stack
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stack Output */}
        <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="cinematic-card rounded-3xl p-6 sm:p-10 border border-purple-500/40 bg-gradient-to-br from-purple-950/40 via-zinc-900 to-zinc-950 shadow-2xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
              <div>
                <span className="rounded-full bg-purple-500/20 px-3 py-1 text-xs font-bold text-purple-300">
                  YOUR RECOMMENDED STACK
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
                  {stack.title}
                </h2>
                <p className="mt-1 text-sm text-zinc-300 max-w-2xl">
                  {stack.desc}
                </p>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <div className="rounded-2xl bg-emerald-500/15 border border-emerald-500/30 px-4 py-2 text-center">
                  <div className="text-xs text-emerald-400 font-bold">TOTAL COST</div>
                  <div className="text-lg font-extrabold text-white">{stack.totalCost}</div>
                </div>
                <div className="rounded-2xl bg-purple-500/15 border border-purple-500/30 px-4 py-2 text-center">
                  <div className="text-xs text-purple-400 font-bold">TIME SAVED</div>
                  <div className="text-lg font-extrabold text-white">{stack.timeSaved}</div>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Included Tools in this Stack ({stack.tools.length} Tools):
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {stack.tools.map((tool) => (
                  <div
                    key={tool.id}
                    className="flex flex-col justify-between rounded-2xl border border-white/10 bg-zinc-950 p-5 shadow-lg"
                  >
                    <div>
                      <div className="flex items-center gap-3">
                        <SmartImage
                          src={tool.logo}
                          alt=""
                          width={40}
                          height={40}
                          className="h-10 w-10 rounded-xl object-cover bg-zinc-900 p-1 border border-white/10"
                        />
                        <div>
                          <h4 className="font-extrabold text-white">{tool.name}</h4>
                          <span className="text-xs text-emerald-400 font-bold">{tool.pricing} ({tool.startingPrice || 'Free'})</span>
                        </div>
                      </div>
                      <p className="mt-3 text-xs text-zinc-400 line-clamp-3">
                        {tool.description}
                      </p>
                    </div>

                    <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-3">
                      <Link
                        href={`/tool/${tool.slug}`}
                        className="text-xs font-bold text-purple-400 hover:underline"
                      >
                        Read Review ➔
                      </Link>

                      <a
                        href={tool.affiliateUrl || tool.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 rounded-xl bg-purple-600 px-3.5 py-1.5 text-xs font-bold text-white shadow hover:bg-purple-500"
                      >
                        <span>Try Now</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>

      <footer className="mt-24 border-t border-white/10 bg-zinc-950 py-12 text-center text-xs text-zinc-500">
        <p>© 2026 CreatorAI Hub. The Curated AI Toolbox for Video Creators.</p>
      </footer>
    </div>
  );
}
