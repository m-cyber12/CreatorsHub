'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from '@/i18n/navigation';
import { ALL_TOOLS, CATEGORIES } from '@/data/tools';
import { WORKFLOWS } from '@/data/workflows';
import {
  computeRadar,
  loadFollows,
  saveFollows,
  toggleFollow,
  EMPTY_FOLLOWS,
  type RadarFollows,
  type RadarToolEntry,
} from '@/lib/radar';
import { SmartImage } from '@/components/SmartImage';
import { VerificationBadge } from '@/components/VerificationBadge';
import {
  Radar as RadarIcon,
  Sparkles,
  TrendingUp,
  Wallet,
  GitBranch,
  ArrowRight,
  Plus,
  X,
} from 'lucide-react';

const FOLLOW_CATEGORIES = CATEGORIES.filter((c) => c !== 'All');

export function RadarTab() {
  const t = useTranslations('account');
  const [follows, setFollows] = useState<RadarFollows>(EMPTY_FOLLOWS);
  const [loaded, setLoaded] = useState(false);
  const [toolQuery, setToolQuery] = useState('');

  useEffect(() => {
    setFollows(loadFollows());
    setLoaded(true);
  }, []);

  const update = (next: RadarFollows) => {
    setFollows(next);
    saveFollows(next);
  };

  const feed = useMemo(() => computeRadar(follows, new Date()), [follows]);

  const toolMatches = useMemo(() => {
    const q = toolQuery.trim().toLowerCase();
    if (q.length < 2) return [];
    return ALL_TOOLS.filter(
      (x) => x.name.toLowerCase().includes(q) || x.slug.toLowerCase().includes(q)
    ).slice(0, 6);
  }, [toolQuery]);

  // Client-only data (localStorage): render nothing until the workspace has
  // loaded so SSR and first client paint agree.
  if (!loaded) return null;

  const priceLabel = (tool: (typeof ALL_TOOLS)[number]) =>
    tool.pricing === 'Free' ? t('freeTool') : (tool.startingPrice ?? tool.pricing);

  const renderToolCard = (entry: RadarToolEntry, badge: 'new' | 'trending' | null) => (
    <Link
      key={entry.tool.slug}
      href={`/tool/${entry.tool.slug}`}
      className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-surface-1 p-3.5 transition-all hover:border-accent-500/50"
    >
      <SmartImage
        src={entry.tool.logo}
        alt=""
        width={36}
        height={36}
        label={entry.tool.name.slice(0, 1)}
        className="h-9 w-9 shrink-0 rounded-lg border border-white/10 object-cover"
      />
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-1.5">
          <span className="truncate text-xs font-bold text-white group-hover:text-accent-300">
            {entry.tool.name}
          </span>
          {badge && (
            <span
              className={`rounded px-1.5 py-0.5 font-mono text-[9px] font-black uppercase tracking-wider ${
                badge === 'new'
                  ? 'bg-emerald-400/15 text-emerald-300'
                  : 'bg-fuchsia-400/15 text-fuchsia-300'
              }`}
            >
              {badge === 'new' ? t('badgeNew') : t('badgeTrending')}
            </span>
          )}
        </span>
        <span className="mt-0.5 block truncate text-2xs text-zinc-500">
          {entry.tool.category} · {entry.tool.tagline}
        </span>
      </span>
      <span className="flex shrink-0 items-center gap-2">
        <span className="font-mono text-2xs font-bold text-emerald-400">{priceLabel(entry.tool)}</span>
        <ArrowRight className="h-3.5 w-3.5 text-zinc-600 transition-transform group-hover:text-accent-400 rtl:rotate-180" />
      </span>
    </Link>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white">{t('radarTitle')}</h2>
          <p className="text-xs text-zinc-400">{t('radarSub')}</p>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-2xs font-bold uppercase tracking-wider ${
            feed.scoped
              ? 'border-accent-500/40 bg-accent-500/10 text-accent-300'
              : 'border-white/15 bg-white/5 text-zinc-400'
          }`}
        >
          <RadarIcon className="h-3.5 w-3.5" />
          {feed.scoped ? t('personalized') : t('globalDigest')}
        </span>
      </div>

      {/* Follow manager */}
      <div className="rounded-3xl border border-white/10 bg-surface-1 p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">{t('followTitle')}</h3>
          {!feed.scoped && <p className="text-2xs text-zinc-500">{t('noFollowsHint')}</p>}
        </div>

        <div className="mt-4 grid gap-6 lg:grid-cols-3">
          {/* Categories */}
          <div>
            <p className="text-2xs font-bold uppercase tracking-wider text-zinc-500">
              {t('followCategories')}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {FOLLOW_CATEGORIES.map((c) => {
                const on = follows.categories.includes(c);
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() =>
                      update({ ...follows, categories: toggleFollow(follows.categories, c) })
                    }
                    aria-pressed={on}
                    className={`rounded-full border px-2.5 py-1 text-2xs font-bold transition-colors ${
                      on
                        ? 'border-accent-500/60 bg-accent-500/15 text-accent-300'
                        : 'border-white/10 bg-white/5 text-zinc-400 hover:border-white/25 hover:text-zinc-200'
                    }`}
                  >
                    {on ? '✓ ' : ''}
                    {c}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Workflows */}
          <div>
            <p className="text-2xs font-bold uppercase tracking-wider text-zinc-500">
              {t('followWorkflows')}
            </p>
            <ul className="mt-2 space-y-1.5">
              {WORKFLOWS.map((w) => {
                const on = follows.workflows.includes(w.slug);
                return (
                  <li key={w.slug}>
                    <button
                      type="button"
                      onClick={() =>
                        update({ ...follows, workflows: toggleFollow(follows.workflows, w.slug) })
                      }
                      aria-pressed={on}
                      className={`flex w-full items-center gap-2 rounded-xl border px-3 py-2 text-left transition-colors ${
                        on
                          ? 'border-accent-500/60 bg-accent-500/15'
                          : 'border-white/10 bg-white/5 hover:border-white/25'
                      }`}
                    >
                      <span
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                          on
                            ? 'border-accent-400 bg-accent-500 text-black'
                            : 'border-zinc-600 text-transparent'
                        }`}
                      >
                        <GitBranch className="h-2.5 w-2.5" />
                      </span>
                      <span className="min-w-0">
                        <span
                          className={`block truncate text-xs font-bold ${on ? 'text-accent-300' : 'text-zinc-300'}`}
                        >
                          {w.title}
                        </span>
                        <span className="block truncate text-2xs text-zinc-500">{w.oneLiner}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Tools */}
          <div>
            <p className="text-2xs font-bold uppercase tracking-wider text-zinc-500">
              {t('followTools')}
            </p>
            <input
              type="text"
              value={toolQuery}
              onChange={(e) => setToolQuery(e.target.value)}
              placeholder={t('followToolsPlaceholder')}
              aria-label={t('followTools')}
              className="mt-2 w-full rounded-xl border border-white/10 bg-surface-2 px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:border-accent-500/60 focus:outline-none"
            />
            {toolQuery.trim().length >= 2 && (
              <ul className="mt-1.5 space-y-1">
                {toolMatches.length === 0 && (
                  <li className="px-1 text-2xs text-zinc-600">{t('noToolMatches')}</li>
                )}
                {toolMatches.map((tool) => {
                  const on = follows.tools.includes(tool.slug);
                  return (
                    <li key={tool.slug} className="flex items-center gap-2">
                      <SmartImage
                        src={tool.logo}
                        alt=""
                        width={20}
                        height={20}
                        label={tool.name.slice(0, 1)}
                        className="h-5 w-5 rounded border border-white/10 object-cover"
                      />
                      <span className="min-w-0 flex-1 truncate text-2xs font-bold text-zinc-300">
                        {tool.name}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          update({ ...follows, tools: toggleFollow(follows.tools, tool.slug) })
                        }
                        aria-pressed={on}
                        className={`inline-flex shrink-0 items-center gap-1 rounded-lg border px-2 py-1 text-2xs font-bold transition-colors ${
                          on
                            ? 'border-accent-500/60 bg-accent-500/15 text-accent-300'
                            : 'border-white/10 bg-white/5 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        {on ? <X className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                        {on ? t('following') : t('follow')}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
            {follows.tools.length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {follows.tools.map((slug) => {
                  const tool = ALL_TOOLS.find((x) => x.slug === slug);
                  if (!tool) return null;
                  return (
                    <span
                      key={slug}
                      className="inline-flex items-center gap-1 rounded-full border border-accent-500/40 bg-accent-500/10 px-2.5 py-1 text-2xs font-bold text-accent-300"
                    >
                      {tool.name}
                      <button
                        type="button"
                        onClick={() =>
                          update({ ...follows, tools: toggleFollow(follows.tools, slug) })
                        }
                        aria-label={`${t('following')} — ${tool.name}`}
                        className="text-accent-400 hover:text-white"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Feed */}
      <div className="space-y-6">
        {/* New */}
        {feed.newTools.length > 0 && (
          <section>
            <h3 className="flex items-center gap-2 text-sm font-bold text-white">
              <Sparkles className="h-4 w-4 text-emerald-400" /> {t('newTitle')}
            </h3>
            <p className="mt-0.5 text-2xs text-zinc-500">{t('newSub')}</p>
            <div className="mt-3 grid gap-2.5 sm:grid-cols-2">{feed.newTools.map((e) => renderToolCard(e, 'new'))}</div>
          </section>
        )}

        {/* Trending */}
        {feed.trending.length > 0 && (
          <section>
            <h3 className="flex items-center gap-2 text-sm font-bold text-white">
              <TrendingUp className="h-4 w-4 text-fuchsia-400" /> {t('trendingTitle')}
            </h3>
            <p className="mt-0.5 text-2xs text-zinc-500">{t('trendingSub')}</p>
            <div className="mt-3 grid gap-2.5 sm:grid-cols-2">{feed.trending.map((e) => renderToolCard(e, 'trending'))}</div>
          </section>
        )}

        {/* Price watch */}
        {feed.watch.length > 0 && (
          <section>
            <h3 className="flex items-center gap-2 text-sm font-bold text-white">
              <Wallet className="h-4 w-4 text-cyan-400" /> {t('watchTitle')}
            </h3>
            <p className="mt-0.5 text-2xs text-zinc-500">{t('watchSub')}</p>
            <ul className="mt-3 space-y-2">
              {feed.watch.map(({ tool }) => (
                <li
                  key={tool.slug}
                  className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-surface-1 px-4 py-3"
                >
                  <SmartImage
                    src={tool.logo}
                    alt=""
                    width={32}
                    height={32}
                    label={tool.name.slice(0, 1)}
                    className="h-8 w-8 shrink-0 rounded-lg border border-white/10 object-cover"
                  />
                  <Link href={`/tool/${tool.slug}`} className="text-xs font-bold text-white hover:text-accent-300">
                    {tool.name}
                  </Link>
                  <VerificationBadge level={tool.verificationLevel} compact />
                  <span className="ml-auto flex items-center gap-3">
                    {tool.cataloguedAt && (
                      <span className="text-2xs text-zinc-500">{t('lastReviewed', { date: tool.cataloguedAt })}</span>
                    )}
                    <span className="font-mono text-sm font-black text-cyan-300">{priceLabel(tool)}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Workflows */}
        {feed.workflows.length > 0 ? (
          <section>
            <h3 className="flex items-center gap-2 text-sm font-bold text-white">
              <GitBranch className="h-4 w-4 text-accent-400" /> {t('wfTitle')}
            </h3>
            <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
              {feed.workflows.map(({ workflow, minutes }) => (
                <Link
                  key={workflow.slug}
                  href={`/workflows/${workflow.slug}`}
                  className="group rounded-2xl border border-white/10 bg-surface-1 p-4 transition-all hover:border-accent-500/50"
                >
                  <p className="text-xs font-bold text-white group-hover:text-accent-300">{workflow.title}</p>
                  <p className="mt-1 line-clamp-2 text-2xs text-zinc-400">{workflow.oneLiner}</p>
                  <p className="mt-2 text-2xs font-bold text-zinc-500">
                    {workflow.nodes.length} {t('wfNodes')} · {minutes} {t('wfMinutes')}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        ) : (
          feed.scoped && (
            <p className="rounded-2xl border border-dashed border-white/10 bg-surface-1 px-4 py-3 text-2xs text-zinc-500">
              {t('wfNone')}
            </p>
          )
        )}

        {/* Feed is empty only when the catalog has no flags at all */}
        {feed.newTools.length === 0 && feed.trending.length === 0 && feed.watch.length === 0 && (
          <p className="rounded-2xl border border-dashed border-white/10 bg-surface-1 px-4 py-6 text-center text-2xs text-zinc-500">
            {t('emptyFeed')}
          </p>
        )}
      </div>
    </div>
  );
}
