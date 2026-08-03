"use client";

import React, { useState, useEffect } from 'react';
import { Sparkles, Award, ArrowRight, Compass, ChevronDown } from 'lucide-react';
import { ALL_TOOLS } from '@/data/tools';
import Link from 'next/link';

interface Hero3DProps {
  onOpenSubmitModal: () => void;
}

export const Hero3D: React.FC<Hero3DProps> = ({ onOpenSubmitModal }) => {
  const [heroSettings, setHeroSettings] = useState({
    hero_badge: 'Inspired by Bold Studio • MotionSites.ai 3D Edition',
    hero_title_main: 'THE BOLD AI STUDIO',
    hero_title_sub: 'For Video Creators & Editors',
    hero_description:
      'Cinematic 3D aesthetics, scroll-driven transforms, and hand-curated AI video editors for YouTube, Shorts & studio audio production.',
  });

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => (res.ok ? res.json() : {}))
      .then((data) => {
        if (data && Object.keys(data).length > 0) {
          setHeroSettings((prev) => ({ ...prev, ...data }));
        }
      })
      .catch(() => {});
  }, []);

  // Use real tools for dynamic hero cards to guarantee 100% consistency with the grid!
  const toolLeft = ALL_TOOLS[0]; // OpusClip
  const toolCenter = ALL_TOOLS[5]; // ElevenLabs
  const toolRight = ALL_TOOLS[18]; // Midjourney

  return (
    <section className="relative overflow-hidden pt-12 pb-24 sm:pt-20 sm:pb-36 transition-colors duration-300">
      <div className="absolute top-0 left-1/4 -z-10 h-[500px] w-[500px] rounded-full bg-purple-600/20 dark:bg-purple-600/25 blur-[160px] animate-lens pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 -z-10 h-[450px] w-[450px] rounded-full bg-pink-600/15 dark:bg-pink-600/20 blur-[170px] animate-lens pointer-events-none" style={{ animationDelay: '3s' }} />

      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(168,85,247,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(168,85,247,0.05)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,#000_70%,transparent_100%)] -z-10 pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2.5 rounded-full border border-purple-500/40 bg-purple-500/10 dark:bg-purple-950/50 px-4 py-1.5 text-xs font-bold text-purple-600 dark:text-purple-300 shadow-xl backdrop-blur-xl transition-all hover:border-purple-400 hover:scale-105 cursor-default">
            <span className="flex h-2 w-2 rounded-full bg-purple-500 dark:bg-purple-400 animate-ping" />
            <Sparkles className="h-3.5 w-3.5 text-purple-500 dark:text-purple-400" />
            <span>{heroSettings.hero_badge}</span>
          </div>

          <h1 className="mt-8 font-extrabold tracking-tight text-zinc-900 dark:text-white text-5xl sm:text-7xl lg:text-8xl max-w-6xl leading-[1.02] uppercase font-sans">
            {heroSettings.hero_title_main} <br />
            <span className="text-3xl sm:text-5xl lg:text-6xl font-bold opacity-90 tracking-normal">
              {heroSettings.hero_title_sub}
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-sm sm:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
            {heroSettings.hero_description}
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <a
              href="#explore"
              className="btn-cinematic-glow group relative flex items-center gap-2.5 rounded-2xl p-[2px] shadow-2xl transition-transform active:scale-95"
            >
              <div className="flex items-center gap-2 rounded-2xl bg-white dark:bg-zinc-950 px-7 py-4 text-sm font-extrabold text-zinc-900 dark:text-white transition-colors group-hover:bg-zinc-100 dark:group-hover:bg-zinc-900">
                <Compass className="h-4 w-4 text-purple-500 dark:text-purple-400 animate-spin" style={{ animationDuration: '6s' }} />
                <span>Explore All 50+ Tools</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1.5" />
              </div>
            </a>

            <button
              onClick={onOpenSubmitModal}
              className="flex items-center gap-2.5 rounded-2xl border border-zinc-300 dark:border-white/10 bg-white/80 dark:bg-zinc-900/80 px-7 py-4 text-sm font-bold text-zinc-800 dark:text-zinc-200 backdrop-blur-xl transition-all hover:border-purple-500/50 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <Sparkles className="h-4 w-4 text-purple-500 dark:text-purple-400" />
              <span>Submit Tool</span>
            </button>
          </div>

          {/* 3D Cinematic Perspective Stage */}
          <div className="stage-3d relative mt-16 w-full max-w-6xl">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 items-center">
              {/* Left Floating Card */}
              <Link href={`/tool/${toolLeft.slug}`} className="cinematic-card animate-float-c1 rounded-3xl p-5 text-left hidden sm:block">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-purple-500/20 px-3 py-1 text-[10px] font-extrabold text-purple-600 dark:text-purple-300">
                    VIRAL SHORTS
                  </span>
                  <span className="text-xs font-bold text-emerald-500">{toolLeft.metrics || '10x Speed'}</span>
                </div>
                <div className="mt-3.5 overflow-hidden rounded-2xl h-36 bg-zinc-950 relative group/img">
                  <img
                    src={toolLeft.coverImage}
                    alt={toolLeft.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover/img:scale-110 opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-3">
                    <span className="text-xs font-bold text-white">{toolLeft.name}</span>
                  </div>
                </div>
                <p className="mt-3 text-xs font-semibold text-zinc-800 dark:text-zinc-200">{toolLeft.tagline}</p>
                <p className="mt-1 text-[11px] text-zinc-500">
                  {toolLeft.ratingLabel || 'Editorial Score'}: ★ {toolLeft.rating}
                </p>
              </Link>

              {/* Center Hero Spotlight Card */}
              <Link href={`/tool/${toolCenter.slug}`} className="cinematic-card rounded-[32px] p-6 text-left shadow-2xl sm:-translate-y-6 border-purple-500/50 block">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-3.5 py-1 text-xs font-extrabold text-white shadow-md">
                    FEATURED STUDIO
                  </span>
                  <span className="flex items-center gap-1 text-xs font-extrabold text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                    ★ {toolCenter.rating} ({toolCenter.reviewsCount} reviews)
                  </span>
                </div>
                <div className="mt-4 overflow-hidden rounded-2xl h-52 bg-zinc-950 relative group/img border border-white/5">
                  <img
                    src={toolCenter.coverImage}
                    alt={toolCenter.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover/img:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4">
                    <span className="text-sm font-extrabold text-white">{toolCenter.name}</span>
                    <span className="text-xs text-purple-300">
                      {toolCenter.ratingLabel || 'Editorial Score'} • {toolCenter.category}
                    </span>
                  </div>
                </div>
                <h3 className="mt-4 text-base font-extrabold text-zinc-900 dark:text-white">{toolCenter.name}</h3>
                <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium line-clamp-2">
                  {toolCenter.description}
                </p>
              </Link>

              {/* Right Floating Card */}
              <Link href={`/tool/${toolRight.slug}`} className="cinematic-card animate-float-c2 rounded-3xl p-5 text-left hidden sm:block">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-blue-500/20 px-3 py-1 text-[10px] font-extrabold text-blue-600 dark:text-blue-300">
                    THUMBNAIL AI
                  </span>
                  <span className="text-xs font-bold text-purple-500">v6 Photorealism</span>
                </div>
                <div className="mt-3.5 overflow-hidden rounded-2xl h-36 bg-zinc-950 relative group/img">
                  <img
                    src={toolRight.coverImage}
                    alt={toolRight.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover/img:scale-110 opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-3">
                    <span className="text-xs font-bold text-white">{toolRight.name}</span>
                  </div>
                </div>
                <p className="mt-3 text-xs font-semibold text-zinc-800 dark:text-zinc-200">{toolRight.tagline}</p>
                <p className="mt-1 text-[11px] text-zinc-500">
                  {toolRight.ratingLabel || 'Editorial Score'}: ★ {toolRight.rating}
                </p>
              </Link>
            </div>
          </div>

          <a
            href="#explore"
            className="mt-16 inline-flex flex-col items-center gap-2 text-xs font-semibold text-zinc-500 hover:text-purple-500 dark:hover:text-purple-400 transition-colors"
          >
            <span>Scroll to Discover 50+ AI Tools</span>
            <ChevronDown className="h-4 w-4 animate-bounce text-purple-500 dark:text-purple-400" />
          </a>
        </div>
      </div>
    </section>
  );
};
