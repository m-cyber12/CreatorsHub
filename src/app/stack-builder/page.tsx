"use client";

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { INITIAL_TOOLS, Tool } from '@/data/tools';
import { Sparkles, Layers, CheckCircle2, Zap, ExternalLink, DollarSign, ArrowRight, RotateCcw } from 'lucide-react';
import Link from 'next/link';

export default function CreatorStackBuilderPage() {
  const [goal, setGoal] = useState<'faceless' | 'shorts' | 'podcast' | 'thumbnails'>('faceless');
  const [budget, setBudget] = useState<'free' | 'budget' | 'pro'>('budget');
  const [built, setBuilt] = useState<boolean>(true);

  // Intelligently recommend stack based on goal and budget
  const getStack = (): { title: string; desc: string; totalCost: string; timeSaved: string; tools: Tool[] } => {
    if (goal === 'faceless') {
      if (budget === 'free') {
        const tools = INITIAL_TOOLS.filter((t) => t.slug === 'capcut-ai' || t.slug === 'adobe-podcast' || t.slug === 'ideogram-ai');
        return {
          title: '100% Free Faceless YouTube Starter Stack',
          desc: 'Generate thumbnail typography with Ideogram, clean audio with Adobe Podcast, and edit full videos in CapCut—all for $0/mo.',
          totalCost: '$0 / mo',
          timeSaved: '10 hours / week',
          tools,
        };
      } else if (budget === 'budget') {
        const tools = INITIAL_TOOLS.filter((t) => t.slug === 'elevenlabs' || t.slug === 'vidiq-ai' || t.slug === 'midjourney');
        return {
          title: 'The $22/mo High-Growth Faceless Documentary Stack',
          desc: 'Clone realistic human voices with ElevenLabs ($5), predict viral topics with VidIQ ($7.50), and generate high-CTR thumbnail art with Midjourney v6 ($10).',
          totalCost: '$22.50 / mo',
          timeSaved: '18 hours / week',
          tools,
        };
      } else {
        const tools = INITIAL_TOOLS.filter((t) => t.slug === 'elevenlabs' || t.slug === 'runway-gen3' || t.slug === 'vidiq-ai' || t.slug === 'storyblocks-ai');
        return {
          title: 'The Enterprise Cinema-Grade Faceless Channel Stack',
          desc: 'Hollywood VFX from Runway Gen-3, unlimited 4K B-roll from Storyblocks, professional voice cloning from ElevenLabs, and AI SEO scripts from VidIQ.',
          totalCost: '$64 / mo',
          timeSaved: '30 hours / week',
          tools,
        };
      }
    } else if (goal === 'shorts') {
      if (budget === 'free') {
        const tools = INITIAL_TOOLS.filter((t) => t.slug === 'capcut-ai' || t.slug === 'opusclip');
        return {
          title: 'Free TikTok & Shorts Repurposing Stack',
          desc: 'Use OpusClip free trial/tier for virality clipping and CapCut PC for custom animated captions.',
          totalCost: '$0 / mo',
          timeSaved: '12 hours / week',
          tools,
        };
      } else {
        const tools = INITIAL_TOOLS.filter((t) => t.slug === 'opusclip' || t.slug === 'submagic' || t.slug === 'getmunch');
        return {
          title: 'The 10x Viral Vertical Video Automation Stack',
          desc: 'Extract top 10 clips from 1-hour podcasts with OpusClip AI and add Alex Hormozi animated subtitles with Submagic in 1 click.',
          totalCost: '$39 / mo',
          timeSaved: '25 hours / week',
          tools,
        };
      }
    } else if (goal === 'podcast') {
      const tools = INITIAL_TOOLS.filter((t) => t.slug === 'riverside-fm' || t.slug === 'descript' || t.slug === 'castmagic');
      return {
        title: '4K Studio Podcast & Show Notes Automation Stack',
        desc: 'Record uncompressed remote 4K video with Riverside.fm, edit audio by text in Descript, and generate timestamps and show notes with Castmagic.',
        totalCost: '$50 / mo',
        timeSaved: '20 hours / week',
        tools,
      };
    } else {
      const tools = INITIAL_TOOLS.filter((t) => t.slug === 'midjourney' || t.slug === 'photoshop-ai' || t.slug === 'ideogram-ai');
      return {
        title: '15%+ CTR YouTube Thumbnail Design Suite',
        desc: 'Generate photorealistic v6 characters in Midjourney, render legible bold titles with Ideogram v2, and expand backgrounds with Photoshop Generative Fill.',
        totalCost: '$40 / mo',
        timeSaved: '15 hours / week',
        tools,
      };
    }
  };

  const stack = getStack();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      <div>
        <Header onOpenSubmitModal={() => {}} searchQuery="" onSearchChange={() => {}} />

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
                <label className="block text-xs font-bold uppercase tracking-wider text-purple-400 mb-2">
                  1. What is your primary creator goal?
                </label>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
                <label className="block text-xs font-bold uppercase tracking-wider text-pink-400 mb-2">
                  2. What is your monthly AI tool budget?
                </label>
                <div className="grid grid-cols-3 gap-3">
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
                        <img
                          src={tool.logo}
                          alt={tool.name}
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
