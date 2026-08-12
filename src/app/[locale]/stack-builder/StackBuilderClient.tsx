'use client';

/**
 * Stack Builder v2 — critique §4 (\"a static quiz, not a real tool\") and
 * §11-13 (interactive workflow builder).
 *
 * What changed vs the old 12-combination quiz:
 *   - 6 creator goals × 3 budgets, but every recommendation is now a SLOT
 *     (role in the workflow) with swappable alternatives — hundreds of real
 *     combinations instead of twelve canned answers.
 *   - Costs are computed live from catalog pricing data, never hardcoded.
 *   - The stack persists in localStorage AND encodes into the URL, so it can
 *     be shared or bookmarked (?goal=…&budget=…&pick=slug,slug,…).
 *   - Copy-to-clipboard export of the full stack summary.
 *
 * Honesty rules: recommendations are labelled editorial picks, not test
 * results; verification badges come from the catalog; nothing claims a score.
 *
 * i18n (v3.3): all copy lives in the `stackBuilder` message namespace —
 * goals, budgets, slot roles/hints and the interactive chrome.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from '@/i18n/navigation';
import {
  Sparkles,
  Layers,
  ExternalLink,
  RotateCcw,
  Share2,
  Copy,
  Check,
  Wallet,
  FlaskConical,
} from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SmartImage } from '@/components/SmartImage';
import { VerificationBadge } from '@/components/VerificationBadge';
import { ALL_TOOLS, type Tool } from '@/data/tools';

type GoalKey = 'faceless' | 'shorts' | 'podcast' | 'thumbnails' | 'dubbing' | 'avatars';
type BudgetKey = 'free' | 'budget' | 'pro';

interface Slot {
  /** Key inside stackBuilder.slots.{goal}.{slotKey} */
  slotKey: string;
  /** Candidate tool slugs in editorial order (first = flagship pick). */
  candidates: string[];
}

const GOALS: Record<GoalKey, { slots: Slot[] }> = {
  faceless: {
    slots: [
      { slotKey: 'scripting', candidates: ['chatgpt', 'claude', 'jasper', 'notebooklm'] },
      { slotKey: 'voiceover', candidates: ['elevenlabs', 'murf-ai', 'lovo-ai', 'speechify'] },
      { slotKey: 'assembly', candidates: ['invideo', 'pictory', 'fliki', 'autoshorts'] },
      { slotKey: 'packaging', candidates: ['vidiq', 'tubebuddy', '1of10', 'nexlev'] },
    ],
  },
  shorts: {
    slots: [
      { slotKey: 'clip', candidates: ['opusclip', 'klap', 'munch', 'vizard'] },
      { slotKey: 'captions', candidates: ['submagic', 'captions', 'capcut', 'zeemo'] },
      { slotKey: 'finetune', candidates: ['capcut', 'veed', 'descript'] },
    ],
  },
  podcast: {
    slots: [
      { slotKey: 'recording', candidates: ['riverside', 'podcastle', 'streamyard'] },
      { slotKey: 'editing', candidates: ['descript', 'auphonic', 'cleanvoice'] },
      { slotKey: 'clips', candidates: ['headliner', 'opusclip', 'chopcast', 'repurpose-io'] },
    ],
  },
  thumbnails: {
    slots: [
      { slotKey: 'image', candidates: ['midjourney', 'leonardo-ai', 'ideogram', 'adobe-firefly'] },
      { slotKey: 'design', candidates: ['canva', 'adobe-express', 'photoroom'] },
      { slotKey: 'testing', candidates: ['1of10', 'thumbnailtest', 'tubebuddy'] },
    ],
  },
  dubbing: {
    slots: [
      { slotKey: 'translate', candidates: ['rask-ai', 'heygen', 'dubverse', 'papercup'] },
      { slotKey: 'voice', candidates: ['elevenlabs', 'wellsaid-labs', 'cartesia'] },
      { slotKey: 'subtitles', candidates: ['happy-scribe', 'checksub', 'zeemo'] },
    ],
  },
  avatars: {
    slots: [
      { slotKey: 'avatar', candidates: ['heygen', 'synthesia', 'deepbrain-ai', 'colossyan'] },
      { slotKey: 'scripting', candidates: ['chatgpt', 'claude', 'copy-ai'] },
      { slotKey: 'polish', candidates: ['veed', 'capcut', 'descript'] },
    ],
  },
};

