"use client";

import React from 'react';
import { Header } from '@/components/Header';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      <div>
        <Header onOpenSubmitModal={() => {}} searchQuery="" onSearchChange={() => {}} />

        <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-white/10 text-center">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
              Terms of <span className="text-cinematic-neon">Service</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm text-zinc-400">
              Terms and Conditions for using CreatorAI Hub
            </p>
          </div>
        </section>

        <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8 space-y-8 text-zinc-300">
          <div className="cinematic-card rounded-3xl p-8 border border-white/10 space-y-4">
            <h2 className="text-xl font-extrabold text-white">1. Use of the Directory</h2>
            <p className="text-sm leading-relaxed text-zinc-400">
              CreatorAI Hub is a curated directory of third-party artificial intelligence software tools. All trademarks, logos, and product names referenced belong to their respective owners.
            </p>
            <h2 className="text-xl font-extrabold text-white pt-4">2. Tool Submissions</h2>
            <p className="text-sm leading-relaxed text-zinc-400">
              By submitting an AI tool via our submission form, you warrant that you are an authorized representative of the software and grant CreatorAI Hub the right to display your tool description, logo, and website link.
            </p>
          </div>
        </main>
      </div>

      <footer className="mt-24 border-t border-white/10 bg-zinc-950 py-12 text-center text-xs text-zinc-500">
        <p>© 2026 CreatorAI Hub. Terms of Service.</p>
      </footer>
    </div>
  );
}
