"use client";

import React from 'react';
import { Sparkles, Award, CheckCircle2, Zap, ArrowRight, Play, ChevronDown, Compass } from 'lucide-react';

interface Hero3DProps {
  onOpenSubmitModal: () => void;
}

export const Hero3D: React.FC<Hero3DProps> = ({ onOpenSubmitModal }) => {
  return (
    <section className="relative overflow-hidden pt-12 pb-24 sm:pt-20 sm:pb-36">
      {/* Cinematic Deep Bokeh & Lens Flare Light Orbs */}
      <div className="absolute top-0 left-1/4 -z-10 h-[500px] w-[500px] rounded-full bg-purple-600/25 blur-[160px] animate-lens pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 -z-10 h-[450px] w-[450px] rounded-full bg-pink-600/20 blur-[170px] animate-lens pointer-events-none" style={{ animationDelay: '3s' }} />
      <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 -z-10 h-[380px] w-4/5 rounded-full bg-indigo-600/20 blur-[150px] pointer-events-none" />

      {/* Cyber Grid Texture Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] -z-10 pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          {/* Glowing Animated Pill */}
          <div className="inline-flex items-center gap-2.5 rounded-full border border-purple-500/40 bg-purple-950/50 px-4 py-1.5 text-xs font-bold text-purple-300 shadow-2xl backdrop-blur-xl transition-all hover:border-purple-400 hover:scale-105 cursor-default">
            <span className="flex h-2 w-2 rounded-full bg-purple-400 animate-ping" />
            <Sparkles className="h-3.5 w-3.5 text-purple-400" />
            <span>Cinematic AI Directory &amp; 3D Showcase • 2026 Edition</span>
          </div>

          {/* Cinematic Neon Headline */}
          <h1 className="mt-8 text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl max-w-5xl leading-[1.1]">
            Supercharge Your <br className="hidden sm:inline" />
            <span className="text-cinematic-neon">
              Video Creation Workflow
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-sm text-zinc-400 sm:text-lg leading-relaxed">
            No spam, no generic ChatGPT wrappers. Explore hand-curated 3D &amp; AI video editors,
            viral Shorts clippers, voice cloners, and thumbnail studios — built for YouTubers &amp; creators.
          </p>

          {/* Shimmer CTA & Explore Buttons */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onOpenSubmitModal}
              className="btn-cinematic-glow group relative flex items-center gap-2.5 rounded-2xl p-[2px] shadow-2xl transition-transform active:scale-95"
            >
              <div className="flex items-center gap-2 rounded-2xl bg-zinc-950 px-7 py-4 text-sm font-extrabold text-white transition-colors group-hover:bg-zinc-900">
                <Sparkles className="h-4 w-4 text-purple-400 animate-spin" style={{ animationDuration: '6s' }} />
                <span>Submit Your AI Tool</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1.5" />
              </div>
            </button>

            <a
              href="#explore"
              className="flex items-center gap-2.5 rounded-2xl border border-white/10 bg-zinc-900/80 px-7 py-4 text-sm font-bold text-zinc-200 backdrop-blur-xl transition-all hover:border-purple-500/50 hover:bg-zinc-800 hover:text-white"
            >
              <Compass className="h-4 w-4 text-purple-400" />
              <span>Explore 10+ Curated Tools</span>
            </a>
          </div>

          {/* 3D Cinematic Perspective Stage (MotionSites.ai Sky Estate Style) */}
          <div className="stage-3d relative mt-16 w-full max-w-6xl">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 items-center">
              {/* Left Floating Card */}
              <div className="cinematic-card animate-float-c1 rounded-3xl p-5 text-left hidden sm:block">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-purple-500/20 px-3 py-1 text-[10px] font-extrabold text-purple-300">
                    VIRAL SHORTS
                  </span>
                  <span className="text-xs font-bold text-emerald-400">10x Speed</span>
                </div>
                <div className="mt-3.5 overflow-hidden rounded-2xl h-36 bg-zinc-950 relative group/img">
                  <img
                    src="https://images.unsplash.com/photo-1626544827763-d516dce335e2?w=600&auto=format&fit=crop&q=80"
                    alt="Shorts Preview"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover/img:scale-110 opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 to-transparent flex items-end p-3">
                    <span className="text-xs font-bold text-white">OpusClip AI 2.0</span>
                  </div>
                </div>
                <p className="mt-3 text-xs font-semibold text-zinc-300">1 video into 10 viral Shorts in 1 click</p>
                <p className="mt-1 text-[11px] text-zinc-500">Auto-captions &amp; virality score engine</p>
              </div>

              {/* Center Hero Spotlight Card */}
              <div className="cinematic-card rounded-[32px] p-6 text-left shadow-2xl sm:-translate-y-5 border-purple-500/50">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-3.5 py-1 text-xs font-extrabold text-white shadow-md">
                    FEATURED AI STUDIO
                  </span>
                  <span className="flex items-center gap-1 text-xs font-extrabold text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
                    ★ 4.9 (612)
                  </span>
                </div>
                <div className="mt-4 overflow-hidden rounded-2xl h-52 bg-zinc-950 relative group/img border border-white/5">
                  <img
                    src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80"
                    alt="Voice AI Preview"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover/img:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent flex flex-col justify-end p-4">
                    <span className="text-sm font-extrabold text-white">ElevenLabs Studio Voice</span>
                    <span className="text-xs text-purple-300">Hyper-realistic AI dubbing in 29+ languages</span>
                  </div>
                </div>
                <h3 className="mt-4 text-base font-extrabold text-white">ElevenLabs Voice AI</h3>
                <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed">
                  The industry standard for voice cloning, faceless YouTube narration, and studio-grade audio synthesis.
                </p>
              </div>

              {/* Right Floating Card */}
              <div className="cinematic-card animate-float-c2 rounded-3xl p-5 text-left hidden sm:block">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-blue-500/20 px-3 py-1 text-[10px] font-extrabold text-blue-300">
                    THUMBNAIL AI
                  </span>
                  <span className="text-xs font-bold text-purple-400">v6 Photorealism</span>
                </div>
                <div className="mt-3.5 overflow-hidden rounded-2xl h-36 bg-zinc-950 relative group/img">
                  <img
                    src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80"
                    alt="Thumbnail AI"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover/img:scale-110 opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 to-transparent flex items-end p-3">
                    <span className="text-xs font-bold text-white">Midjourney v6 Alpha</span>
                  </div>
                </div>
                <p className="mt-3 text-xs font-semibold text-zinc-300">High-CTR YouTube thumbnail generator</p>
                <p className="mt-1 text-[11px] text-zinc-500">Photorealistic B-roll &amp; concept design</p>
              </div>
            </div>
          </div>

          {/* Scroll Down Hint Icon */}
          <a
            href="#explore"
            className="mt-16 inline-flex flex-col items-center gap-2 text-xs font-semibold text-zinc-500 hover:text-purple-400 transition-colors"
          >
            <span>Scroll to Discover 10+ AI Tools</span>
            <ChevronDown className="h-4 w-4 animate-bounce text-purple-400" />
          </a>
        </div>
      </div>
    </section>
  );
};
