"use client";

import React from 'react';
import { Sparkles, Award, CheckCircle2, Zap, Play, ArrowRight } from 'lucide-react';

interface Hero3DProps {
  onOpenSubmitModal: () => void;
}

export const Hero3D: React.FC<Hero3DProps> = ({ onOpenSubmitModal }) => {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-32 bg-animated-grid">
      {/* Dynamic Ambient Spotlights */}
      <div className="absolute top-0 left-1/4 -z-10 h-96 w-96 rounded-full bg-purple-600/20 blur-[130px] animate-pulse-glow" />
      <div className="absolute top-1/3 right-1/4 -z-10 h-96 w-96 rounded-full bg-pink-600/15 blur-[140px] animate-pulse-glow" style={{ animationDelay: '2s' }} />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 -z-10 h-80 w-3/4 rounded-full bg-indigo-600/15 blur-[120px]" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          {/* Neon Floating Badge */}
          <div className="inline-flex items-center gap-2.5 rounded-full border border-purple-500/40 bg-purple-950/40 px-4 py-1.5 text-xs font-semibold text-purple-300 shadow-xl backdrop-blur-md transition-all hover:border-purple-400">
            <span className="flex h-2 w-2 rounded-full bg-purple-400 animate-ping" />
            <Sparkles className="h-3.5 w-3.5 text-purple-400" />
            <span>Next-Gen 3D &amp; Animated AI Directory for 2026</span>
          </div>

          {/* Main Title with Neon Text Gradient */}
          <h1 className="mt-8 text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl max-w-4xl leading-tight">
            Supercharge Your <br className="hidden sm:inline" />
            <span className="text-gradient-neon">
              Video Creation Workflow
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-sm text-zinc-400 sm:text-lg leading-relaxed">
            No spam, no generic ChatGPT wrappers. Hand-curated 3D &amp; AI video editors,
            viral Shorts clippers, voice cloners, and thumbnail studios — tested for real YouTubers &amp; creators.
          </p>

          {/* Shimmer CTA & Actions */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onOpenSubmitModal}
              className="btn-shimmer-border group relative flex items-center gap-2.5 rounded-2xl p-[2px] shadow-2xl transition-transform active:scale-95"
            >
              <div className="flex items-center gap-2 rounded-2xl bg-zinc-950 px-6 py-3.5 text-sm font-bold text-white transition-colors group-hover:bg-zinc-900">
                <Sparkles className="h-4 w-4 text-purple-400 animate-spin" style={{ animationDuration: '6s' }} />
                <span>Submit Your AI Tool</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </button>

            <a
              href="#explore"
              className="flex items-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-900/60 px-6 py-3.5 text-sm font-semibold text-zinc-300 backdrop-blur-md transition-all hover:border-zinc-700 hover:text-white"
            >
              <span>Explore 10+ Curated Tools</span>
            </a>
          </div>

          {/* 3D Floating Isometric Preview Visual Showcase */}
          <div className="relative mt-16 w-full max-w-5xl">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 items-center">
              {/* Left Floating Card - Shorts & Reels */}
              <div className="glass-card-3d animate-float-slow rounded-2xl p-5 text-left hidden sm:block shadow-2xl">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-purple-500/20 px-2.5 py-0.5 text-[10px] font-bold text-purple-300">
                    VIRAL SHORTS
                  </span>
                  <span className="text-xs font-bold text-emerald-400">10x Speed</span>
                </div>
                <div className="mt-3 overflow-hidden rounded-xl h-28 bg-zinc-950">
                  <img
                    src="https://images.unsplash.com/photo-1626544827763-d516dce335e2?w=400&auto=format&fit=crop&q=80"
                    alt="Shorts Preview"
                    className="h-full w-full object-cover opacity-80"
                  />
                </div>
                <h4 className="mt-3 text-sm font-bold text-white">OpusClip AI 2.0</h4>
                <p className="mt-1 text-[11px] text-zinc-400">Auto-captions &amp; viral score engine</p>
              </div>

              {/* Center Main Feature Card - Video Editing */}
              <div className="glass-card-3d rounded-3xl p-6 text-left shadow-2xl sm:-translate-y-4 border-purple-500/40">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-pink-500/20 px-3 py-1 text-xs font-bold text-pink-300">
                    FEATURED STUDIO
                  </span>
                  <span className="flex items-center gap-1 text-xs font-bold text-amber-400">
                    ★ 4.9 (612)
                  </span>
                </div>
                <div className="mt-4 overflow-hidden rounded-2xl h-44 bg-zinc-950 relative group">
                  <img
                    src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80"
                    alt="Voice AI Preview"
                    className="h-full w-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent flex items-end p-4">
                    <span className="text-xs font-bold text-white">29+ Multilingual AI Voices</span>
                  </div>
                </div>
                <h3 className="mt-4 text-base font-bold text-white">ElevenLabs Studio</h3>
                <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
                  Hyper-realistic voice cloning &amp; automated video dubbing for YouTube creators.
                </p>
              </div>

              {/* Right Floating Card - Design & Thumbnails */}
              <div className="glass-card-3d animate-float-reverse rounded-2xl p-5 text-left hidden sm:block shadow-2xl">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-blue-500/20 px-2.5 py-0.5 text-[10px] font-bold text-blue-300">
                    THUMBNAIL AI
                  </span>
                  <span className="text-xs font-bold text-purple-400">v6 Alpha</span>
                </div>
                <div className="mt-3 overflow-hidden rounded-xl h-28 bg-zinc-950">
                  <img
                    src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80"
                    alt="Thumbnail AI"
                    className="h-full w-full object-cover opacity-80"
                  />
                </div>
                <h4 className="mt-3 text-sm font-bold text-white">Midjourney v6</h4>
                <p className="mt-1 text-[11px] text-zinc-400">Photorealistic YouTube thumbnails</p>
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4 border-y border-zinc-800/80 py-6 text-zinc-400 w-full">
            <div className="flex items-center justify-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span className="text-xs font-semibold">100% Hand-Curated</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Award className="h-4 w-4 text-purple-400" />
              <span className="text-xs font-semibold">Founder Verified Badges</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Zap className="h-4 w-4 text-amber-400" />
              <span className="text-xs font-semibold">Weekly AI Updates</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="h-4 w-4 text-pink-400" />
              <span className="text-xs font-semibold">MotionSites 3D Aesthetic</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
