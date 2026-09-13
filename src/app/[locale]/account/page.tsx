'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import Link from '@/i18n/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ToolCard } from '@/components/ToolCard';
import { CompareBar } from '@/components/CompareBar';
import { SmartImage } from '@/components/SmartImage';
import { useAuth, useBookmarks } from '@/context/AppProviders';
import { supabase } from '@/lib/supabase';
import { ALL_TOOLS } from '@/data/tools';
import {
  Bookmark,
  LogOut,
  User as UserIcon,
  Sparkles,
  Zap,
  ShieldCheck,
  CreditCard,
  ExternalLink,
  Copy,
  Check,
  Clock,
  GitBranch,
  Layers,
  Flame,
  ArrowRight,
  Trash2,
  Gauge,
  Wallet,
  TrendingUp,
  Puzzle,
  Radar,
} from 'lucide-react';
import { runAdvisor } from '@/lib/advisor';
import { computeStackHealth } from '@/lib/stackHealth';
import { RadarTab } from './RadarTab';

interface AccountSummary {
  email: string;
  isStudioPro: boolean;
  studioPlan: string;
  dailyQuota: { limit: number; used: number; remaining: number };
  orders: Array<{
    id: string;
    tool_name: string;
    plan: string;
    amount_usd: number;
    crypto_currency: string;
    tx_hash?: string;
    status: string;
    created_at: string;
  }>;
  submissions: Array<{
    id: string;
    tool_name: string;
    category: string;
    status: string;
    created_at: string;
  }>;
  claimedTools: Array<{
    name: string;
    slug: string;
    category: string;
    verificationLevel: string;
    isFeatured: boolean;
    hasFounderBadge: boolean;
    badgeSnippet: string;
  }>;
}

