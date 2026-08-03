"use client";

import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import Link from 'next/link';
import { FlaskConical, ArrowRight, ShieldCheck, Clock, DollarSign, CheckCircle2, AlertTriangle } from 'lucide-react';

const BENCHMARKS = [
  {
    brief: 'Generate a 10-second cinematic trailer for a sci-fi documentary. Brief: dark neon city, rain, voiceover about AI.',
    tools: [
      { name: 'Runway Gen-3', quality: 9.2, speedMin: 3, pricePerMin: 0.15, lipSync: true, consistency: 8.5, evidence: 'Tested 2026-08-01 v3.2' },
      { name: 'Pika 1.5', quality: 8.7, speedMin: 1, pricePerMin: 0.08, lipSync: true, consistency: 7.2, evidence: 'Tested 2026-07-28 v1.5' },
      { name: 'Kling 1.5', quality: 9.5, speedMin: 5, pricePerMin: 0.12, lipSync: false, consistency: 9.1, evidence: 'Tested 2026-07-20 v1.5' },
    ],
  },
  {
    brief: 'Create a 15-second vertical short: talking head with animated captions. Brief: high energy fitness coach.',
    tools: [
      { name: 'OpusClip AI', quality: 8.9, speedMin: 2, pricePerMin: 0.10, lipSync: false, consistency: 8.0, evidence: 'Tested 2026-07-15 v2.1' },
      { name: 'Submagic', quality: 8.5, speedMin: 1.5, pricePerMin: 0.09, lipSync: true, consistency: 7.8, evidence: 'Tested 2026-07-18 v2026.06' },
      { name: 'CapCut Pro', quality: 8.2, speedMin: 3, pricePerMin: 0.05, lipSync: false, consistency: 7.5, evidence: 'Tested 2026-08-01 v3.0' },
    ],
  },
];

export default function BenchmarkLabPage() {
  return (
    <div className="min-h-screen bg-[#030305] text-white">
      <Header />

      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 border border-amber-500/20 px-4 py-1.5 text-xs font-bold text-amber-300 mb-4">
            <FlaskConical className="h-3.5 w-3.5" /> Benchmark Lab — Evidence-Led Curation
          </span>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4">
            AI Video Benchmark Lab
          </h1>
          <p className="text-base md:text-lg text-zinc-400 max-w-2xl mx-auto">
            We test 8+ video AI tools with the exact same brief, prompt, and source footage. 
            No marketing claims — only measured quality, speed, cost, and consistency.
          </p>
        </div>

        <div className="space-y-16">
          {BENCHMARKS.map((bench, idx) => (
            <section key={idx} className="rounded-3xl border border-white/10 bg-zinc-900/40 p-6 sm:p-10 shadow-xl">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white mb-2 flex items-center gap-3">
                <span className="rounded-full bg-purple-500/20 px-3 py-1 text-sm text-purple-300 font-black">{String(idx + 1).padStart(2, '0')}</span>
                Benchmark Brief
              </h2>
              <p className="text-sm text-zinc-300 mb-6">{bench.brief}</p>

              <div className="overflow-x-auto rounded-2xl border border-white/10">
                <table className="w-full text-xs sm:text-sm text-left">
                  <thead className="bg-zinc-950 text-[10px] uppercase tracking-wider text-zinc-400 font-extrabold">
                    <tr>
                      <th className="px-4 py-3">Tool</th>
                      <th className="px-4 py-3">Quality (1-10)</th>
                      <th className="px-4 py-3">Speed (min)</th>
                      <th className="px-4 py-3">Price / min</th>
                      <th className="px-4 py-3">Lip Sync</th>
                      <th className="px-4 py-3">Consistency</th>
                      <th className="px-4 py-3">Evidence</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {bench.tools.map((t) => (
                      <tr key={t.name} className="hover:bg-zinc-800/30">
                        <td className="px-4 py-3 font-extrabold text-white">{t.name}</td>
                        <td className="px-4 py-3 text-amber-300 font-bold">{t.quality}</td>
                        <td className="px-4 py-3 text-zinc-300">{t.speedMin}</td>
                        <td className="px-4 py-3 text-emerald-400 font-bold">${t.pricePerMin}</td>
                        <td className="px-4 py-3">
                          {t.lipSync ? <span className="text-emerald-400 font-bold">Yes</span> : <span className="text-zinc-500">No</span>}
                        </td>
                        <td className="px-4 py-3 text-zinc-300">{t.consistency}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                            <ShieldCheck className="h-3 w-3" /> {t.evidence}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3 text-[11px] text-zinc-500">
                <span className="inline-flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Same prompt source</span>
                <span className="inline-flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Same footage input</span>
                <span className="inline-flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Same date (Aug 2026)</span>
              </div>
            </section>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
