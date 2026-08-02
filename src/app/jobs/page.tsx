"use client";

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { CREATOR_JOBS, CreatorJob } from '@/data/jobs';
import { Sparkles, Briefcase, MapPin, DollarSign, ExternalLink, Award, PlusCircle } from 'lucide-react';

export default function JobsBoardPage() {
  const [selectedType, setSelectedType] = useState<string>('All');

  const types = ['All', 'Full-Time', 'Contract', 'Part-Time', 'Per-Video'];

  const filtered = selectedType === 'All'
    ? CREATOR_JOBS
    : CREATOR_JOBS.filter((j) => j.type === selectedType);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      <div>
        <Header onOpenSubmitModal={() => {}} searchQuery="" onSearchChange={() => {}} />

        {/* Hero */}
        <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-white/10 text-center">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-xs font-bold text-purple-400">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Niche AI Creator &amp; Video Editor Job Board</span>
            </div>
            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
              Find AI Video <span className="text-cinematic-neon">Editor Jobs</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm text-zinc-400 sm:text-lg">
              Top YouTube documentary channels, finance creators, and agencies hiring ElevenLabs, Midjourney &amp; OpusClip specialists.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => alert('Job post triggered! $49 Featured Listing slot via Stripe/crypto.')}
                className="theme-btn-primary flex items-center gap-2 rounded-2xl px-6 py-3.5 text-xs font-extrabold text-white shadow-xl hover:scale-105"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Post a Job ($49 Featured Listing)</span>
              </button>
            </div>

            {/* Filter Pills */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
              {types.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`rounded-full px-5 py-2 text-xs font-extrabold transition-all ${
                    selectedType === type
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Jobs List */}
        <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {filtered.map((job) => (
              <div
                key={job.id}
                className={`cinematic-card flex flex-col sm:flex-row sm:items-center justify-between gap-6 rounded-3xl p-6 border ${
                  job.isFeatured ? 'border-purple-500/60 bg-purple-950/20' : 'border-white/10'
                }`}
              >
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-extrabold text-white text-base sm:text-lg">{job.title}</span>
                    {job.isFeatured && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/20 border border-purple-500/40 px-2.5 py-0.5 text-[10px] font-bold text-purple-300">
                        <Award className="h-3 w-3 text-purple-400" /> Featured
                      </span>
                    )}
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-4 text-xs font-bold text-purple-400">
                    <span>{job.company}</span>
                    <span className="flex items-center gap-1 text-emerald-400">
                      <DollarSign className="h-3.5 w-3.5" /> {job.salary}
                    </span>
                    <span className="flex items-center gap-1 text-zinc-400">
                      <MapPin className="h-3.5 w-3.5" /> {job.location}
                    </span>
                    <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-zinc-300">
                      {job.type}
                    </span>
                  </div>

                  <p className="mt-3 text-xs leading-relaxed text-zinc-400 max-w-2xl">
                    {job.description}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <a
                    href={job.applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3.5 text-xs font-extrabold text-white shadow-lg hover:from-purple-500 hover:to-indigo-500"
                  >
                    <span>Apply Now</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      <footer className="mt-24 border-t border-white/10 bg-zinc-950 py-12 text-center text-xs text-zinc-500">
        <p>© 2026 CreatorAI Hub Job Board. Hiring AI video creators and editors.</p>
      </footer>
    </div>
  );
}