const BUDGETS: BudgetKey[] = ['free', 'budget', 'pro'];

const STORAGE_KEY = 'creatorai-stack-v2';

function parsePrice(priceStr: string | undefined): number {
  if (!priceStr) return 0;
  const match = priceStr.replace(',', '.').match(/\$?([0-9]+(?:\.[0-9]+)?)/);
  return match ? parseFloat(match[1]) : 0;
}

function pickForBudget(slot: Slot, budget: BudgetKey): string | undefined {
  const tools = slot.candidates
    .map((slug) => ALL_TOOLS.find((t) => t.slug === slug))
    .filter((t): t is Tool => Boolean(t));
  if (tools.length === 0) return undefined;

  if (budget === 'free') {
    const freeish = tools.filter((t) => t.pricing === 'Free' || t.pricing === 'Freemium');
    return (freeish[0] ?? tools[0]).slug;
  }
  if (budget === 'budget') {
    const paid = tools.filter((t) => t.pricing !== 'Free');
    const pool = paid.length > 0 ? paid : tools;
    return [...pool].sort((a, b) => parsePrice(a.startingPrice) - parsePrice(b.startingPrice))[0].slug;
  }
  return tools[0].slug; // pro: editorial flagship order
}

interface StackState {
  goal: GoalKey;
  budget: BudgetKey;
  /** Slot index → chosen slug. */
  picks: Record<number, string>;
}

function readUrlState(): Partial<StackState> {
  if (typeof window === 'undefined') return {};
  const sp = new URLSearchParams(window.location.search);
  const goal = sp.get('goal') as GoalKey | null;
  const budget = sp.get('budget') as BudgetKey | null;
  const picks: Record<number, string> = {};
  (sp.get('pick') || '')
    .split(',')
    .forEach((slug, i) => {
      if (slug) picks[i] = slug;
    });
  return {
    goal: goal && GOALS[goal] ? goal : undefined,
    budget: budget && BUDGETS.includes(budget) ? budget : undefined,
    picks: Object.keys(picks).length > 0 ? picks : undefined,
  };
}