export default function AccountPage() {
  const t = useTranslations('account');
  const tMy = useTranslations('my');
  const { user, loading, signOut } = useAuth();
  const { bookmarks } = useBookmarks();

  const [activeTab, setActiveTab] = useState<'overview' | 'radar' | 'bookmarks' | 'stacks' | 'subscription' | 'founder' | 'orders'>('overview');
  const [summary, setSummary] = useState<AccountSummary | null>(null);
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  // Local workspace (guest-friendly): saved stacks + advisor plans.
  const [savedStacks, setSavedStacks] = useState<Array<{ id: string; name: string; goal: string; budget: string; picks: Record<number, string>; savedAt: string }>>([]);
  const [advisorPlans, setAdvisorPlans] = useState<Array<{ id: string; name: string; answers: Record<string, string>; savedAt: string }>>([]);
  const [savedWorkflows, setSavedWorkflows] = useState<Array<{ id: string; name: string; slug: string; picks: Record<string, string>; savedAt: string }>>([]);
  const [wsLoaded, setWsLoaded] = useState(false);

  useEffect(() => {
    try {
      const s = localStorage.getItem('noxifera_saved_stacks');
      if (s) setSavedStacks(JSON.parse(s).filter((x: { id?: string }) => x && typeof x.id === 'string'));
      const p = localStorage.getItem('noxifera_advisor_saves');
      if (p) setAdvisorPlans(JSON.parse(p).filter((x: { id?: string }) => x && typeof x.id === 'string'));
      const w = localStorage.getItem('noxifera_workflows');
      if (w) setSavedWorkflows(JSON.parse(w).filter((x: { id?: string }) => x && typeof x.id === 'string'));
    } catch {
      /* corrupted storage — show empty */
    }
    setWsLoaded(true);
  }, []);

  const deleteSavedWorkflow = (id: string) =>
    setSavedWorkflows((cur) => {
      const next = cur.filter((s) => s.id !== id);
      try {
        localStorage.setItem('noxifera_workflows', JSON.stringify(next));
      } catch {
        /* fine */
      }
      return next;
    });

  const deleteSavedStack = (id: string) =>
    setSavedStacks((cur) => {
      const next = cur.filter((s) => s.id !== id);
      try {
        localStorage.setItem('noxifera_saved_stacks', JSON.stringify(next));
      } catch {
        /* fine */
      }
      return next;
    });

  const deleteAdvisorPlan = (id: string) =>
    setAdvisorPlans((cur) => {
      const next = cur.filter((s) => s.id !== id);
      try {
        localStorage.setItem('noxifera_advisor_saves', JSON.stringify(next));
      } catch {
        /* fine */
      }
      return next;
    });

  useEffect(() => {
    // The summary API is session-verified (no ?email= identity): attach the
    // Supabase access token when we have a real session. Fake/local dev
    // sessions have no token and simply get a 401 → limited offline view.
    const load = async () => {
      try {
        const session = supabase ? (await supabase.auth.getSession()).data.session : null;
        if (!session?.access_token) {
          setSummary(null);
          return;
        }
        const r = await fetch('/api/account/summary', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (!r.ok) {
          setSummary(null);
          return;
        }
        setSummary(await r.json());
      } catch {
        setSummary(null);
      }
    };
    void load();
  }, [user]);

  const saved = bookmarks
    .map((slug) => ALL_TOOLS.find((t) => t.slug === slug))
    .filter((t): t is NonNullable<typeof t> => Boolean(t));

  // Personal Dashboard (roadmap §42 #12) — deterministic, computed from the
  // same localStorage sources the other tabs read. Empty on first paint
  // (matches SSR), filled by the workspace effect above.
  const health = useMemo(
    () =>
      computeStackHealth({
        savedToolSlugs: bookmarks,
        savedStacks,
        savedWorkflows,
        savedPlanCount: advisorPlans.length,
      }),
    [bookmarks, savedStacks, savedWorkflows, advisorPlans]
  );

  const copyCode = (slug: string, snippet: string) => {
    navigator.clipboard.writeText(snippet);
    setCopiedSnippet(slug);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  const isPro = summary?.isStudioPro || false;
  const quota = summary?.dailyQuota || { limit: 3, used: 1, remaining: 2 };

  return (
    <div className="min-h-screen bg-surface-0 text-white">
      <Header />

      <main id="main" className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        {/* User Hero Header */}
        <div className="mb-10 rounded-3xl border border-white/10 bg-surface-1 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-5">
              <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-accent-500 to-fuchsia-500 text-2xl font-black text-black shadow-lg">
                {user ? (user.email || 'U')[0].toUpperCase() : <UserIcon className="h-7 w-7 text-black" />}
                <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-surface-1 bg-emerald-400" />
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-black text-white">{t('headingMain')}</h1>
                  {isPro ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-cyan-400/50 bg-cyan-400/20 px-2.5 py-0.5 font-mono text-[10px] font-black uppercase tracking-wider text-cyan-300">
                      <Zap className="h-3 w-3 fill-cyan-300" /> Studio Pro Active
                    </span>
                  ) : (
                    <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 font-mono text-[10px] font-bold text-zinc-400">
                      Free Creator Tier
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-zinc-400">
                  {loading ? t('loading') : user ? user.email : t('guest')}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {user ? (
                <button
                  type="button"
                  onClick={signOut}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-surface-2 px-4 py-2.5 text-xs font-bold text-zinc-300 hover:border-white/20 hover:text-white transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" /> {t('signOut')}
                </button>
              ) : (
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-xl bg-accent-500 px-5 py-2.5 text-xs font-bold text-black hover:bg-accent-400 transition-colors shadow-lg"
                >
                  <Sparkles className="h-3.5 w-3.5" /> {t('signInSync')}
                </Link>
              )}
            </div>
          </div>

          {/* Stat Cards Grid */}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-surface-2/60 p-4">
              <span className="flex items-center gap-1.5 text-2xs font-bold uppercase tracking-wider text-zinc-500">
                <Zap className="h-3.5 w-3.5 text-cyan-400" /> Daily AI Quota
              </span>
              <p className="mt-1 font-mono text-xl font-black text-cyan-300">
                {quota.remaining} <span className="text-2xs text-zinc-500">/ {quota.limit} runs</span>
              </p>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full bg-cyan-400 transition-all duration-500"
                  style={{ width: `${(quota.remaining / quota.limit) * 100}%` }}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-surface-2/60 p-4">
              <span className="flex items-center gap-1.5 text-2xs font-bold uppercase tracking-wider text-zinc-500">
                <Bookmark className="h-3.5 w-3.5 text-accent-400" /> Bookmarks
              </span>
              <p className="mt-1 font-mono text-xl font-black text-white">{saved.length}</p>
              <p className="mt-1 text-2xs text-zinc-500">Saved creator tools</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-surface-2/60 p-4">
              <span className="flex items-center gap-1.5 text-2xs font-bold uppercase tracking-wider text-zinc-500">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Founder Status
              </span>
              <p className="mt-1 font-mono text-sm font-bold text-emerald-300">
                {summary?.claimedTools?.length ? `${summary.claimedTools.length} Tool Claimed` : 'No Tools Claimed'}
              </p>
              <Link href="/founders" className="mt-1 inline-block text-2xs text-accent-400 hover:underline">
                Claim your tool →
              </Link>
            </div>

            <div className="rounded-2xl border border-white/10 bg-surface-2/60 p-4">
              <span className="flex items-center gap-1.5 text-2xs font-bold uppercase tracking-wider text-zinc-500">
                <CreditCard className="h-3.5 w-3.5 text-fuchsia-400" /> Invoices / Orders
              </span>
              <p className="mt-1 font-mono text-xl font-black text-white">
                {summary?.orders?.length || 0}
              </p>
              <p className="mt-1 text-2xs text-zinc-500">Completed & pending</p>
            </div>
          </div>
        </div>

        {/* Dashboard Tabs Header */}
        <div className="mb-8 flex items-center gap-2 overflow-x-auto border-b border-white/10 pb-3 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
              activeTab === 'overview'
                ? 'bg-accent-500 text-black shadow-md'
                : 'text-zinc-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Gauge className="h-4 w-4" />
            <span>{t('overviewTab')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('radar')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
              activeTab === 'radar'
                ? 'bg-accent-500 text-black shadow-md'
                : 'text-zinc-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Radar className="h-4 w-4" />
            <span>{t('radarTab')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('bookmarks')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
              activeTab === 'bookmarks'
                ? 'bg-accent-500 text-black shadow-md'
                : 'text-zinc-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Bookmark className="h-4 w-4" />
            <span>Saved Tools ({saved.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('stacks')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
              activeTab === 'stacks'
                ? 'bg-accent-500 text-black shadow-md'
                : 'text-zinc-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>
              {t('stacksTab', { count: String(savedStacks.length + advisorPlans.length + savedWorkflows.length) })}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('subscription')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
              activeTab === 'subscription'
                ? 'bg-accent-500 text-black shadow-md'
                : 'text-zinc-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Zap className="h-4 w-4" />
            <span>Subscriptions & AI Quota</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('founder')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
              activeTab === 'founder'
                ? 'bg-accent-500 text-black shadow-md'
                : 'text-zinc-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Founder Portal ({summary?.claimedTools?.length || 0})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
              activeTab === 'orders'
                ? 'bg-accent-500 text-black shadow-md'
                : 'text-zinc-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <CreditCard className="h-4 w-4" />
            <span>Orders & Billing ({summary?.orders?.length || 0})</span>
          </button>
        </div>

        {/* Tab 0: Personal Dashboard (roadmap §42 #12) */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-lg font-bold text-white">{t('overviewTitle')}</h2>
              <p className="text-xs text-zinc-400">{t('overviewSub')}</p>
            </div>

            {health.tools.length === 0 ? (
              <div className="flex flex-col items-center rounded-3xl border border-dashed border-white/10 bg-surface-1 py-16 text-center">
                <div className="mb-3 text-4xl">🧭</div>
                <h3 className="text-base font-bold">{t('emptyTitle')}</h3>
                <p className="mt-1 max-w-md text-xs text-zinc-500">{t('emptySub')}</p>
                <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                  <Link
                    href="/advisor"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-accent-500 px-5 py-2.5 text-xs font-bold text-black hover:bg-accent-400 transition-colors shadow-lg"
                  >
                    <Sparkles className="h-3.5 w-3.5" /> {t('ctaAdvisor')}
                  </Link>
                  <Link
                    href="/stack-builder"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-surface-2 px-5 py-2.5 text-xs font-bold text-zinc-200 hover:border-white/25 hover:text-white transition-colors"
                  >
                    <Layers className="h-3.5 w-3.5" /> {t('ctaStack')}
                  </Link>
                  <Link
                    href="/workflows"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-surface-2 px-5 py-2.5 text-xs font-bold text-zinc-200 hover:border-white/25 hover:text-white transition-colors"
                  >
                    <GitBranch className="h-3.5 w-3.5" /> {t('ctaWorkflows')}
                  </Link>
                </div>
              </div>
            ) : (
              <>
                {/* System stats */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-2xl border border-white/10 bg-surface-1 p-4">
                    <span className="flex items-center gap-1.5 text-2xs font-bold uppercase tracking-wider text-zinc-500">
                      <Wallet className="h-3.5 w-3.5 text-emerald-400" /> {t('statCost')}
                    </span>
                    <p className="mt-1 font-mono text-xl font-black text-emerald-300">
                      ${health.monthlyCost.toFixed(2)}
                      <span className="text-2xs font-normal text-zinc-500">/mo</span>
                    </p>
                    <p className="mt-1 text-2xs text-zinc-500">
                      {t('costSub', { count: String(health.tools.length) })}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-surface-1 p-4">
                    <span className="flex items-center gap-1.5 text-2xs font-bold uppercase tracking-wider text-zinc-500">
                      <TrendingUp className="h-3.5 w-3.5 text-cyan-400" /> {t('statCoverage')}
                    </span>
                    <p className="mt-1 font-mono text-xl font-black text-cyan-300">{health.coverage}%</p>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full bg-cyan-400 transition-all duration-500"
                        style={{ width: `${health.coverage}%` }}
                      />
                    </div>
                    <p className="mt-1.5 text-2xs text-zinc-500">
                      {t('coverageSub', {
                        covered: String(health.categoriesCovered.length),
                        total: String(health.totalCategories),
                      })}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-surface-1 p-4">
                    <span className="flex items-center gap-1.5 text-2xs font-bold uppercase tracking-wider text-zinc-500">
                      <Puzzle className="h-3.5 w-3.5 text-amber-400" /> {t('statOverlap')}
                    </span>
                    <p
                      className={`mt-1 font-mono text-xl font-black ${
                        health.redundancy > 0 ? 'text-amber-300' : 'text-emerald-300'
                      }`}
                    >
                      {health.redundancy}%
                    </p>
                    <p className="mt-1 text-2xs text-zinc-500">
                      {health.redundantGroups.length > 0
                        ? t('overlapGroupsSub', { count: String(health.redundantGroups.length) })
                        : t('overlapClean')}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-surface-1 p-4">
                    <span className="flex items-center gap-1.5 text-2xs font-bold uppercase tracking-wider text-zinc-500">
                      <Gauge className="h-3.5 w-3.5 text-fuchsia-400" /> {t('statMaturity')}
                    </span>
                    <p className="mt-1 font-mono text-xl font-black text-fuchsia-300">
                      {health.maturity}
                      <span className="text-2xs font-normal text-zinc-500">/100</span>
                    </p>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full bg-fuchsia-400 transition-all duration-500"
                        style={{ width: `${health.maturity}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Maturity breakdown */}
                <div className="flex flex-wrap gap-2">
                  {[
                    { on: health.maturityFlags.hasWorkflows, label: t('flagWorkflows'), pts: 40 },
                    { on: health.maturityFlags.hasStacks, label: t('flagStacks'), pts: 25 },
                    { on: health.maturityFlags.hasPlans, label: t('flagPlans'), pts: 20 },
                    { on: health.maturityFlags.hasSavedTools, label: t('flagTools'), pts: 15 },
                  ].map((f) => (
                    <span
                      key={f.label}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-2xs font-bold ${
                        f.on
                          ? 'border-fuchsia-400/40 bg-fuchsia-400/10 text-fuchsia-300'
                          : 'border-white/10 bg-white/5 text-zinc-500'
                      }`}
                    >
                      {f.on ? '✓' : '·'} {f.label}
                      <span className="font-mono opacity-70">+{f.pts}</span>
                    </span>
                  ))}
                </div>

                {/* Overlap warnings */}
                {health.redundantGroups.length > 0 && (
                  <div className="rounded-3xl border border-amber-400/20 bg-amber-400/5 p-6">
                    <h3 className="flex items-center gap-2 text-sm font-bold text-amber-300">
                      <Puzzle className="h-4 w-4" /> {t('overlapTitle')}
                    </h3>
                    <ul className="mt-3 space-y-2">
                      {health.redundantGroups.map((g) => (
                        <li key={g.category} className="text-xs leading-relaxed text-zinc-300">
                          {t('overlapGroup', { count: String(g.tools.length), category: g.category })}{' '}
                          <span className="font-bold text-white">
                            {g.tools.map((x) => x.name).join(' + ')}
                          </span>
                          <span className="text-zinc-500"> — {t('overlapHint')}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Gap recommendations */}
                {health.recommended.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-white">{t('gapsTitle')}</h3>
                    <p className="mt-0.5 text-2xs text-zinc-500">{t('gapsSub')}</p>
                    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      {health.recommended.map((rec) => (
                        <Link
                          key={rec.tool.slug}
                          href={`/tool/${rec.tool.slug}`}
                          className="group rounded-2xl border border-white/10 bg-surface-1 p-4 transition-all hover:border-accent-500/50"
                        >
                          <div className="flex items-center gap-2">
                            <SmartImage
                              src={rec.tool.logo}
                              alt=""
                              width={24}
                              height={24}
                              label={rec.tool.name.slice(0, 1)}
                              className="h-6 w-6 rounded-md border border-white/10 object-cover"
                            />
                            <p className="min-w-0 truncate text-xs font-bold text-white group-hover:text-accent-300">
                              {rec.tool.name}
                            </p>
                          </div>
                          <p className="mt-1.5 text-2xs font-bold uppercase tracking-wider text-zinc-500">
                            {rec.category}
                          </p>
                          <p className="mt-1.5 line-clamp-2 text-2xs leading-relaxed text-zinc-400">
                            {rec.tool.tagline}
                          </p>
                          <p className="mt-2 font-mono text-2xs font-bold text-emerald-400">
                            {rec.tool.pricing === 'Free'
                              ? t('freeTool')
                              : (rec.tool.startingPrice ?? rec.tool.pricing)}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick actions */}
                <div>
                  <h3 className="text-sm font-bold text-white">{t('quickTitle')}</h3>
                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                      { href: '/advisor', icon: Sparkles, title: t('quickAdvisor'), desc: t('quickAdvisorDesc') },
                      { href: '/stack-builder', icon: Layers, title: t('quickStack'), desc: t('quickStackDesc') },
                      { href: '/workflows', icon: GitBranch, title: t('quickWorkflows'), desc: t('quickWorkflowsDesc') },
                      { href: '/optimizer', icon: Wallet, title: t('quickOptimizer'), desc: t('quickOptimizerDesc') },
                    ].map((a) => (
                      <Link
                        key={a.href}
                        href={a.href}
                        className="group flex items-start gap-3 rounded-2xl border border-white/10 bg-surface-1 p-4 transition-all hover:border-accent-500/50"
                      >
                        <a.icon className="mt-0.5 h-4 w-4 shrink-0 text-accent-400" />
                        <span className="min-w-0">
                          <span className="flex items-center gap-1 text-xs font-bold text-white group-hover:text-accent-300">
                            {a.title} <ArrowRight className="h-3 w-3 rtl:rotate-180" />
                          </span>
                          <span className="mt-0.5 block text-2xs text-zinc-500">{a.desc}</span>
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Tab 0b: Personal AI Radar (roadmap §42 #13) */}
        {activeTab === 'radar' && <RadarTab />}

        {/* Tab 1: Saved Bookmarks */}
        {activeTab === 'bookmarks' && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Your Bookmarked AI Tools</h2>
                <p className="text-xs text-zinc-400">Quickly access and compare your saved video software.</p>
              </div>
              <span className="flex shrink-0 flex-col items-end gap-1">
                <Link href="/my?tab=tools" className="text-xs font-bold text-accent-400 hover:underline">
                  {tMy('openMy')} →
                </Link>
                <Link href="/tools" className="text-xs font-bold text-zinc-500 hover:underline">
                  Explore More Tools →
                </Link>
              </span>
            </div>

            {saved.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {saved.map((tool, i) => (
                  <ToolCard key={tool.slug} tool={tool} index={i} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center rounded-3xl border border-dashed border-white/10 bg-surface-1 py-16 text-center">
                <div className="mb-3 text-4xl">🔖</div>
                <h3 className="text-base font-bold">{t('nothingSaved')}</h3>
                <p className="mt-1 max-w-sm text-xs text-zinc-500">{t('nothingSavedSub')}</p>
                <Link
                  href="/tools"
                  className="mt-5 rounded-xl bg-accent-500 px-5 py-2.5 text-xs font-bold text-black hover:bg-accent-400 transition-colors"
                >
                  {t('browseTools', { count: String(ALL_TOOLS.length) })}
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Tab: Stacks & Advisor plans */}
        {activeTab === 'stacks' && (
          <div className="space-y-10">
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">{t('stacksHeading')}</h2>
                <span className="flex shrink-0 flex-col items-end gap-1">
                  <Link href="/my?tab=stacks" className="text-xs font-bold text-accent-400 hover:underline">
                    {tMy('openMy')} →
                  </Link>
                  <Link href="/stack-builder" className="text-xs font-bold text-zinc-500 hover:underline">
                    {t('buildNew')} →
                  </Link>
                </span>
              </div>
              {savedStacks.length > 0 ? (
                <ul className="space-y-2">
                  {savedStacks.map((s) => {
                    const maxI = Math.max(0, ...Object.keys(s.picks).map(Number));
                    const pickArr = Array.from({ length: maxI + 1 }, (_, i) => s.picks[i] ?? '');
                    const href = `/stack-builder?goal=${s.goal}&budget=${s.budget}&pick=${pickArr.join(',')}`;
                    return (
                      <li
                        key={s.id}
                        className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-surface-1 px-5 py-4"
                      >
                        <Layers className="h-4 w-4 shrink-0 text-accent-400" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-zinc-100">{s.name}</p>
                          <p className="text-2xs text-zinc-500">
                            {t('stackMeta', { goal: s.goal, budget: s.budget })} ·{' '}
                            {new Date(s.savedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Link
                          href={href}
                          className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-2xs font-bold text-zinc-200 hover:border-accent-500/50 hover:text-accent-300"
                        >
                          {t('openStack')}
                          <ArrowRight className="h-3 w-3 rtl:rotate-180" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => deleteSavedStack(s.id)}
                          className="rounded-lg p-2 text-zinc-600 hover:bg-white/5 hover:text-rose-300"
                          aria-label={t('delete')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="rounded-3xl border border-dashed border-white/10 bg-surface-1 py-10 text-center">
                  <p className="text-xs text-zinc-500">{t('noStacks')}</p>
                </div>
              )}
            </div>

            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">{t('plansHeading')}</h2>
                <Link href="/advisor" className="text-xs font-bold text-accent-400 hover:underline">
                  {t('runAdvisor')} →
                </Link>
              </div>
              {advisorPlans.length > 0 ? (
                <ul className="space-y-2">
                  {advisorPlans.map((p) => {
                    let cost = 0;
                    try {
                      cost = runAdvisor(p.answers as never).monthlyTotal;
                    } catch {
                      /* stale answers — skip cost */
                    }
                    return (
                      <li
                        key={p.id}
                        className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-surface-1 px-5 py-4"
                      >
                        <Sparkles className="h-4 w-4 shrink-0 text-accent-400" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-zinc-100">{p.name}</p>
                          <p className="text-2xs text-zinc-500">
                            {new Date(p.savedAt).toLocaleDateString()}
                            {cost > 0 && (
                              <span className="font-mono tabular-nums text-emerald-400">
                                {' '}
                                · ${cost.toFixed(0)}/mo
                              </span>
                            )}
                          </p>
                        </div>
                        <Link
                          href="/advisor"
                          className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-2xs font-bold text-zinc-200 hover:border-accent-500/50 hover:text-accent-300"
                        >
                          {t('openPlan')}
                          <ArrowRight className="h-3 w-3 rtl:rotate-180" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => deleteAdvisorPlan(p.id)}
                          className="rounded-lg p-2 text-zinc-600 hover:bg-white/5 hover:text-rose-300"
                          aria-label={t('delete')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="rounded-3xl border border-dashed border-white/10 bg-surface-1 py-10 text-center">
                  <p className="text-xs text-zinc-500">{t('noPlans')}</p>
                </div>
              )}
            </div>

            <div>
              <h2 className="text-lg font-bold text-white">{t('workflowsHeading')}</h2>
              {savedWorkflows.length > 0 ? (
                <ul className="mt-4 space-y-2">
                  {savedWorkflows.map((s) => (
                    <li
                      key={s.id}
                      className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-surface-1 px-5 py-4"
                    >
                      <GitBranch className="h-4 w-4 shrink-0 text-accent-400" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-zinc-100">{s.name}</p>
                        <p className="text-2xs text-zinc-500">{new Date(s.savedAt).toLocaleDateString()}</p>
                      </div>
                      <Link
                        href={`/workflows/${s.slug}${
                          Object.keys(s.picks).length > 0
                            ? `?pick=${Object.entries(s.picks).map(([id, sl]) => `${id}:${sl}`).join(',')}`
                            : ''
                        }`}
                        className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-2xs font-bold text-zinc-200 hover:border-accent-500/50 hover:text-accent-300"
                      >
                        {t('openStack')}
                        <ArrowRight className="h-3 w-3 rtl:rotate-180" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => deleteSavedWorkflow(s.id)}
                        className="rounded-lg p-2 text-zinc-600 hover:bg-white/5 hover:text-rose-300"
                        aria-label={t('delete')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="mt-4 rounded-3xl border border-dashed border-white/10 bg-surface-1 py-10 text-center">
                  <p className="text-xs text-zinc-500">{t('noWorkflows')}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Subscription & AI Quota */}
        {activeTab === 'subscription' && (
          <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
            <div className="rounded-3xl border border-white/10 bg-surface-1 p-6 sm:p-8">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/40 bg-cyan-400/10 px-3 py-1 font-mono text-2xs font-extrabold uppercase text-cyan-300">
                ACTIVE PLAN
              </span>
              <h3 className="mt-3 text-2xl font-black text-white">
                {isPro ? 'Studio Pro Unlimited' : 'Free Creator Membership'}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                {isPro
                  ? 'Studio Pro: 50 Studio runs per day on the AI-assisted utilities (Prompt Builder, Thumbnail Brief, Thumbnail Text). Local utilities — calendar, subtitles, audio, image, video — are unlimited for everyone.'
                  : 'Free tier: 3 Studio runs per day on AI-assisted utilities, plus unlimited use of all 5 local utilities. Upgrade for $4.99/mo to unlock 50 runs/day.'}
              </p>

              <div className="mt-6 rounded-2xl bg-surface-2 p-4">
                <div className="flex items-center justify-between text-xs font-bold text-zinc-300">
                  <span>Daily Quota Status:</span>
                  <span className="font-mono text-cyan-300">
                    {quota.remaining} / {quota.limit} remaining
                  </span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-accent-400"
                    style={{ width: `${(quota.remaining / quota.limit) * 100}%` }}
                  />
                </div>
              </div>

              {!isPro && (
                <Link
                  href="/ai-studio/upgrade"
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-accent-400 py-3.5 text-xs font-bold text-black shadow-lg hover:opacity-90"
                >
                  <Zap className="h-4 w-4 fill-black" /> Upgrade to Studio Pro ($4.99)
                </Link>
              )}

              {/* 1-Click Newsletter & Deal Drops Toggle */}
              <div className="mt-6 border-t border-white/10 pt-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>📬</span> Weekly AI Tool Drops & Deal Alerts
                    </h4>
                    <p className="text-[11px] text-zinc-400">Receive weekly tested AI video tool roundups</p>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!user?.email) return;
                      await fetch('/api/newsletter', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: user.email, source: 'account_dashboard' }),
                      });
                      alert('✅ Subscribed! Check your inbox for confirmation.');
                    }}
                    className="rounded-xl border border-accent-500/40 bg-accent-500/15 px-3 py-1.5 text-2xs font-bold text-accent-300 hover:bg-accent-500/25"
                  >
                    Subscribe Alerts
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-surface-1 p-6 sm:p-8">
              <h3 className="text-lg font-bold text-white mb-4">Quick Access to AI Creator Tools</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { name: 'Prompt Builder', href: '/ai-studio/prompt-builder', desc: 'Cinematic 8K image & video prompts' },
                  { name: 'Thumbnail Brief', href: '/ai-studio/thumbnail-brief', desc: 'Design strategies & CTR checklists' },
                  { name: 'Viral Title & Hooks', href: '/ai-studio/thumbnail-text', desc: '10 High-CTR YouTube formulas' },
                  { name: 'Content Calendar', href: '/ai-studio/content-calendar', desc: '30-Day production schedules' },
                  { name: 'Subtitle Formatter', href: '/ai-studio/subtitle-tools', desc: 'SRT & WebVTT clean converter' },
                  { name: 'Video Inspector', href: '/ai-studio/video-inspector', desc: 'Resolution, aspect ratio & posters' },
                ].map((tool) => (
                  <Link
                    key={tool.name}
                    href={tool.href}
                    className="group rounded-2xl border border-white/10 bg-surface-2/60 p-4 transition-all hover:border-cyan-400/40 hover:bg-surface-2"
                  >
                    <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 flex items-center justify-between">
                      {tool.name} <ArrowRight className="h-3 w-3" />
                    </h4>
                    <p className="mt-1 text-[11px] text-zinc-400">{tool.desc}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Founder Portal */}
        {activeTab === 'founder' && (
          <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-5">
              <div>
                <h2 className="text-lg font-bold text-white">Your Claimed & Submitted Tools</h2>
                <p className="text-xs text-zinc-400">
                  Manage official verification badges, copy embed codes, and boost your tool.
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  href="/founders"
                  className="rounded-xl border border-white/10 bg-surface-2 px-4 py-2.5 text-xs font-bold text-zinc-300 hover:text-white"
                >
                  Claim Profile
                </Link>
                <Link
                  href="/submit"
                  className="rounded-xl bg-accent-500 px-4 py-2.5 text-xs font-bold text-black hover:bg-accent-400"
                >
                  Submit New Tool
                </Link>
              </div>
            </div>

            {summary?.claimedTools && summary.claimedTools.length > 0 ? (
              <div className="space-y-4">
                {summary.claimedTools.map((tool) => (
                  <div
                    key={tool.slug}
                    className="rounded-3xl border border-white/10 bg-surface-1 p-6 sm:p-8 shadow-xl"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between border-b border-white/10 pb-6">
                      <div>
                        <div className="flex items-center gap-2.5">
                          <h3 className="text-xl font-bold text-white">{tool.name}</h3>
                          <span className="rounded-md border border-accent-500/30 bg-accent-500/10 px-2.5 py-0.5 font-mono text-2xs font-bold text-accent-300">
                            {tool.category}
                          </span>
                          {tool.isFeatured && (
                            <span className="rounded-md bg-fuchsia-500/20 text-fuchsia-300 px-2 py-0.5 font-mono text-2xs font-bold">
                              FEATURED (6 MO)
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-zinc-400">
                          Slug: <code className="text-emerald-300">{tool.slug}</code> · Level:{' '}
                          <strong className="text-white">{tool.verificationLevel}</strong>
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/tool/${tool.slug}`}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-surface-2 px-3.5 py-2 text-2xs font-bold text-zinc-300 hover:text-white"
                        >
                          View Tool Page <ExternalLink className="h-3 w-3" />
                        </Link>
                        {!tool.isFeatured && (
                          <Link
                            href="/submit"
                            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-fuchsia-500 to-accent-500 px-4 py-2 text-2xs font-bold text-black"
                          >
                            <Flame className="h-3.5 w-3.5" /> Boost to Featured ($99)
                          </Link>
                        )}
                      </div>
                    </div>

                    {/* Embed Badge Snippet */}
                    <div className="mt-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-zinc-300">
                          Official Embeddable Badge Code (HTML snippet for your website footer):
                        </span>
                        <button
                          type="button"
                          onClick={() => copyCode(tool.slug, tool.badgeSnippet)}
                          className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-surface-2 px-3 py-1 text-2xs font-bold text-accent-300 hover:bg-white/5"
                        >
                          {copiedSnippet === tool.slug ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                          {copiedSnippet === tool.slug ? 'Copied' : 'Copy Embed Code'}
                        </button>
                      </div>
                      <pre className="overflow-x-auto rounded-xl bg-black/70 border border-white/10 p-3.5 text-2xs font-mono text-accent-300 leading-relaxed">
                        {tool.badgeSnippet}
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-white/10 bg-surface-1 p-12 text-center">
                <ShieldCheck className="mx-auto mb-3 h-10 w-10 text-zinc-600" />
                <h3 className="text-base font-bold text-white">No Claimed Tools Yet</h3>
                <p className="mt-1 text-xs text-zinc-400 max-w-md mx-auto">
                  Are you the creator of an AI video tool? Claim ownership of your profile at /founders to manage your pricing and get the official founder verification badge.
                </p>
                <Link
                  href="/founders"
                  className="mt-5 inline-block rounded-xl bg-accent-500 px-5 py-2.5 text-xs font-bold text-black hover:bg-accent-400"
                >
                  Claim Your Tool Profile
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Orders & Invoices History */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white">Orders & Payment Invoices</h2>
              <p className="text-xs text-zinc-400">Track your past promotions, subscriptions, and transaction statuses.</p>
            </div>

            {summary?.orders && summary.orders.length > 0 ? (
              <div className="space-y-3">
                {summary.orders.map((ord) => {
                  const isTon = ord.crypto_currency?.includes('TON');
                  const explorerUrl = ord.tx_hash
                    ? isTon
                      ? `https://tonviewer.com/transaction/${ord.tx_hash}`
                      : `https://tronscan.org/#/transaction/${ord.tx_hash}`
                    : null;

                  return (
                    <div
                      key={ord.id}
                      className="rounded-2xl border border-white/10 bg-surface-1 p-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-white">{ord.tool_name}</h3>
                          <span className="rounded bg-accent-500/20 text-accent-300 px-2 py-0.5 font-mono text-2xs font-bold">
                            {ord.plan.toUpperCase()}
                          </span>
                          <span
                            className={`rounded px-2 py-0.5 font-mono text-2xs font-bold ${
                              ord.status === 'confirmed'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : ord.status === 'submitted'
                                ? 'bg-sky-500/20 text-sky-300'
                                : 'bg-amber-500/20 text-amber-300'
                            }`}
                          >
                            {ord.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="mt-1 text-2xs text-zinc-400">
                          Date: {new Date(ord.created_at).toLocaleString()} · Currency: {ord.crypto_currency}
                        </p>
                        {ord.tx_hash && (
                          <p className="mt-1 text-2xs text-zinc-500">
                            TXID: <code className="text-emerald-300">{ord.tx_hash.slice(0, 20)}...</code>
                            {explorerUrl && (
                              <a
                                href={explorerUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-2 text-accent-400 hover:underline inline-flex items-center gap-1"
                              >
                                View Explorer <ExternalLink className="h-2.5 w-2.5" />
                              </a>
                            )}
                          </p>
                        )}
                      </div>

                      <div className="text-right">
                        <span className="font-mono text-xl font-black text-emerald-400">${ord.amount_usd}</span>
                        <span className="block text-2xs text-zinc-500">Paid Amount</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 bg-surface-1 p-12 text-center">
                <CreditCard className="mx-auto mb-2 h-8 w-8 text-zinc-600" />
                <p className="text-xs text-zinc-400">No payment invoices found for this account.</p>
              </div>
            )}
          </div>
        )}
      </main>

      <CompareBar />
      <Footer />
    </div>
  );
}
