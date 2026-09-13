'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from '@/i18n/navigation';
import { ALL_TOOLS } from '@/data/tools';
import { WORKFLOWS, getWorkflow, workflowNodeCost } from '@/data/workflows';
import {
  ARENA_CATEGORIES,
  battleOfTheWeek,
  buildCategoryBattle,
  buildWorkflowBattles,
  battleReport,
  type Battleant,
  type CategoryBattle,
  type NodeBattle,
} from '@/lib/arena';
import { SmartImage } from '@/components/SmartImage';
import { VerificationBadge } from '@/components/VerificationBadge';
import {
  Crown,
  Swords,
  CalendarDays,
  Copy,
  Check,
  ArrowRight,
  GitBranch,
  FlaskConical,
} from 'lucide-react';

type Mode = 'category' | 'workflow';

function money(cost: number): string {
  if (cost <= 0) return '';
  const r = Math.round(cost * 100) / 100;
  return `$${Number.isInteger(r) ? r : r.toFixed(2)}/mo`;
}

function priceLine(tool: { pricing: string; startingPrice?: string }, cost: number, freeLabel: string): string {
  if (tool.pricing === 'Free') return freeLabel;
  if (cost > 0) return money(cost);
  return tool.startingPrice ?? tool.pricing;
}

export function ArenaClient() {
  const t = useTranslations('arena');
  const [mode, setMode] = useState<Mode>('category');
  const [category, setCategory] = useState<string>(ARENA_CATEGORIES[0]);
  const [wfSlug, setWfSlug] = useState<string>(WORKFLOWS[0].slug);
  const [ready, setReady] = useState(false);
  const [copied, setCopied] = useState<'' | 'url' | 'report'>('');

  const weekBattle = useMemo(() => battleOfTheWeek(new Date()), []);
  const battle = useMemo(() => buildCategoryBattle(category), [category]);
  const workflow = useMemo(() => getWorkflow(wfSlug), [wfSlug]);
  const nodeBattles = useMemo(() => (workflow ? buildWorkflowBattles(workflow) : []), [workflow]);

  // Client-only workspace (URL params + clipboard): render after hydration.
  useEffect(() => {
    try {
      const q = new URLSearchParams(window.location.search);
      const c = q.get('cat');
      if (c && ARENA_CATEGORIES.includes(c)) setCategory(c);
      const w = q.get('wf');
      if (w && WORKFLOWS.some((x) => x.slug === w)) {
        setWfSlug(w);
        setMode('workflow');
      }
    } catch {
      /* non-browser env */
    }
    setReady(true);
  }, []);

  const syncUrl = (m: Mode, c: string, w: string) => {
    try {
      const params = new URLSearchParams();
      if (m === 'category') params.set('cat', c);
      else params.set('wf', w);
      window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`);
    } catch {
      /* sandboxed iframe */
    }
  };

  const flash = (kind: 'url' | 'report') => {
    setCopied(kind);
    window.setTimeout(() => setCopied(''), 2000);
  };

  const copyUrl = async (m: Mode) => {
    try {
      const params = new URLSearchParams();
      if (m === 'category') params.set('cat', category);
      else params.set('wf', wfSlug);
      await navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}?${params.toString()}`);
      flash('url');
    } catch {
      /* clipboard blocked */
    }
  };

  const copyReport = async (b: CategoryBattle) => {
    try {
      await navigator.clipboard.writeText(battleReport(b.category, b.battleants, b.verdicts));
      flash('report');
    } catch {
      /* clipboard blocked */
    }
  };

  if (!ready) return null;

  const verdictName = (b: CategoryBattle, slug?: string) =>
    b.battleants.find((a) => a.tool.slug === slug)?.tool.name ?? '—';

  const renderShareRow = (m: Mode, b?: CategoryBattle) => (
    <div className="mt-4 flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => copyUrl(m)}
        className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-surface-2 px-3.5 py-2 text-2xs font-bold text-zinc-300 hover:border-white/25 hover:text-white"
      >
        {copied === 'url' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
        {copied === 'url' ? t('urlCopied') : t('copyUrl')}
      </button>
      {b && (
        <button
          type="button"
          onClick={() => copyReport(b)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-accent-500/40 bg-accent-500/15 px-3.5 py-2 text-2xs font-bold text-accent-300 hover:bg-accent-500/25"
        >
          {copied === 'report' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied === 'report' ? t('reportCopied') : t('copyReport')}
        </button>
      )}
    </div>
  );

  const renderBattleGrid = (b: CategoryBattle) => (
    <div className="grid gap-4 md:grid-cols-3">
      {b.battleants.map((a, i) => (
        <BattleCard key={a.tool.slug} ant={a} place={i + 1} />
      ))}
    </div>
  );

  const renderVerdicts = (b: CategoryBattle) => {
    const items = [
      b.verdicts.cheapest && { icon: '💸', label: t('verdictCheapest'), name: verdictName(b, b.verdicts.cheapest) },
      b.verdicts.topRated && { icon: '⭐', label: t('verdictTopRated'), name: verdictName(b, b.verdicts.topRated) },
      b.verdicts.bestValue && { icon: '🏆', label: t('verdictBestValue'), name: verdictName(b, b.verdicts.bestValue) },
      b.verdicts.verified && { icon: '🛡️', label: t('verdictVerified'), name: verdictName(b, b.verdicts.verified) },
      b.verdicts.freeTier && { icon: '🎁', label: t('verdictFreeTier'), name: verdictName(b, b.verdicts.freeTier) },
    ].filter(Boolean) as Array<{ icon: string; label: string; name: string }>;
    if (items.length === 0) return null;
    return (
      <div className="mt-4 flex flex-wrap gap-2">
        {items.map((v) => (
          <span
            key={v.label}
            className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-2xs font-bold text-amber-200"
          >
            <Crown className="h-3 w-3 text-amber-300" />
            <span className="text-amber-300/80">{v.label}:</span> {v.name}
          </span>
        ))}
      </div>
    );
  };

  const renderNodeBattle = (nb: NodeBattle, idx: number) => {
    const primaryCost = nb.primary ? workflowNodeCost(nb.primary.slug) : 0;
    return (
      <div key={nb.nodeId} className="rounded-2xl border border-white/10 bg-surface-1 p-5">
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="font-mono text-2xs font-black text-accent-400">{t('step')} {idx + 1}</span>
          <h4 className="text-sm font-bold text-white">{nb.label}</h4>
          {nb.minutes > 0 && <span className="text-2xs text-zinc-500">· {nb.minutes} {t('minUnit')}</span>}
          {nb.manual && (
            <span className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-[9px] font-black uppercase tracking-wider text-zinc-400">
              {t('manualStep')}
            </span>
          )}
        </div>

        <div className="mt-3 flex flex-col gap-2.5 lg:flex-row">
          {nb.primary ? (
            <div className="flex-1 rounded-xl border border-accent-500/40 bg-accent-500/5 p-3.5">
              <div className="flex items-center gap-2">
                <SmartImage
                  src={nb.primary.logo}
                  alt=""
                  width={28}
                  height={28}
                  label={nb.primary.name.slice(0, 1)}
                  className="h-7 w-7 rounded-md border border-white/10 object-cover"
                />
                <Link href={`/tool/${nb.primary.slug}`} className="text-xs font-bold text-white hover:text-accent-300">
                  {nb.primary.name}
                </Link>
                <span className="ml-auto font-mono text-2xs font-bold text-emerald-400">
                  {priceLine(nb.primary, primaryCost, t('freeTool'))}
                </span>
              </div>
              <p className="mt-1.5 line-clamp-1 text-2xs text-zinc-500">{nb.primary.tagline}</p>
            </div>
          ) : (
            <div className="flex-1 rounded-xl border border-dashed border-white/15 p-3.5 text-2xs text-zinc-500">
              {t('manualStep')}
            </div>
          )}

          {nb.alternatives.length > 0 ? (
            <div className="flex flex-1 flex-col gap-2">
              {nb.alternatives.map((alt) => {
                const altCost = workflowNodeCost(alt.slug);
                const delta = nb.primary ? altCost - primaryCost : 0;
                return (
                  <div key={alt.slug} className="flex items-center gap-2 rounded-xl border border-white/10 bg-surface-2/60 px-3 py-2">
                    <SmartImage
                      src={alt.logo}
                      alt=""
                      width={24}
                      height={24}
                      label={alt.name.slice(0, 1)}
                      className="h-6 w-6 rounded border border-white/10 object-cover"
                    />
                    <Link href={`/tool/${alt.slug}`} className="min-w-0 truncate text-2xs font-bold text-zinc-200 hover:text-accent-300">
                      {alt.name}
                    </Link>
                    <span className="ml-auto flex shrink-0 items-center gap-2 font-mono text-2xs">
                      <span className="text-zinc-500">{alt.rating.toFixed(1)}</span>
                      <span className="text-emerald-400">{priceLine(alt, workflowNodeCost(alt.slug), t('freeTool'))}</span>
                      {nb.primary && (
                        <span className={delta > 0 ? 'text-rose-300' : delta < 0 ? 'text-emerald-300' : 'text-zinc-500'}>
                          {delta === 0 ? t('sameCost') : t('costDelta', { delta: `${delta > 0 ? '+' : '−'}${money(Math.abs(delta))}` })}
                        </span>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="flex-1 rounded-xl border border-dashed border-white/10 p-3 text-2xs text-zinc-600">
              {t('noAlternatives')}
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="mt-10 space-y-10">
      {/* Battle of the week */}
      {weekBattle && (
        <section className="rounded-3xl border border-amber-400/25 bg-gradient-to-br from-amber-400/10 via-surface-1 to-surface-1 p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <CalendarDays className="h-4 w-4 text-amber-300" />
            <h2 className="text-lg font-black text-white">{t('botw')}</h2>
            <span className="rounded-full border border-amber-400/40 bg-amber-400/10 px-2.5 py-0.5 font-mono text-2xs font-bold text-amber-300">
              {weekBattle.category}
            </span>
          </div>
          <div className="mt-5">{renderBattleGrid(weekBattle)}</div>
          {renderVerdicts(weekBattle)}
          {renderShareRow('category', weekBattle)}
        </section>
      )}

      {/* Mode tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        <button
          type="button"
          onClick={() => {
            setMode('category');
            syncUrl('category', category, wfSlug);
          }}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
            mode === 'category' ? 'bg-accent-500 text-black shadow-md' : 'text-zinc-400 hover:bg-white/5 hover:text-white'
          }`}
        >
          <Swords className="h-4 w-4" /> {t('modeCategory')}
        </button>
        <button
          type="button"
          onClick={() => {
            setMode('workflow');
            syncUrl('workflow', category, wfSlug);
          }}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
            mode === 'workflow' ? 'bg-accent-500 text-black shadow-md' : 'text-zinc-400 hover:bg-white/5 hover:text-white'
          }`}
        >
          <GitBranch className="h-4 w-4" /> {t('modeWorkflow')}
        </button>
      </div>

      {/* Category battles */}
      {mode === 'category' && (
        <section>
          <div className="flex flex-wrap items-center gap-3">
            <label htmlFor="arena-cat" className="text-xs font-bold text-zinc-300">
              {t('pickCategory')}
            </label>
            <select
              id="arena-cat"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                syncUrl('category', e.target.value, wfSlug);
              }}
              className="rounded-xl border border-white/10 bg-surface-2 px-3 py-2 text-xs font-bold text-white focus:border-accent-500/60 focus:outline-none"
            >
              {ARENA_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-5">
            {battle ? (
              <>
                {renderBattleGrid(battle)}
                {renderVerdicts(battle)}
              </>
            ) : (
              <p className="rounded-2xl border border-dashed border-white/10 bg-surface-1 px-4 py-8 text-center text-xs text-zinc-500">
                {t('notEnough')}
              </p>
            )}
          </div>
          {battle && renderShareRow('category', battle)}
        </section>
      )}

      {/* Workflow battles */}
      {mode === 'workflow' && (
        <section>
          <div className="flex flex-wrap items-center gap-3">
            <label htmlFor="arena-wf" className="text-xs font-bold text-zinc-300">
              {t('pickWorkflow')}
            </label>
            <select
              id="arena-wf"
              value={wfSlug}
              onChange={(e) => {
                setWfSlug(e.target.value);
                syncUrl('workflow', category, e.target.value);
              }}
              className="rounded-xl border border-white/10 bg-surface-2 px-3 py-2 text-xs font-bold text-white focus:border-accent-500/60 focus:outline-none"
            >
              {WORKFLOWS.map((w) => (
                <option key={w.slug} value={w.slug}>
                  {w.title}
                </option>
              ))}
            </select>
          </div>
          <p className="mt-2 text-2xs text-zinc-500">{t('workflowSub')}</p>
          <div className="mt-5 space-y-3">
            {nodeBattles.length > 0 ? (
              nodeBattles.map((nb, i) => renderNodeBattle(nb, i))
            ) : (
              <p className="rounded-2xl border border-dashed border-white/10 bg-surface-1 px-4 py-8 text-center text-xs text-zinc-500">
                {t('noAlternatives')}
              </p>
            )}
          </div>
          {nodeBattles.length > 0 && renderShareRow('workflow')}
        </section>
      )}
    </div>
  );
}

function BattleCard({ ant, place }: { ant: Battleant; place: number }) {
  const t = useTranslations('arena');
  return (
    <div className="relative flex flex-col rounded-2xl border border-white/10 bg-surface-2/40 p-5 transition-colors hover:border-accent-500/40">
      <span className="absolute -top-2.5 left-4 rounded-md bg-accent-500 px-2 py-0.5 font-mono text-[10px] font-black text-black">
        #{place}
      </span>
      <div className="flex items-center gap-3">
        <SmartImage
          src={ant.tool.logo}
          alt=""
          width={44}
          height={44}
          label={ant.tool.name.slice(0, 1)}
          className="h-11 w-11 rounded-xl border border-white/10 object-cover"
        />
        <div className="min-w-0">
          <Link href={`/tool/${ant.tool.slug}`} className="block truncate text-sm font-bold text-white hover:text-accent-300">
            {ant.tool.name}
          </Link>
          <Link
            href={`/tool/${ant.tool.slug}`}
            className="mt-0.5 inline-flex items-center gap-1 text-2xs font-bold text-accent-400 hover:underline"
          >
            {t('openTool')} <ArrowRight className="h-3 w-3 rtl:rotate-180" />
          </Link>
        </div>
        <span className="ml-auto font-mono text-sm font-black text-emerald-400">
          {priceLine(ant.tool, ant.cost, t('freeTool'))}
        </span>
      </div>

      <p className="mt-2.5 line-clamp-2 text-2xs leading-relaxed text-zinc-500">{ant.tool.tagline}</p>

      <dl className="mt-3 space-y-1.5 text-2xs">
        <div className="flex items-center justify-between rounded-lg bg-surface-2/70 px-2.5 py-1.5">
          <dt className="font-bold text-zinc-400">
            {t('scoreLabel')}{' '}
            <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-600">
              ({ant.scoreLabel === 'community' ? t('scoreCommunity') : t('scoreEditorial')})
            </span>
          </dt>
          <dd className="font-mono font-black text-white">{ant.tool.rating.toFixed(1)}</dd>
        </div>
        <div className="flex items-center justify-between rounded-lg bg-surface-2/70 px-2.5 py-1.5">
          <dt className="font-bold text-zinc-400">{t('valueLabel')}</dt>
          <dd className="font-mono font-black text-accent-300">
            {ant.valueScore}
            <span className="text-zinc-600">/100</span>
          </dd>
        </div>
        <div className="flex items-center justify-between rounded-lg bg-surface-2/70 px-2.5 py-1.5">
          <dt className="flex items-center gap-1 font-bold text-zinc-400">
            <FlaskConical className="h-3 w-3" /> {t('labLabel')}
          </dt>
          <dd className="font-mono font-black">
            {ant.labScore != null ? (
              <span className="text-emerald-300">{ant.labScore.toFixed(1)}</span>
            ) : (
              <span className="text-zinc-600">{t('labNone')}</span>
            )}
          </dd>
        </div>
      </dl>

      {ant.tool.bestFor && (
        <p className="mt-2.5 text-2xs leading-relaxed text-zinc-400">
          <span className="font-bold text-zinc-500">{t('bestForLabel')}: </span>
          {ant.tool.bestFor}
        </p>
      )}

      <div className="mt-auto pt-3">
        <VerificationBadge level={ant.tool.verificationLevel} compact />
      </div>
    </div>
  );
}
