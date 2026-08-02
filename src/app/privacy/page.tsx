"use client";

import React from 'react';
import { Header } from '@/components/Header';
import { ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      <div>
        <Header onOpenSubmitModal={() => {}} searchQuery="" onSearchChange={() => {}} />

        <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-white/10 text-center">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
              Privacy Policy &amp; <span className="text-cinematic-neon">FTC Disclosure</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm text-zinc-400">
              Last Updated: August 2026 • Full compliance with FTC Endorsement &amp; Review Guidelines
            </p>
          </div>
        </section>

        <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8 space-y-10 text-zinc-300">
          <div className="cinematic-card rounded-3xl p-8 border border-purple-500/40 bg-purple-950/20 space-y-4">
            <div className="flex items-center gap-2 text-purple-300 font-bold">
              <ShieldAlert className="h-5 w-5 text-purple-400" />
              <span>FTC Affiliate Disclosure Notice</span>
            </div>
            <p className="text-sm leading-relaxed text-zinc-300">
              <strong>CreatorAI Hub</strong> participates in affiliate marketing programs. Many of the outbound links to AI tools (including OpusClip, ElevenLabs, Submagic, VidIQ, and others) contain affiliate tracking tags (such as <code>?via=creatoraihub</code> or <code>?ref=creatoraihub</code>).
            </p>
            <p className="text-sm leading-relaxed text-zinc-300">
              If you click an affiliate link and purchase a software subscription, we may earn a referral commission <strong>at no extra cost to you</strong>. These commissions help fund our independent testing, server maintenance, and editorial team. Our affiliate relationships never influence our editorial scores or tool rankings.
            </p>
          </div>

          <div className="cinematic-card rounded-3xl p-8 border border-white/10 space-y-4">
            <h2 className="text-xl font-extrabold text-white">Data Collection &amp; Privacy</h2>
            <p className="text-sm leading-relaxed text-zinc-400">
              We respect your privacy. When you submit a tool via our &ldquo;Submit Tool&rdquo; form, we collect your tool name, website URL, and founder email solely for curation verification and backlink communication. We do not sell, rent, or share your contact information with third parties.
            </p>
          </div>
        </main>
      </div>

      <footer className="mt-24 border-t border-white/10 bg-zinc-950 py-12 text-center text-xs text-zinc-500">
        <p>© 2026 CreatorAI Hub. Fully compliant FTC Disclosure &amp; Privacy Policy.</p>
      </footer>
    </div>
  );
}
