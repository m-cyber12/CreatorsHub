'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Tool, hasVerifiedScore, computeOverall } from '@/data/tools';
import { SmartImage } from '@/components/SmartImage';
import Link from '@/i18n/navigation';
import { Trophy, Star, ArrowRight, ExternalLink } from 'lucide-react';

export function BenchmarkLeaderboard({ tools }: { tools: Tool[] }) {
  const t = useTranslations('components.benchmarkLeaderboard');
  const [sortBy, setSortBy] = useState<'overall' | 'quality' | 'speed' | 'value'>('overall');

  const sorted = [...tools].sort((a, b) => {
    if (!a.scores || !b.scores) return 0;
    if (sortBy === 'quality') return b.scores.outputQuality - a.scores.outputQuality;
    if (sortBy === 'speed') return b.scores.speed - a.scores.speed;
    if (sortBy === 'value') return b.scores.valueForMoney - a.scores.valueForMoney;
    return computeOverall(b.scores) - computeOverall(a.scores);
  });

  return (
    <div className="rounded-3xl border border-white/10 bg-surface-1 p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-2xs font-bold text-emerald-300 mb-2">
            <Trophy className="h-3 w-3" /> {t('resultsBadge')}
          </span>
          <h2 className="text-xl font-extrabold text-white">{t('heading')}</h2>
          <p className="mt-1 text-xs text-zinc-400">
            {t('intro')}
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-zinc-950 border border-white/10 p-1 rounded-xl">
          {[
            { id: 'overall', labelKey: 'overall' },
            { id: 'quality', labelKey: 'quality' },
            { id: 'speed', labelKey: 'speedLabel' },
            { id: 'value', labelKey: 'valueLabel' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSortBy(tab.id as any)}
              className={`rounded-lg px-3 py-1.5 text-2xs font-bold transition-colors ${
                sortBy === tab.id
                  ? 'bg-accent-500 text-black shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {t(tab.labelKey)}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-zinc-900 text-zinc-400 border-b border-white/10">
            <tr>
              <th className="py-3 px-4 font-bold">{t('rank')}</th>
              <th className="py-3 px-4 font-bold">{t('tool')}</th>
              <th className="py-3 px-4 font-bold">{t('category')}</th>
              <th className="py-3 px-4 font-bold text-center">{t('quality')}</th>
              <th className="py-3 px-4 font-bold text-center">{t('speedLabel')}</th>
              <th className="py-3 px-4 font-bold text-center">{t('valueLabel')}</th>
              <th className="py-3 px-4 font-bold text-center">{t('overall')}</th>
              <th className="py-3 px-4 font-bold text-right">{t('action')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {sorted.map((tool, idx) => {
              const overall = tool.scores ? computeOverall(tool.scores) : 0;
              return (
                <tr key={tool.slug} className="hover:bg-white/5 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-zinc-400">#{idx + 1}</td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <SmartImage
                        src={tool.logo}
                        alt=""
                        width={32}
                        height={32}
                        className="h-8 w-8 rounded-lg object-cover border border-white/10"
                      />
                      <div>
                        <Link href={`/tool/${tool.slug}`} className="font-extrabold text-white hover:text-accent-300">
                          {tool.name}
                        </Link>
                        <div className="text-2xs text-emerald-400 font-mono">{tool.startingPrice || 'Free'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-zinc-400">{tool.category}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-center text-zinc-300">
                    {tool.scores?.outputQuality.toFixed(1)}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-center text-zinc-300">
                    {tool.scores?.speed.toFixed(1)}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-center text-zinc-300">
                    {tool.scores?.valueForMoney.toFixed(1)}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-black text-center text-emerald-400 text-sm">
                    {overall.toFixed(1)}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/tool/${tool.slug}`}
                        className="rounded-lg bg-surface-2 border border-white/10 px-2.5 py-1.5 text-2xs font-bold text-zinc-300 hover:text-white"
                      >
                        {t('review')}
                      </Link>
                      <a
                        href={`/go/${tool.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg bg-accent-500 px-2.5 py-1.5 text-2xs font-bold text-black hover:bg-accent-400"
                      >
                        {t('visit')}
                      </a>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