export default function StackBuilderClient() {
  const t = useTranslations('stackBuilder');
  const [goal, setGoal] = useState<GoalKey>('faceless');
  const [budget, setBudget] = useState<BudgetKey>('budget');
  const [picks, setPicks] = useState<Record<number, string>>({});
  const [copied, setCopied] = useState(false);
  const [shareMsg, setShareMsg] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const goalLabel = t(`goals.${goal}.label`);
  const goalBlurb = t(`goals.${goal}.blurb`);
  const budgetLabel = t(`budgets.${budget}.label`);
  const budgetBlurb = t(`budgets.${budget}.blurb`);

  // Hydrate once: URL params win over localStorage.
  useEffect(() => {
    const fromUrl = readUrlState();
    let stored: Partial<StackState> = {};
    try {
      stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    } catch {
      /* corrupted storage — ignore */
    }
    const g = fromUrl.goal ?? (stored.goal && GOALS[stored.goal as GoalKey] ? (stored.goal as GoalKey) : 'faceless');
    const b = fromUrl.budget ?? (stored.budget && BUDGETS.includes(stored.budget as BudgetKey) ? (stored.budget as BudgetKey) : 'budget');
    setGoal(g);
    setBudget(b);
    setPicks(fromUrl.picks ?? stored.picks ?? {});
    setHydrated(true);
  }, []);

  // Persist + reflect in URL whenever state changes.
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ goal, budget, picks } satisfies StackState));
    } catch {
      /* private mode — fine */
    }
    const sp = new URLSearchParams();
    sp.set('goal', goal);
    sp.set('budget', budget);
    const slots = GOALS[goal].slots;
    const pickArr = slots.map((s, i) => picks[i] ?? pickForBudget(s, budget) ?? '');
    if (pickArr.some(Boolean)) sp.set('pick', pickArr.join(','));
    window.history.replaceState(null, '', `?${sp.toString()}`);
  }, [goal, budget, picks, hydrated]);

  // Reset picks when goal/budget changes so the new defaults apply.
  const changeGoal = (g: GoalKey) => {
    setGoal(g);
    setPicks({});
  };
  const changeBudget = (b: BudgetKey) => {
    setBudget(b);
    setPicks({});
  };

  const slots = GOALS[goal].slots;
  const chosen: (Tool | undefined)[] = slots.map(
    (slot, i) => ALL_TOOLS.find((t) => t.slug === (picks[i] ?? pickForBudget(slot, budget)))
  );

  const total = chosen.reduce((sum, t) => sum + (budget === 'free' ? 0 : parsePrice(t?.startingPrice)), 0);

  const copySummary = async () => {
    const lines = [
      t('copyTitle', { budget: budgetLabel, goal: goalLabel }),
      ...slots.map((slot, i) => {
        const tool = chosen[i];
        const role = t(`slots.${goal}.${slot.slotKey}.role`);
        return t('copyRole', {
          role,
          name: tool ? tool.name : '—',
          price: tool ? (tool.startingPrice ?? tool.pricing) : '—',
        });
      }),
      budget === 'free' ? '' : t('copyTotal', { total: `$${total.toFixed(2)}` }),
      t('copyPlan'),
    ].filter(Boolean);
    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked */
    }
  };

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShareMsg(true);
      setTimeout(() => setShareMsg(false), 2000);
    } catch {
      /* clipboard blocked */
    }
  };

  const toolRows = useMemo(
    () =>
      slots.map((slot, i) => ({
        slot,
        tool: chosen[i],
        pick: picks[i] ?? pickForBudget(slot, budget) ?? '',
      })),
    [slots, chosen, picks, budget]
  );

  return (
    <div className="min-h-screen bg-surface-0 text-white">
      <Header />
      <main id="main" className="mx-auto max-w-5xl px-4 py-12">
        <span className="inline-flex items-center gap-2 rounded-full border border-accent-500/20 bg-accent-500/10 px-4 py-1.5 text-2xs font-semibold text-accent-300">
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> {t('badge')}
        </span>
        <h1 className="mt-4 text-3xl font-black tracking-tight md:text-5xl">{t('heading')}</h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-zinc-400">{t('intro')}</p>

        {/* Goal picker */}
        <section className="mt-8">
          <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-zinc-500">
            <Layers className="h-4 w-4" aria-hidden="true" /> {t('stepGoal')}
          </h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {(Object.keys(GOALS) as GoalKey[]).map((g) => (
              <button
                key={g}
                onClick={() => changeGoal(g)}
                aria-pressed={goal === g}
                className={`rounded-2xl border p-4 text-left transition-colors ${
                  goal === g
                    ? 'border-accent-500/60 bg-accent-500/10'
                    : 'border-white/10 bg-surface-1 hover:border-accent-500/30'
                }`}
              >
                <span className="block text-sm font-bold">{t(`goals.${g}.label`)}</span>
                <span className="mt-1 block text-2xs leading-relaxed text-zinc-400">
                  {t(`goals.${g}.blurb`)}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Budget picker */}
        <section className="mt-8">
          <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-zinc-500">
            <Wallet className="h-4 w-4" aria-hidden="true" /> {t('stepBudget')}
          </h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {BUDGETS.map((b) => (
              <button
                key={b}
                onClick={() => changeBudget(b)}
                aria-pressed={budget === b}
                className={`rounded-2xl border p-4 text-left transition-colors ${
                  budget === b
                    ? 'border-emerald-500/60 bg-emerald-500/10'
                    : 'border-white/10 bg-surface-1 hover:border-emerald-500/30'
                }`}
              >
                <span className="block text-sm font-bold">{t(`budgets.${b}.label`)}</span>
                <span className="mt-1 block text-2xs text-zinc-400">{t(`budgets.${b}.blurb`)}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Stack result */}
        <section className="mt-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold">{t('yourStack', { budget: budgetLabel, goal: goalLabel })}</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={share}
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-surface-1 px-3 py-2 text-2xs font-bold text-zinc-300 hover:border-accent-500/40"
              >
                <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
                {shareMsg ? t('linkCopied') : t('shareLink')}
              </button>
              <button
                onClick={copySummary}
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-surface-1 px-3 py-2 text-2xs font-bold text-zinc-300 hover:border-accent-500/40"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
                {copied ? t('copied') : t('copySummary')}
              </button>
              <button
                onClick={() => setPicks({})}
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-surface-1 px-3 py-2 text-2xs font-bold text-zinc-300 hover:border-rose-500/40"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> {t('reset')}
              </button>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            {toolRows.map(({ slot, tool, pick }, i) => {
              const role = t(`slots.${goal}.${slot.slotKey}.role`);
              const hint = t(`slots.${goal}.${slot.slotKey}.hint`);
              return (
                <div key={slot.slotKey} className="rounded-2xl border border-white/10 bg-surface-1 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-2xs font-bold uppercase tracking-wider text-zinc-500">
                        {t('roleLabel', { n: String(i + 1), role })}
                      </p>
                      <p className="mt-0.5 text-2xs text-zinc-500">{hint}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="sr-only" htmlFor={`slot-${i}`}>
                        {t('chooseTool', { role })}
                      </label>
                      <select
                        id={`slot-${i}`}
                        value={pick}
                        onChange={(e) => setPicks({ ...picks, [i]: e.target.value })}
                        className="rounded-xl border border-white/10 bg-surface-2 px-3 py-2 text-2xs font-semibold text-white focus:border-accent-500 focus:outline-none"
                      >
                        {slot.candidates.map((slug) => {
                          const c = ALL_TOOLS.find((t) => t.slug === slug);
                          if (!c) return null;
                          return (
                            <option key={slug} value={slug}>
                              {c.name} · {c.startingPrice ?? c.pricing}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>

                  {tool && (
                    <div className="mt-4 flex flex-col gap-4 border-t border-white/5 pt-4 sm:flex-row sm:items-center">
                      <SmartImage
                        src={tool.logo}
                        alt=""
                        width={44}
                        height={44}
                        className="h-11 w-11 rounded-xl border border-white/10 object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link href={`/tool/${tool.slug}`} className="text-sm font-bold hover:text-accent-300">
                            {tool.name}
                          </Link>
                          <VerificationBadge level={tool.verificationLevel} />
                        </div>
                        <p className="mt-0.5 truncate text-2xs text-zinc-400">{tool.tagline}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-sm font-bold tabular-nums text-emerald-400">
                          {tool.startingPrice ?? tool.pricing}
                        </p>
                        <a
                          href={`/go/${tool.slug}`}
                          target="_blank"
                          rel={
                            tool.affiliateProgram
                              ? 'noopener noreferrer nofollow sponsored'
                              : 'noopener noreferrer nofollow'
                          }
                          className="mt-1 inline-flex items-center gap-1 text-2xs font-bold text-accent-400 hover:text-accent-300"
                        >
                          {t('visit')} <ExternalLink className="h-3 w-3" aria-hidden="true" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Total */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-accent-500/30 bg-gradient-to-r from-accent-500/10 via-surface-1 to-surface-2 p-6">
            <div>
              <p className="text-2xs font-bold uppercase tracking-wider text-zinc-500">
                {t('totalLabel')}
              </p>
              <p className="font-mono text-3xl font-black tabular-nums text-accent-300">
                {budget === 'free' ? '$0' : `$${total.toFixed(2)}`}
                <span className="text-sm text-zinc-500"> {t('perMonth')}</span>
              </p>
              <p className="mt-1 max-w-md text-2xs leading-relaxed text-zinc-500">
                {budget === 'free' ? t('totalNoteFree') : t('totalNotePaid')}
              </p>
            </div>
            <Link
              href="/deals"
              className="inline-flex items-center gap-2 rounded-xl bg-accent-500 px-5 py-3 text-sm font-bold text-black hover:opacity-90"
            >
              {t('ctaDeals')}
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <p className="mt-4 flex items-start gap-2 text-2xs leading-relaxed text-zinc-500">
            <FlaskConical className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-600" aria-hidden="true" />
            {t('disclaimer')}
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
