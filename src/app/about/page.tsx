"use client";

import React from 'react';
import { Header } from '@/components/Header';
import { ShieldCheck, Award, Sparkles, Heart } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      <div>
        <Header onOpenSubmitModal={() => {}} searchQuery="" onSearchChange={() => {}} />

        <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-white/10 text-center">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-xs font-bold text-purple-400">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Independent &amp; Verified Curation</span>
            </div>
            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
              About <span className="text-cinematic-neon">CreatorAI Hub</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm text-zinc-400 sm:text-lg leading-relaxed">
              Why we built a 100% hand-curated 3D directory of tested AI video tools for YouTubers, editors, and solo founders.
            </p>
          </div>
        </section>

        <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8 space-y-12 text-zinc-300">
          <div className="cinematic-card rounded-3xl p-8 border border-white/10 space-y-4">
            <h2 className="text-xl font-extrabold text-white">Our Editorial Mission</h2>
            <p className="text-sm leading-relaxed text-zinc-400">
              In 2026, the AI software market is flooded with over 20,000 generic wrappers. As video creators and solo developers, we became frustrated wasting hours testing spammy tools that promised to automate Shorts or clone voices, only to deliver robotic, unusable results.
            </p>
            <p className="text-sm leading-relaxed text-zinc-400">
              We launched <strong>CreatorAI Hub</strong> with a singular promise: <strong>zero spam, zero AI-wrapper bloat</strong>. Every tool in our index is hand-curated, tested for real video production workflows, and evaluated on render speed, virality scores, and CTR impact.
            </p>
          </div>

          <div className="cinematic-card rounded-3xl p-8 border border-white/10 space-y-4">
            <h2 className="text-xl font-extrabold text-white">How Our Rating &amp; Editorial Scores Work</h2>
            <p className="text-sm leading-relaxed text-zinc-400">
              In accordance with FTC regulations and transparent review standards, our scores are labeled as <strong>Editorial Scores</strong> or <strong>Community Scores</strong>. We evaluate tools across three pillars:
            </p>
            <ul className="list-disc list-inside text-sm text-zinc-400 space-y-2">
              <li><strong>Output Quality:</strong> Does the AI voiceover, thumbnail art, or subtitle animation match studio-grade production?</li>
              <li><strong>Time Saved:</strong> Does the tool reduce a 4-hour editing workflow to under 15 minutes?</li>
              <li><strong>Value for Money:</strong> Is the pricing model fair for solo creators and freelancers?</li>
            </ul>
          </div>

          <div className="cinematic-card rounded-3xl p-8 border border-white/10 space-y-4">
            <h2 className="text-xl font-extrabold text-white">The Verified Founder Badge Flywheel</h2>
            <p className="text-sm leading-relaxed text-zinc-400">
              We believe in supporting authentic builders. AI tool founders who embed our verified badge on their website or mention CreatorAI Hub receive priority editorial review and permanent SEO backlinks.
            </p>
          </div>
        </main>
      </div>

      <footer className="mt-24 border-t border-white/10 bg-zinc-950 py-12 text-center text-xs text-zinc-500">
        <p>© 2026 CreatorAI Hub. Independent AI Directory &amp; Creator Platform.</p>
      </footer>
    </div>
  );
}
