"use client";

import React, { useMemo, useState } from 'react';
import { SmartImage } from '@/components/SmartImage';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CustomSelect } from '@/components/CustomSelect';
import { ALL_TOOLS, Tool } from '@/data/tools';
import { Sparkles, Star, ExternalLink, Trophy, Plus, X } from 'lucide-react';
import Link from 'next/link';

const ACCENTS = ['text-purple-400', 'text-pink-400', 'text-blue-400'];
const BTN = ['bg-purple-600 hover:bg-purple-500', 'bg-pink-600 hover:bg-pink-500', 'bg-blue-600 hover:bg-blue-500'];

export function CompareClient() {
  const params = useSearchParams();
  const initial = useMemo(() => {
    const fromUrl = (params.get('tools') || '')
      .split(',')
      .map((s) => ALL_TOOLS.find((t) => t.slug === s.trim()))
      .filter((t): t is Tool => Boolean(t))
      .slice(0, 3);
    if (fromUrl.length >= 2) return fromUrl;
    return [ALL_TOOLS[0], ALL_TOOLS[4]];
  }, [params]);

  const [selected, setSelected] = useState<Tool[]>(initial);

  const options = useMemo(
    () => [...ALL_TOOLS].sort((a, b) => a.name.localeCompare(b.name)).map((t) => ({ value: t.slug, label: t.name, category: t.category })),
    []
  );

  const setTool = (index: number, slug: string) => {
    const found = ALL_TOOLS.find((t) => t.slug === slug);
    if (!found) return;
    setSelected((prev) => prev.map((t, i) => (i === index ? found : t)));
  };

  const addColumn = () => {
    if (selected.length >= 3) return;
    const next = ALL_TOOLS.find((t) => !selected.some((s) => s.slug === t.slug));
    if (next) setSelected([...selected, next]);
  };

  const removeColumn = (index: number) => {
    if (selected.length <= 2) return;
    setSelected(selected.filter((_, i) => i !== index));
  };

  const bestRating = Math.max(...selected.map((t) => t.rating));
  const cols = selected.length;
  const gridCols = cols === 3 ? 'grid-cols-4' : 'grid-cols-3';

  return (
    <div className="min-h-screen bg-surface-0 text-white flex flex-col justify-between">
      <div>
        <Header />

        <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-20 border-b border-white/10 text-center">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-xs font-bold text-purple-400">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Side-by-Side Comparison Engine</span>
            </div>
            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
              AI Tools <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Head-to-Head</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm text-zinc-400 sm:text-lg">
              Compare pricing, editorial scores, and best use cases before you subscribe. Add up to 3 tools.
            </p>

            <div className={`mt-10 mx-auto max-w-4xl grid grid-cols-1 gap-4 sm:grid-cols-${cols}`}>
              {selected.map((tool, i) => (
                <div key={i} className="relative rounded-2xl border border-white/10 bg-zinc-900/60 p-5 backdrop-blur-xl">
                  {selected.length > 2 && (
                    <button
                      onClick={() => removeColumn(i)}
                      className="absolute -top-2 -right-2 rounded-full bg-zinc-800 border border-white/10 p-1 text-zinc-400 hover:text-white"
                      aria-label="Remove tool"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <CustomSelect
                    label={`Tool ${String.fromCharCode(65 + i)}`}
                    options={options}
                    value={tool.slug}
                    onChange={(val) => setTool(i, val)}
                    iconColor={ACCENTS[i]}
                  />
                </div>
              ))}
              {selected.length < 3 && (
                <button
                  onClick={addColumn}
                  className="flex min-h-[90px] items-center justify-center gap-2 rounded-2xl border border-dashed border-white/15 text-xs font-bold text-zinc-500 hover:text-purple-300 hover:border-purple-500/40 transition-colors"
                >
                  <Plus className="h-4 w-4" /> Add a third tool
                </button>
              )}
            </div>
          </div>
        </section>

        <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-white/10 bg-zinc-900 overflow-hidden shadow-2xl overflow-x-auto">
            <div className={`grid ${gridCols} min-w-[640px] border-b border-white/10 bg-zinc-950/60 p-6 text-center text-xs sm:text-sm font-extrabold`}>
              <div className="text-left text-zinc-400">Feature / Spec</div>
              {selected.map((t, i) => (
                <div key={t.slug} className={`flex flex-col items-center gap-2 ${ACCENTS[i]}`}>
                  <SmartImage src={t.logo} alt="" width={40} height={40} className="h-10 w-10 rounded-xl border border-white/10 object-cover" />
                  <Link href={`/tool/${t.slug}`} className="hover:underline">{t.name}</Link>
                  {t.rating === bestRating && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[9px] font-bold text-amber-300">
                      <Trophy className="h-2.5 w-2.5" /> Top Rated
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className="divide-y divide-white/5 text-xs sm:text-sm min-w-[640px]">
              <Row label="Category" cells={selected.map((t) => t.category)} gridCols={gridCols} />
              <Row label="Pricing Model" cells={selected.map((t) => `${t.pricing}${t.startingPrice ? ` (${t.startingPrice})` : ''}`)} gridCols={gridCols} accent="text-emerald-400" />
              <div className={`grid ${gridCols} p-5 items-center`}>
                <span className="font-bold text-zinc-400">Editorial Score</span>
                {selected.map((t) => (
                  <div key={t.slug} className="flex items-center justify-center gap-1">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className={`font-extrabold ${t.rating === bestRating ? 'text-amber-300' : 'text-white'}`}>{t.rating}</span>
                  </div>
                ))}
              </div>
              <Row label="Standout Metric" cells={selected.map((t) => t.metrics || '—')} gridCols={gridCols} accent="text-purple-300" />
              <Row label="Last Reviewed" cells={selected.map((t) => t.lastReviewed || 'Aug 2026')} gridCols={gridCols} />
              <div className={`grid ${gridCols} p-5 items-start`}>
                <span className="font-bold text-zinc-400">Best Used For</span>
                {selected.map((t) => (
                  <p key={t.slug} className="text-center text-xs text-zinc-400 px-2">{t.description}</p>
                ))}
              </div>
              <div className={`grid ${gridCols} p-5 items-start`}>
                <span className="font-bold text-zinc-400">Key Tags</span>
                {selected.map((t) => (
                  <div key={t.slug} className="flex flex-wrap justify-center gap-1 px-2">
                    {t.tags.slice(0, 4).map((tag) => (
                      <span key={tag} className="rounded-md bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-400 border border-zinc-700/50">#{tag}</span>
                    ))}
                  </div>
                ))}
              </div>
              <div className={`grid ${gridCols} p-6 items-center bg-zinc-950/40`}>
                <span className="font-extrabold text-white">Direct Link</span>
                {selected.map((t, i) => (
                  <div key={t.slug} className="text-center">
                    <a
                      href={`/go/${t.slug}`}
                      target="_blank"
                      rel="noopener noreferrer nofollow sponsored"
                      className={`inline-flex items-center gap-1.5 rounded-xl ${BTN[i]} px-4 py-2.5 text-xs font-bold text-white shadow-lg transition-colors`}
                    >
                      <span>Try {t.name}</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <p className="mt-4 text-center text-[11px] text-zinc-600">
            Scores are editorial and based on hands-on testing. Some links are affiliate links —{' '}
            <Link href="/disclosure" className="underline hover:text-zinc-400">read our disclosure</Link>.
          </p>
        </main>
      </div>

      <Footer />
    </div>
  );
}

function Row({ label, cells, gridCols, accent = 'text-white' }: { label: string; cells: string[]; gridCols: string; accent?: string }) {
  return (
    <div className={`grid ${gridCols} p-5 items-center`}>
      <span className="font-bold text-zinc-400">{label}</span>
      {cells.map((c, i) => (
        <span key={i} className={`text-center font-semibold ${accent}`}>{c}</span>
      ))}
    </div>
  );
}
