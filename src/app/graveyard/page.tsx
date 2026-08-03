"use client";

import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Skull, AlertTriangle, CheckCircle2 } from 'lucide-react';

const DEAD_TOOLS = [
  {
    name: 'Synthesys Studio',
    reason: 'Shut down Mar 2024 — domain expired, API offline.',
    date: 'Mar 2024',
    alternative: 'HeyGen',
  },
  {
    name: 'Synthesia (Legacy V1)',
    reason: 'Replaced by v2 platform; old editor no longer maintained.',
    date: 'Jan 2024',
    alternative: 'Synthesia v2',
  },
  {
    name: 'DeepMotion AI',
    reason: 'Acquired by Unity; standalone product discontinued.',
    date: 'Nov 2023',
    alternative: 'Runway + Adobe Mixamo',
  },
];

export default function GraveyardPage() {
  return (
    <div className="min-h-screen bg-[#030305] text-white">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 rounded-full bg-red-500/10 border border-red-500/20 px-4 py-1.5 text-xs font-bold text-red-400 mb-4">
            <Skull className="h-3.5 w-3.5" /> AI Graveyard
          </span>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3">Dead Tools We Track</h1>
          <p className="text-sm text-zinc-400 max-w-xl mx-auto">
            We monitor shut-down AI video tools so you never waste time on broken links or discontinued services. 
            Transparency builds trust.
          </p>
        </div>

        <div className="space-y-4">
          {DEAD_TOOLS.map((tool) => (
            <div key={tool.name} className="rounded-2xl border border-red-500/20 bg-red-950/10 p-6 shadow-inner">
              <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                    <Skull className="h-5 w-5 text-red-400" /> {tool.name}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">{tool.reason}</p>
                  <p className="text-[10px] text-zinc-600 mt-1">Discontinued: {tool.date}</p>
                </div>
                <a
                  href="/"
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 shadow shadow-emerald-500/20"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" /> Try {tool.alternative}
                </a>
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
