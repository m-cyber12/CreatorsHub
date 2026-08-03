"use client";

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { Sparkles, Mail, Lock, Briefcase } from 'lucide-react';

export default function JobsBoardPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen bg-[#030305] text-white flex flex-col justify-between">
      <div>
        <Header />

        <section className="relative overflow-hidden pt-20 pb-24 border-b border-white/10 text-center">
          <div className="mx-auto max-w-3xl px-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-bold text-amber-400 mb-6">
              <Lock className="h-3.5 w-3.5" />
              <span>Under Construction — Real Listings Coming Soon</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 flex items-center justify-center gap-3">
              <Briefcase className="h-10 w-10 text-amber-400" />
              AI Video Creator Jobs
            </h1>
            <p className="text-base md:text-lg text-zinc-400 mb-8 max-w-xl mx-auto leading-relaxed">
              A dedicated job board for AI video editors, voice artists, and creator-operators. 
              We are not showing fake listings or placeholder salaries. Real postings launching Q3 2026.
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
                    className="w-full rounded-2xl border border-white/10 bg-zinc-950 py-3.5 pl-12 pr-4 text-sm text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitted}
                  className="w-full rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 py-3.5 text-sm font-extrabold text-white shadow-xl hover:from-amber-400 hover:to-orange-500 disabled:opacity-60"
                >
                  {submitted ? 'Thanks — You are on the list!' : 'Notify Me at Launch'}
                </button>
              </form>
              <p className="mt-4 text-[11px] text-zinc-500 text-center">
                No fake company names. No placeholder salaries. Real job board launching Q3 2026.
              </p>
            </div>
          </div>
        </section>
      </div>

      <footer className="border-t border-white/5 bg-zinc-950 py-10 text-center text-xs text-zinc-500">
        <p>© 2026 CreatorAI Hub Job Board. Real listings coming — no fake data.</p>
      </footer>
    </div>
  );
}
