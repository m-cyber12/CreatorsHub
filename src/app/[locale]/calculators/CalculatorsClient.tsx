'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Calculator, Clock, ShieldCheck, DollarSign, ArrowRight, AlertCircle, Sliders, ExternalLink as ExternalLinkIcon } from 'lucide-react';
import { ALL_TOOLS } from '@/data/tools';
import { SmartImage } from '@/components/SmartImage';
import Link from '@/i18n/navigation';

// Refactor (2026-08-06): the old Copyright Checker labelled every entry
// "Monetization Safe" — a definitive claim the site could not back up.
// Copyright depends on the tool, the plan, the asset, the country, the
// music, and the input content, and vendor terms change. Each rule now
// records a status (Allowed / Restricted / Unclear), the date it was checked,
// and a source link to the exact terms. No "100% safe" wording.
//
// i18n (v3.3): the rule copy lives in `calculators.rules.*` messages; the
// category display labels come from the server (localizedCategoryLabel) via
// the `categoryLabels` prop. Statuses map to translated labels.

type Status = 'Allowed' | 'Restricted' | 'Unclear';

interface CopyrightRule {
  slug: string;
  toolName: string;
  category: string;
  freeCommercial: string;
  paidCommercial: string;
  /** Allowed | Restricted | Unclear — never an absolute guarantee. */
  status: Status;
  sourceUrl: string;
  checkedAt: string;
  notes: string;
}

const RULE_META: Record<
  string,
  { category: string; status: Status; sourceUrl: string }
> = {
  midjourney: {
    category: 'Video Generation',
    status: 'Allowed',
    sourceUrl: 'https://docs.midjourney.com/docs/terms-of-service',
  },
  suno: { category: 'Voice & Audio', status: 'Allowed', sourceUrl: 'https://suno.com/terms' },
  elevenlabs: { category: 'Voice & Audio', status: 'Allowed', sourceUrl: 'https://elevenlabs.io/terms' },
  runway: { category: 'Video Generation', status: 'Allowed', sourceUrl: 'https://runway.com/terms' },
  opusclip: { category: 'Video Repurposing', status: 'Allowed', sourceUrl: 'https://www.opus.pro/terms' },
  capcut: { category: 'Video Repurposing', status: 'Unclear', sourceUrl: 'https://www.capcut.com/terms' },
};

const CHECKED_AT = '2026-08-04';

