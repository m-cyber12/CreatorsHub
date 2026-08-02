"use client";

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { Mail, MessageSquare, Send, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      <div>
        <Header onOpenSubmitModal={() => {}} searchQuery="" onSearchChange={() => {}} />

        <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-white/10 text-center">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
              Contact <span className="text-cinematic-neon">CreatorAI Hub</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm text-zinc-400">
              Get in touch with our solo founder for partnerships, featured listing inquiries, or support.
            </p>
          </div>
        </section>

        <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="cinematic-card rounded-3xl p-8 border border-white/10 space-y-6">
            {sent ? (
              <div className="py-12 text-center space-y-3">
                <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400" />
                <h3 className="text-xl font-bold text-white">Message Received!</h3>
                <p className="text-xs text-zinc-400">We will respond within 24 hours.</p>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSent(true);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">Your Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="founder@yourtool.ai"
                    className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-sm text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">Subject *</label>
                  <select className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-sm text-white focus:border-purple-500 focus:outline-none">
                    <option value="partnership">Featured Listing / Sponsorship ($49-$99)</option>
                    <option value="curation">Tool Curation / Verification Query</option>
                    <option value="affiliate">Affiliate Partner Support</option>
                    <option value="other">General Feedback</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">Message *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="How can we help..."
                    className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-sm text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 py-4 text-sm font-extrabold text-white shadow-xl hover:from-purple-500 hover:to-indigo-500"
                >
                  <Send className="h-4 w-4" />
                  <span>Send Message to Founder</span>
                </button>
              </form>
            )}
          </div>
        </main>
      </div>

      <footer className="mt-24 border-t border-white/10 bg-zinc-950 py-12 text-center text-xs text-zinc-500">
        <p>© 2026 CreatorAI Hub. Contact Support.</p>
      </footer>
    </div>
  );
}
