"use client";

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { Sparkles, Mail, Lock } from 'lucide-react';

export default function TemplatesMarketplacePage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen bg-[#030305] text-white flex flex-col justify-between">
      <div>
        <Header />

        <section className="relative overflow-hidden pt-20 pb-24 border-b border-white/10 text-center">
          <div className="mx-auto max-w-3xl px-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-xs font-bold text-purple-400 mb-6">
              <Lock className="h-3.5 w-3.5" />
              <span>Private Launch — Not Public Yet</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
              Creator Templates & Notion OS
            </h1>
            <p className="text-base md:text-lg text-zinc-400 mb-8 max-w-xl mx-auto leading-relaxed">
              A curated marketplace of production systems, AI prompt kits, and revenue calculators. 
              This section is under construction. Join the waitlist for early access.
            </p>

            <div className="rounded-3xl border border-white/10 bg-zinc-900/60 p-8 max-w-md mx-auto shadow-2xl">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (email.trim()) setSubmitted(true);
                }}
                className="space-y-4"
              >
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full rounded-2xl border border-white/10 bg-zinc-950 py-3.5 pl-12 pr-4 text-sm text-white placeholder-zinc-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitted}
                  className="w-full rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 py-3.5 text-sm font-extrabold text-white shadow-xl hover:from-purple-500 hover:to-pink-500 disabled:opacity-60"
                >
                  {submitted ? 'Thanks — You are on the list!' : 'Join Waitlist'}
                </button>
              </form>
              <p className="mt-4 text-[11px] text-zinc-500 text-center">
                No fake sales numbers. No placeholder products. Real templates launching Q3 2026.
              </p>
            </div>
          </div>
        </section>
      </div>

      <footer className="border-t border-white/5 bg-zinc-950 py-10 text-center text-xs text-zinc-500">
        <p>© 2026 CreatorAI Hub. Templates section coming soon — no fake data or placeholder products.</p>
      </footer>
    </div>
  );
}