export function CalculatorsClient({
  categoryLabels = {},
}: {
  /** English category → localized display label (from the server). */
  categoryLabels?: Record<string, string>;
}) {
  const t = useTranslations('calculators');
  const tCommon = useTranslations('common');
  const [activeTab, setActiveTab] = useState<'stack' | 'time' | 'copyright'>('stack');

  // --- Calculator 1: Stack Cost ---
  const [selectedTools, setSelectedTools] = useState<string[]>(['opusclip', 'elevenlabs', 'descript']);
  const toggleTool = (slug: string) => {
    setSelectedTools((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]));
  };
  const stackTools = ALL_TOOLS.filter((tool) => selectedTools.includes(tool.slug));
  const parsePrice = (priceStr: string | undefined): number => {
    if (!priceStr) return 0;
    const match = priceStr.replace(',', '.').match(/\$?([0-9]+(?:\.[0-9]+)?)/);
    return match ? parseFloat(match[1]) : 0;
  };
  const totalMonthly = stackTools.reduce((acc, tool) => acc + parsePrice(tool.startingPrice), 0);

  // --- Calculator 1b: honest ROI scenario ---
  // Refactor (2026-08-06): the old calculator claimed a hardcoded
  // "Equivalent Freelance Editor: $2,200/mo" and an exact "$25,980/year
  // savings" figure. That was fabricated — no editor rate was ever asked and
  // no real time was measured. It is replaced with a clearly-labelled
  // scenario estimate based on YOUR hourly value and an assumed range of
  // hours saved per month (low / base / high). It is an estimate, not a
  // measured result, and never a "savings" claim.
  const [hourlyRate, setHourlyRate] = useState(50);
  const [hoursSavedLow, setHoursSavedLow] = useState(15);
  const [hoursSavedBase, setHoursSavedBase] = useState(30);
  const [hoursSavedHigh, setHoursSavedHigh] = useState(50);
  const scenarioLow = Math.round(hoursSavedLow * 4 * hourlyRate);
  const scenarioBase = Math.round(hoursSavedBase * 4 * hourlyRate);
  const scenarioHigh = Math.round(hoursSavedHigh * 4 * hourlyRate);

  // --- Calculator 2: Time Saved ---
  const [rawHours, setRawHours] = useState(6);
  const [videosPerWeek, setVideosPerWeek] = useState(5);
  const hoursSavedPerWeek = Math.round(rawHours * 0.75 + videosPerWeek * 1.5);
  const monthlyDollarsSaved = Math.round(hoursSavedPerWeek * 4 * hourlyRate);

  // --- Calculator 3: Copyright Search ---
  const [searchQuery, setSearchQuery] = useState('');
  const copyrightRules: CopyrightRule[] = Object.keys(RULE_META).map((slug) => {
    const meta = RULE_META[slug];
    const rule = t.raw(`rules.${slug}`) as { free: string; paid: string; notes: string };
    return {
      slug,
      toolName: ALL_TOOLS.find((tool) => tool.slug === slug)?.name ?? slug,
      category: meta.category,
      freeCommercial: rule?.free ?? '',
      paidCommercial: rule?.paid ?? '',
      status: meta.status,
      sourceUrl: meta.sourceUrl,
      checkedAt: CHECKED_AT,
      notes: rule?.notes ?? '',
    };
  });
  const filteredCopyright = copyrightRules.filter(
    (c) =>
      c.toolName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statusLabel = (s: Status) =>
    s === 'Allowed' ? t('statusAllowed') : s === 'Restricted' ? t('statusRestricted') : t('statusUnclear');

  return (
    <div>
      {/* Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 border-b border-white/10 pb-6">
        {[
          { id: 'stack' as const, label: t('tabStack'), icon: DollarSign },
          { id: 'time' as const, label: t('tabTime'), icon: Clock },
          { id: 'copyright' as const, label: t('tabCopyright'), icon: ShieldCheck },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-xs font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-accent-500 text-black shadow-lg'
                : 'bg-surface-1 border border-white/10 text-zinc-400 hover:text-white'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab 1: Stack Cost Calculator */}
      {activeTab === 'stack' && (
        <div className="mt-8 grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7 space-y-4">
            <h2 className="text-lg font-extrabold text-white">{t('stackHeading')}</h2>
            <p className="text-xs text-zinc-400">{t('stackSub')}</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[480px] overflow-y-auto pr-2">
              {ALL_TOOLS.slice(0, 24).map((tool) => {
                const isSelected = selectedTools.includes(tool.slug);
                return (
                  <button
                    key={tool.slug}
                    onClick={() => toggleTool(tool.slug)}
                    className={`flex items-center gap-3 rounded-2xl p-3 text-left border transition-all ${
                      isSelected
                        ? 'border-accent-500 bg-accent-500/15 text-white'
                        : 'border-white/10 bg-surface-1 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <SmartImage
                      src={tool.logo}
                      alt=""
                      width={32}
                      height={32}
                      className="h-8 w-8 rounded-lg object-cover bg-surface-2 border border-white/10"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold truncate">{tool.name}</div>
                      <div className="text-2xs text-emerald-400 font-mono">
                        {tool.startingPrice || t('free')}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-3xl border border-accent-500/30 bg-gradient-to-br from-accent-500/10 via-surface-1 to-surface-2 p-6 sm:p-8 space-y-6 sticky top-24">
              <div>
                <span className="text-2xs font-bold uppercase tracking-wider text-accent-300">
                  {t('budgetBreakdown')}
                </span>
                <h3 className="mt-1 text-3xl font-black text-white">${totalMonthly.toFixed(2)} / mo</h3>
                <p className="text-xs text-zinc-400 mt-1">{t('totalNote', { count: String(stackTools.length) })}</p>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/10 text-xs">
                <div className="flex justify-between text-zinc-300">
                  <span>{t('yourStackCost')}</span>
                  <span className="font-bold text-white">${totalMonthly.toFixed(2)} / mo</span>
                </div>

                {/* Honest ROI scenario (refactor) */}
                <div className="rounded-2xl bg-black/50 border border-white/10 p-4 space-y-3">
                  <div className="flex items-center gap-1.5 text-2xs font-bold uppercase tracking-wider text-accent-300">
                    <Sliders className="h-3 w-3" aria-hidden="true" /> {t('roiTitle')}
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-2">
                      <label htmlFor="roi-hourly" className="text-zinc-300">{t('yourTimeValue')}</label>
                      <span className="text-emerald-400 font-mono">${hourlyRate}/hr</span>
                    </div>
                    <input
                      id="roi-hourly"
                      type="range"
                      min="20"
                      max="200"
                      step="10"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(Number(e.target.value))}
                      className="w-full accent-accent-500 cursor-pointer"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: 'low' as const, label: t('lowHrs'), v: hoursSavedLow, set: setHoursSavedLow },
                      { key: 'base' as const, label: t('baseHrs'), v: hoursSavedBase, set: setHoursSavedBase },
                      { key: 'high' as const, label: t('highHrs'), v: hoursSavedHigh, set: setHoursSavedHigh },
                    ].map((s) => (
                      <div key={s.key}>
                        <div className="flex justify-between text-2xs font-bold mb-1">
                          <label htmlFor={`roi-hrs-${s.key}`} className="text-zinc-400">{s.label}</label>
                          <span className="text-zinc-300 font-mono">{s.v}</span>
                        </div>
                        <input
                          id={`roi-hrs-${s.key}`}
                          type="range"
                          min="0"
                          max="120"
                          step="5"
                          value={s.v}
                          onChange={(e) => s.set(Number(e.target.value))}
                          className="w-full accent-accent-500 cursor-pointer"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    {[
                      { label: t('low'), v: scenarioLow },
                      { label: t('base'), v: scenarioBase },
                      { label: t('high'), v: scenarioHigh },
                    ].map((s) => (
                      <div key={s.label} className="rounded-lg bg-white/5 p-2">
                        <div className="text-2xs text-zinc-500">{s.label}</div>
                        <div className="font-mono text-sm font-black text-emerald-400">${s.v.toLocaleString()}/mo</div>
                      </div>
                    ))}
                  </div>
                  <p className="text-2xs leading-relaxed text-zinc-500">{t('roiNote')}</p>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href={`/compare?tools=${selectedTools.slice(0, 3).join(',')}`}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent-500 py-3 text-xs font-bold text-black hover:bg-accent-400 transition-colors"
                >
                  <span>{t('compareCta', { count: String(Math.min(selectedTools.length, 3)) })}</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Time Saved Calculator */}
      {activeTab === 'time' && (
        <div className="mt-8 grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7 rounded-3xl border border-white/10 bg-surface-1 p-6 sm:p-8 space-y-6">
            <h2 className="text-lg font-extrabold text-white">{t('timeHeading')}</h2>

            <div className="space-y-5">
              <div>
                <div className="flex justify-between text-xs font-bold mb-2">
                  <label htmlFor="raw-hours" className="text-zinc-300">{t('rawHours')}</label>
                  <span className="text-accent-400 font-mono">{rawHours} {t('hoursUnit')}</span>
                </div>
                <input
                  id="raw-hours"
                  type="range"
                  min="1"
                  max="20"
                  value={rawHours}
                  onChange={(e) => setRawHours(Number(e.target.value))}
                  className="w-full accent-accent-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-2">
                  <label htmlFor="videos-week" className="text-zinc-300">{t('videosPerWeek')}</label>
                  <span className="text-accent-400 font-mono">{videosPerWeek} {t('videosUnit')}</span>
                </div>
                <input
                  id="videos-week"
                  type="range"
                  min="1"
                  max="14"
                  value={videosPerWeek}
                  onChange={(e) => setVideosPerWeek(Number(e.target.value))}
                  className="w-full accent-accent-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-2">
                  <label htmlFor="hourly-rate" className="text-zinc-300">{t('hourlyRate')}</label>
                  <span className="text-emerald-400 font-mono">${hourlyRate} / hr</span>
                </div>
                <input
                  id="hourly-rate"
                  type="range"
                  min="20"
                  max="200"
                  step="10"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(Number(e.target.value))}
                  className="w-full accent-accent-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-3xl border border-accent-500/30 bg-gradient-to-br from-accent-500/10 via-surface-1 to-surface-2 p-6 sm:p-8 space-y-6">
              <div>
                <span className="text-2xs font-bold uppercase tracking-wider text-accent-300">
                  {t('timeSavedLabel')}
                </span>
                <h3 className="mt-1 text-3xl font-black text-white">{hoursSavedPerWeek} {t('hoursUnit')} / week</h3>
                <p className="text-xs text-zinc-400 mt-1">{t('timeSavedSub')}</p>
              </div>

              <div className="rounded-2xl bg-black/60 border border-white/10 p-5 text-center">
                <div className="text-2xs font-bold text-zinc-500 uppercase tracking-wider">
                  {t('monthlyValue')}
                </div>
                <div className="mt-1 text-3xl font-black text-emerald-400">
                  +${monthlyDollarsSaved.toLocaleString()} / mo
                </div>
                <div className="text-2xs text-zinc-400 mt-1">
                  {t('monthlyValueNote', { rate: String(hourlyRate) })}
                </div>
              </div>

              <Link
                href="/tools"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent-500 py-3 text-xs font-bold text-black hover:bg-accent-400 transition-colors"
              >
                <span>{t('browseCta')} &rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Copyright Checker */}
      {activeTab === 'copyright' && (
        <div className="mt-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-extrabold text-white">{t('copyrightHeading')}</h2>
              <p className="text-xs text-zinc-400">{t('copyrightSub')}</p>
            </div>

            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full sm:w-72 rounded-xl border border-white/10 bg-surface-1 px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-accent-500 focus:outline-none"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCopyright.map((rule) => (
              <div
                key={rule.slug}
                className="rounded-3xl border border-white/10 bg-surface-1 p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-extrabold text-white">{rule.toolName}</span>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-2xs font-bold ${
                        rule.status === 'Allowed'
                          ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                          : rule.status === 'Restricted'
                            ? 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                            : 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                      }`}
                    >
                      {statusLabel(rule.status)}
                    </span>
                  </div>

                  <div className="space-y-2 mt-4 text-xs">
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-zinc-500">{t('freePlan')}</span>
                      <span className="font-semibold text-zinc-300">{rule.freeCommercial}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-zinc-500">{t('paidPlan')}</span>
                      <span className="font-semibold text-emerald-400">{rule.paidCommercial}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-zinc-500">{t('termsChecked')}</span>
                      <span className="font-mono tabular-nums text-zinc-400">{rule.checkedAt}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-zinc-500">{t('category')}</span>
                      <span className="font-semibold text-zinc-300">
                        {categoryLabels[rule.category] ?? rule.category}
                      </span>
                    </div>
                  </div>

                  <p className="mt-4 text-2xs text-zinc-400 leading-relaxed">{rule.notes}</p>
                </div>

                <div className="mt-5 pt-3 border-t border-white/10 space-y-1.5">
                  <a
                    href={rule.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="text-2xs font-bold text-accent-400 hover:underline flex items-center justify-between"
                  >
                    <span>{t('officialTerms')}</span>
                    <ExternalLinkIcon className="h-3 w-3" />
                  </a>
                  <Link
                    href={`/tool/${rule.slug}`}
                    className="text-2xs font-bold text-accent-400 hover:underline flex items-center justify-between"
                  >
                    <span>{t('readToolPage')}</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
          {/* Legal Disclaimer */}
          <div className="mt-8 rounded-2xl border border-amber-500/20 bg-amber-950/10 p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
              <div>
                <p className="text-sm text-amber-200/70 font-semibold">{t('notLegalAdvice')}</p>
                <p className="text-2xs text-amber-200/50 mt-1">{t('legalDisclaimer')}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
