'use client';

/**
 * Noxifera AI Advisor — the first killer feature (Roadmap §4).
 *
 * A guided, multi-step decision engine. The wizard collects only the answers
 * the engine needs, then renders the deterministic recommendation from
 * src/lib/advisor.ts (tested in tests/advisor.test.ts). No LLM, no chatbot:
 * same answers → same system, computed from catalog data.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from '@/i18n/navigation';
import {
  Compass,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Copy,
  Save,
  Trash2,
  Layers,
  Hand,
  Search,
  RotateCcw,
  GitCompareArrows,
  FolderKanban,
  BookmarkPlus,
} from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SmartImage } from '@/components/SmartImage';
import { VerificationBadge } from '@/components/VerificationBadge';
import { ALL_TOOLS, CATEGORIES } from '@/data/tools';
import {
  runAdvisor,
  CONTENT_TYPES,
  PLATFORMS,
  BUDGETS,
  EXPERIENCE_LEVELS,
  AUTOMATION_LEVELS,
  CONTENT_TO_GOAL,
  catalogTool,
  matchPreferencesToAdvisor,
  type AdvisorAnswers,
  type AdvisorResult,
  type ContentType,
  type Budget,
  type StageKey,
} from '@/lib/advisor';
import { getPreferences } from '@/lib/workspace';
import { attachTools, createProject, loadProjects, toggleWorkflow, type NoxiferaProject, type ProjectType } from '@/lib/projects';

const SAVED_KEY = 'noxifera_advisor_saves';

interface SavedPlan {
  id: string;
  name: string;
  answers: AdvisorAnswers;
  savedAt: string;
}

const VOICE_CONTENT: ContentType[] = ['long-form', 'course'];

/** Which local project type fits a content type (podcasts get their own type). */
const CONTENT_TO_PROJECT_TYPE: Record<ContentType, ProjectType> = {
  'long-form': 'youtube',
  'short-form': 'youtube',
  faceless: 'youtube',
  podcast: 'podcast',
  ugc: 'youtube',
  course: 'youtube',
};

/** Workflow template that matches a content type (short-form/course have none yet). */
const CONTENT_TO_WORKFLOW: Partial<Record<ContentType, string>> = {
  'long-form': 'youtube-long-form',
  faceless: 'faceless-video',
  podcast: 'podcast-to-shorts',
  ugc: 'ugc-ads',
};

function loadSaved(): SavedPlan[] {
  try {
    const raw = localStorage.getItem(SAVED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function CurveDots({ level }: { level: number }) {
  return (
    <span className="inline-flex items-center gap-1" aria-label={`${level}/5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={`h-1.5 w-1.5 rounded-full ${i <= level ? 'bg-accent-400' : 'bg-white/15'}`}
        />
      ))}
    </span>
  );
}

export function AdvisorClient() {
  const t = useTranslations('advisor');
  const tMy = useTranslations('my');
  const [step, setStep] = useState(0);
  const [content, setContent] = useState<ContentType | null>(null);
  const [platform, setPlatform] = useState<AdvisorAnswers['platform']>('youtube');
  const [budget, setBudget] = useState<Budget>('under50');
  const [experience, setExperience] = useState<AdvisorAnswers['experience']>('some');
  const [automation, setAutomation] = useState<AdvisorAnswers['automation']>('balanced');
  const [useOwnVoice, setUseOwnVoice] = useState(false);
  const [existing, setExisting] = useState<string[]>([]);
  const [existingQuery, setExistingQuery] = useState('');
  const [result, setResult] = useState<AdvisorResult | null>(null);
  const [saved, setSaved] = useState<SavedPlan[]>([]);
  const [projects, setProjects] = useState<NoxiferaProject[]>([]);
  const [attachTarget, setAttachTarget] = useState('');
  const [projMsg, setProjMsg] = useState<'ok' | 'full' | null>(null);
  const [attachedFlash, setAttachedFlash] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [prefilledCount, setPrefilledCount] = useState(0);

  useEffect(() => {
    setSaved(loadSaved());
    setProjects(loadProjects());
    // ?from=my — prefill the wizard from My NOXIFERA preferences.
    // Only confident matches are applied; the user can change everything.
    try {
      if (new URLSearchParams(window.location.search).get('from') === 'my') {
        const pre = matchPreferencesToAdvisor(getPreferences());
        if (pre.content) setContent(pre.content);
        if (pre.platform) setPlatform(pre.platform);
        if (pre.budget) setBudget(pre.budget);
        if (pre.experience) setExperience(pre.experience);
        if (pre.automation) setAutomation(pre.automation);
        if (pre.existing.length > 0) setExisting(pre.existing);
        setPrefilledCount(pre.matchedCount);
      }
    } catch {
      /* corrupted storage — wizard defaults stand */
    }
    setHydrated(true);
  }, []);

  const steps = useMemo(() => {
    const s: string[] = ['content', 'platform', 'budget', 'experience', 'automation'];
    if (content && VOICE_CONTENT.includes(content)) s.push('voice');
    s.push('existing');
    return s;
  }, [content]);

  const stepKey = steps[Math.min(step, steps.length - 1)];

  const complete = () => {
    if (!content) return;
    setResult(
      runAdvisor({
        content,
        platform,
        budget,
        experience,
        automation,
        useOwnVoice,
        existingTools: existing,
      })
    );
    window.scrollTo({ top: 0 });
  };

  const next = () => (step >= steps.length - 1 ? complete() : setStep(step + 1));
  const back = () => setStep(Math.max(0, step - 1));

  const restart = () => {
    setResult(null);
    setStep(0);
    setContent(null);
    setExisting([]);
    setUseOwnVoice(false);
  };

  const persistSaved = (next: SavedPlan[]) => {
    setSaved(next);
    try {
      localStorage.setItem(SAVED_KEY, JSON.stringify(next));
    } catch {
      /* private mode */
    }
  };

  const savePlan = () => {
    if (!result || !content) return;
    const name = `${t(`contentTypes.${content}.label`)} · ${t(`budget.${budget}.label`)}`;
    const plan: SavedPlan = {
      id: `${Date.now().toString(36)}`,
      name,
      answers: result.answers,
      savedAt: new Date().toISOString(),
    };
    persistSaved([plan, ...saved]);
    setFlash(t('actions.saved'));
    setTimeout(() => setFlash(null), 2000);
  };

  const deletePlan = (id: string) => persistSaved(saved.filter((p) => p.id !== id));

  /** Non-destructively attach this plan's tool picks to a project (upgrade #20). */
  const attachToProject = () => {
    if (!result || !attachTarget) return;
    const slugs = result.stages.map((s) => s.tool).filter((x): x is string => Boolean(x));
    const { added } = attachTools(attachTarget, slugs, new Date().toISOString());
    setProjects(loadProjects());
    setAttachedFlash(true);
    setFlash(added > 0 ? t('actions.projectAdded', { count: added }) : t('actions.projectUpToDate'));
    setTimeout(() => {
      setFlash(null);
      setAttachedFlash(false);
    }, 2500);
  };

  /** One click: plan becomes a new project with all its tool picks attached. */
  const saveAsProject = () => {
    if (!result || !content) return;
    const p = createProject(t(`contentTypes.${content}.label`), CONTENT_TO_PROJECT_TYPE[content], new Date().toISOString());
    if (!p) {
      setProjMsg('full');
      setTimeout(() => setProjMsg(null), 2500);
      return;
    }
    const slugs = result.stages.map((s) => s.tool).filter((x): x is string => Boolean(x));
    attachTools(p.id, slugs, new Date().toISOString());
    const wf = CONTENT_TO_WORKFLOW[content];
    if (wf) toggleWorkflow(p.id, wf, new Date().toISOString());
    setProjects(loadProjects());
    setProjMsg('ok');
    setTimeout(() => setProjMsg(null), 2500);
  };

  const openPlan = (plan: SavedPlan) => {
    const a = plan.answers;
    setContent(a.content);
    setPlatform(a.platform);
    setBudget(a.budget);
    setExperience(a.experience);
    setAutomation(a.automation);
    setUseOwnVoice(a.useOwnVoice);
    setExisting(a.existingTools ?? []);
    setResult(runAdvisor(a));
    window.scrollTo({ top: 0 });
  };

  const copySummary = async () => {
    if (!result) return;
    const lines = [
      `Noxifera — ${t('yourSystem')} (${t(`contentTypes.${result.answers.content}.label`)}, ${t(
        `budget.${result.answers.budget}.label`
      )})`,
      '',
      ...result.stages.map((s, i) => {
        const tool = s.tool ? catalogTool(s.tool) : null;
        const price = tool ? (tool.startingPrice ?? tool.pricing) : '—';
        return `${i + 1}. ${s.key}: ${tool ? `${tool.name} (${price})` : 'manual'} — ${s.reason} Next: ${s.nextStep}`;
      }),
      '',
      `${t('monthly')}: $${result.monthlyTotal}/mo`,
    ];
    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      setFlash(t('actions.copied'));
      setTimeout(() => setFlash(null), 2000);
    } catch {
      /* clipboard blocked */
    }
  };

  /* ─────────────────────────── Results view ─────────────────────────── */

  if (result) {
    return (
      <div className="min-h-screen bg-surface-0 text-white">
        <Header />
        <main id="main" className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-accent-500/20 bg-accent-500/10 px-4 py-1.5 text-2xs font-semibold text-accent-300">
            <Compass className="h-3.5 w-3.5" aria-hidden="true" /> {t('badge')}
          </span>
          <h1 className="mt-4 text-3xl font-black tracking-tight md:text-4xl">{t('yourSystem')}</h1>
          <p className="mt-2 text-sm text-zinc-400">{t('systemSub')}</p>

          {/* Pipeline */}
          <ol className="relative mt-8 space-y-4">
            {result.stages.map((stage, i) => {
              const tool = stage.tool ? catalogTool(stage.tool) : null;
              return (
                <li key={stage.key} className="relative">
                  <div className="glass-panel rounded-2xl p-5">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-500 font-mono text-2xs font-black text-black">
                        {i + 1}
                      </span>
                      <h2 className="text-base font-black">{t(`stages.${stage.key}` as never)}</h2>
                      {stage.fromExisting && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-2 py-0.5 text-2xs font-bold text-emerald-300">
                          <Check className="h-3 w-3" aria-hidden="true" /> {t('fromExisting')}
                        </span>
                      )}
                      {tool && (
                        <span className="ml-auto inline-flex items-center gap-2">
                          <span className="font-mono text-sm font-bold tabular-nums text-emerald-300">
                            {tool.startingPrice ?? tool.pricing}
                          </span>
                          <VerificationBadge level={tool.verificationLevel} />
                        </span>
                      )}
                      {!tool && (
                        <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-2xs font-bold text-zinc-300">
                          <Hand className="h-3 w-3" aria-hidden="true" /> {t('manualStage')}
                        </span>
                      )}
                    </div>

                    {tool && (
                      <div className="mt-4 flex items-center gap-3 border-t border-white/5 pt-4">
                        <SmartImage
                          src={tool.logo}
                          alt=""
                          width={40}
                          height={40}
                          className="h-10 w-10 rounded-lg border border-white/10 object-cover"
                        />
                        <div className="min-w-0">
                          <Link
                            href={`/tool/${tool.slug}`}
                            className="text-sm font-bold text-accent-300 hover:text-accent-200"
                          >
                            {tool.name}
                          </Link>
                          <p className="truncate text-2xs text-zinc-500">{tool.tagline}</p>
                        </div>
                      </div>
                    )}

                    <p className="mt-3 text-sm leading-relaxed text-zinc-300">{stage.reason}</p>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl border border-white/5 bg-surface-0/60 p-3">
                        <p className="text-2xs font-bold uppercase tracking-wider text-zinc-500">
                          {t('nextStep')}
                        </p>
                        <p className="mt-1.5 text-2xs leading-relaxed text-zinc-300">{stage.nextStep}</p>
                      </div>
                      <div className="rounded-xl border border-white/5 bg-surface-0/60 p-3">
                        <p className="flex items-center gap-2 text-2xs font-bold uppercase tracking-wider text-zinc-500">
                          {t('curve')} <CurveDots level={stage.learningCurve} />
                        </p>
                        {stage.alternatives.length > 0 ? (
                          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                            <span className="text-2xs text-zinc-500">{t('alternatives')}:</span>
                            {stage.alternatives.slice(0, 4).map((alt) => {
                              const at = catalogTool(alt);
                              if (!at) return null;
                              return (
                                <Link
                                  key={alt}
                                  href={`/tool/${alt}`}
                                  className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-2xs font-semibold text-zinc-300 transition-colors hover:border-accent-500/50 hover:text-accent-300"
                                >
                                  {at.name}
                                </Link>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="mt-1.5 text-2xs text-zinc-500">—</p>
                        )}
                        {stage.tool && stage.alternatives[0] && (
                          <Link
                            href={`/compare?tools=${stage.tool},${stage.alternatives[0]}`}
                            className="mt-2 inline-flex items-center gap-1.5 text-2xs font-bold text-accent-400 hover:text-accent-300"
                          >
                            <GitCompareArrows className="h-3.5 w-3.5" aria-hidden="true" />
                            {t('actions.compare')}
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>

          {/* Total */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-accent-500/30 bg-gradient-to-r from-accent-500/10 via-surface-1 to-surface-2 p-6">
            <div>
              <p className="text-2xs font-bold uppercase tracking-wider text-zinc-500">{t('monthly')}</p>
              <p className="font-mono text-3xl font-black tabular-nums text-accent-300">
                ${result.monthlyTotal}
                <span className="text-sm text-zinc-500">/mo</span>
              </p>
              <p className="mt-1 max-w-md text-2xs leading-relaxed text-zinc-500">{t('monthlyNote')}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={savePlan}
                className="inline-flex items-center gap-2 rounded-xl bg-accent-500 px-4 py-2.5 text-2xs font-bold text-black transition-opacity hover:opacity-90"
              >
                {flash === t('actions.saved') ? (
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                ) : (
                  <Save className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                {t('actions.save')}
              </button>
              {content && (
                <Link
                  href={`/stack-builder?goal=${CONTENT_TO_GOAL[content]}`}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-surface-1 px-4 py-2.5 text-2xs font-bold text-zinc-200 transition-colors hover:border-accent-500/50"
                >
                  <Layers className="h-3.5 w-3.5" aria-hidden="true" /> {t('actions.buildStack')}
                </Link>
              )}
              {content && result.stages.some((s) => s.tool) && (
                <Link
                  href={`/my?tab=stacks&new=1&goal=${CONTENT_TO_GOAL[content]}&tools=${result.stages
                    .map((s) => s.tool)
                    .filter((x): x is string => Boolean(x))
                    .join(',')}&name=${encodeURIComponent(`${t(`contentTypes.${content}.label`)} · ${t(`budget.${budget}.label`)}`)}`}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-surface-1 px-4 py-2.5 text-2xs font-bold text-zinc-200 transition-colors hover:border-accent-500/50"
                >
                  <BookmarkPlus className="h-3.5 w-3.5" aria-hidden="true" /> {t('actions.saveAsStack')}
                </Link>
              )}
              <button
                onClick={copySummary}
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-surface-1 px-4 py-2.5 text-2xs font-bold text-zinc-200 transition-colors hover:border-accent-500/50"
              >
                {flash === t('actions.copied') ? (
                  <Check className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
                ) : (
                  <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                {t('actions.copy')}
              </button>
              {result.stages.some((s) => s.tool) && (
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={attachTarget}
                    onChange={(e) => setAttachTarget(e.target.value)}
                    aria-label={t('actions.selectProject')}
                    className="max-w-44 rounded-xl border border-white/15 bg-surface-1 px-3 py-2.5 text-2xs font-bold text-zinc-200 focus:border-accent-500/60 focus:outline-none"
                  >
                    <option value="">{t('actions.selectProject')}</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={attachToProject}
                    disabled={!attachTarget}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-surface-1 px-4 py-2.5 text-2xs font-bold text-zinc-200 transition-colors hover:border-accent-500/50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {attachedFlash ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
                    ) : (
                      <FolderKanban className="h-3.5 w-3.5" aria-hidden="true" />
                    )}
                    {t('actions.attachToProject')}
                  </button>
                </div>
              )}
              {result.stages.some((s) => s.tool) && (
                <button
                  type="button"
                  onClick={saveAsProject}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-surface-1 px-4 py-2.5 text-2xs font-bold text-zinc-200 transition-colors hover:border-accent-500/50"
                >
                  {projMsg === 'ok' ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
                  ) : (
                    <FolderKanban className="h-3.5 w-3.5" aria-hidden="true" />
                  )}
                  {projMsg === 'ok'
                    ? t('actions.projectCreated')
                    : projMsg === 'full'
                    ? t('actions.projectsFull')
                    : t('actions.saveAsProject')}
                </button>
              )}
              <button
                onClick={restart}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-surface-1 px-4 py-2.5 text-2xs font-bold text-zinc-400 transition-colors hover:text-white"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> {t('actions.restart')}
              </button>
            </div>
            {result.stages.some((s) => s.tool) && hydrated && projects.length === 0 && (
              <p className="mt-2 text-2xs text-zinc-500">
                {t('actions.noProjects')}{' '}
                <Link href="/projects" className="font-bold text-accent-400 hover:text-accent-300">
                  {t('actions.createProject')}
                </Link>
              </p>
            )}
          </div>

          <p className="mt-4 flex items-start gap-2 text-2xs leading-relaxed text-zinc-500">
            <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-600" aria-hidden="true" />
            {t('disclaimer')}
          </p>

          {/* Saved plans */}
          <section className="mt-12">
            <h2 className="text-lg font-black">{t('savedPlans')}</h2>
            <p className="mt-1 text-2xs text-zinc-500">{t('savedPlansSub')}</p>
            {hydrated && saved.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-dashed border-white/10 bg-surface-1 p-8 text-center">
                <p className="text-sm font-bold text-zinc-300">{t('emptySaved')}</p>
                <p className="mt-1 text-2xs text-zinc-500">{t('emptySavedSub')}</p>
              </div>
            ) : (
              <ul className="mt-4 space-y-2">
                {saved.map((plan) => (
                  <li
                    key={plan.id}
                    className="flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-surface-1 px-4 py-3"
                  >
                    <span className="text-sm font-bold">{plan.name}</span>
                    <span className="text-2xs text-zinc-500">
                      {new Date(plan.savedAt).toLocaleDateString()}
                    </span>
                    <span className="ml-auto flex gap-2">
                      <button
                        onClick={() => openPlan(plan)}
                        className="rounded-lg border border-white/10 bg-surface-2 px-3 py-1.5 text-2xs font-bold text-accent-300 hover:border-accent-500/50"
                      >
                        {t('load')}
                      </button>
                      <button
                        onClick={() => deletePlan(plan.id)}
                        aria-label={t('deletePlan')}
                        className="rounded-lg border border-white/10 bg-surface-2 p-1.5 text-zinc-500 hover:text-rose-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  /* ─────────────────────────── Wizard view ──────────────────────────── */

  const optionCard = (active: boolean) =>
    `rounded-2xl border p-4 text-left transition-colors ${
      active
        ? 'border-accent-500/60 bg-accent-500/10'
        : 'border-white/10 bg-surface-1 hover:border-accent-500/30'
    }`;

  return (
    <div className="min-h-screen bg-surface-0 text-white">
      <Header />
      <main id="main" className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <span className="inline-flex items-center gap-2 rounded-full border border-accent-500/20 bg-accent-500/10 px-4 py-1.5 text-2xs font-semibold text-accent-300">
          <Compass className="h-3.5 w-3.5" aria-hidden="true" /> {t('badge')}
        </span>
        <h1 className="mt-4 text-3xl font-black tracking-tight md:text-5xl">{t('title')}</h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-zinc-400">{t('intro')}</p>

        {prefilledCount > 0 && (
          <p className="mt-4 rounded-2xl border border-accent-500/25 bg-accent-500/10 px-4 py-3 text-sm text-zinc-200">
            {t('prefillBanner', { count: String(prefilledCount) })}{' '}
            <Link href="/my?tab=preferences" className="font-bold text-accent-400 hover:text-accent-300">
              {tMy('openMy')} →
            </Link>
          </p>
        )}

        {/* Progress */}
        <div className="mt-8">
          <div className="flex items-center justify-between">
            <p className="text-2xs font-bold uppercase tracking-wider text-zinc-500">
              {t('progress', { n: String(step + 1), total: String(steps.length) })}
            </p>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-accent-400 to-ember-500 transition-all duration-300"
              style={{ width: `${((step + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="mt-8">
          {stepKey === 'content' && (
            <>
              <h2 className="text-lg font-bold">{t('qContent')}</h2>
              <p className="mt-1 text-2xs text-zinc-500">{t('qContentSub')}</p>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {CONTENT_TYPES.map((c) => (
                  <button key={c} onClick={() => { setContent(c); next(); }} className={optionCard(content === c)} aria-pressed={content === c}>
                    <span className="block text-sm font-bold">{t(`contentTypes.${c}.label`)}</span>
                    <span className="mt-1 block text-2xs leading-relaxed text-zinc-400">
                      {t(`contentTypes.${c}.desc`)}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}

          {stepKey === 'platform' && (
            <>
              <h2 className="text-lg font-bold">{t('qPlatform')}</h2>
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {PLATFORMS.map((p) => (
                  <button key={p} onClick={() => { setPlatform(p); next(); }} className={optionCard(platform === p)} aria-pressed={platform === p}>
                    <span className="block text-sm font-bold">{t(`platform.${p}`)}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {stepKey === 'budget' && (
            <>
              <h2 className="text-lg font-bold">{t('qBudget')}</h2>
              <p className="mt-1 text-2xs text-zinc-500">{t('qBudgetSub')}</p>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {BUDGETS.map((b) => (
                  <button key={b} onClick={() => { setBudget(b); next(); }} className={optionCard(budget === b)} aria-pressed={budget === b}>
                    <span className="block text-sm font-bold">{t(`budget.${b}.label`)}</span>
                    <span className="mt-1 block text-2xs text-zinc-400">{t(`budget.${b}.desc`)}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {stepKey === 'experience' && (
            <>
              <h2 className="text-lg font-bold">{t('qExperience')}</h2>
              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                {EXPERIENCE_LEVELS.map((e) => (
                  <button
                    key={e}
                    onClick={() => { setExperience(e); next(); }}
                    className={optionCard(experience === e)}
                    aria-pressed={experience === e}
                  >
                    <span className="block text-sm font-bold">{t(`experience.${e}`)}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {stepKey === 'automation' && (
            <>
              <h2 className="text-lg font-bold">{t('qAutomation')}</h2>
              <p className="mt-1 text-2xs text-zinc-500">{t('qAutomationSub')}</p>
              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                {AUTOMATION_LEVELS.map((a) => (
                  <button key={a} onClick={() => { setAutomation(a); next(); }} className={optionCard(automation === a)} aria-pressed={automation === a}>
                    <span className="block text-sm font-bold">{t(`automation.${a}.label`)}</span>
                    <span className="mt-1 block text-2xs leading-relaxed text-zinc-400">
                      {t(`automation.${a}.desc`)}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}

          {stepKey === 'voice' && (
            <>
              <h2 className="text-lg font-bold">{t('qVoice')}</h2>
              <p className="mt-1 text-2xs text-zinc-500">{t('qVoiceSub')}</p>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <button
                  onClick={() => { setUseOwnVoice(true); next(); }}
                  className={optionCard(useOwnVoice)}
                  aria-pressed={useOwnVoice}
                >
                  <span className="block text-sm font-bold">{t('voice.own')}</span>
                </button>
                <button
                  onClick={() => { setUseOwnVoice(false); next(); }}
                  className={optionCard(!useOwnVoice)}
                  aria-pressed={!useOwnVoice}
                >
                  <span className="block text-sm font-bold">{t('voice.ai')}</span>
                </button>
              </div>
            </>
          )}

          {stepKey === 'existing' && (
            <>
              <h2 className="text-lg font-bold">{t('qExisting')}</h2>
              <p className="mt-1 text-2xs text-zinc-500">{t('qExistingSub')}</p>
              <div className="relative mt-4">
                <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" aria-hidden="true" />
                <input
                  value={existingQuery}
                  onChange={(e) => setExistingQuery(e.target.value)}
                  placeholder={t('existingPlaceholder')}
                  className="w-full rounded-xl border border-white/10 bg-surface-1 py-2.5 pe-4 ps-9 text-sm placeholder:text-zinc-600 focus:border-accent-500 focus:outline-none"
                />
              </div>
              <div className="mt-3 grid max-h-64 gap-1.5 overflow-y-auto rounded-xl border border-white/10 bg-surface-1 p-2 sm:grid-cols-2">
                {CATEGORIES.filter((c) => c !== 'All')
                  .map((cat) => ({
                    cat,
                    tools: ALL_TOOLS.filter(
                      (tool) =>
                        tool.category === cat &&
                        (existingQuery === '' ||
                          tool.name.toLowerCase().includes(existingQuery.toLowerCase()))
                    ),
                  }))
                  .filter((g) => g.tools.length > 0)
                  .map((g) => (
                    <div key={g.cat} className="col-span-full">
                      <p className="px-2 pb-1 pt-2 text-2xs font-bold uppercase tracking-wider text-zinc-600">
                        {g.cat}
                      </p>
                      <div className="flex flex-wrap gap-1.5 px-1 pb-1">
                        {g.tools.slice(0, 30).map((tool) => {
                          const on = existing.includes(tool.slug);
                          return (
                            <button
                              key={tool.slug}
                              onClick={() =>
                                setExisting(on ? existing.filter((s) => s !== tool.slug) : [...existing, tool.slug])
                              }
                              aria-pressed={on}
                              className={`rounded-full border px-2.5 py-1 text-2xs font-semibold transition-colors ${
                                on
                                  ? 'border-accent-500/60 bg-accent-500/15 text-accent-200'
                                  : 'border-white/10 bg-surface-2 text-zinc-400 hover:text-white'
                              }`}
                            >
                              {tool.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
              </div>
              {existing.length > 0 && (
                <p className="mt-2 text-2xs text-zinc-500">
                  {existing.length} ·{' '}
                  <button onClick={() => setExisting([])} className="text-accent-400 hover:underline">
                    {t('existingNone')}
                  </button>
                </p>
              )}
            </>
          )}
        </div>

        {/* Nav */}
        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={back}
            disabled={step === 0}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-surface-1 px-4 py-2.5 text-2xs font-bold text-zinc-300 transition-colors hover:text-white disabled:opacity-40"
          >
            <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden="true" /> {t('back')}
          </button>
          <button
            onClick={next}
            className="inline-flex items-center gap-2 rounded-xl bg-accent-500 px-5 py-2.5 text-2xs font-bold text-black transition-opacity hover:opacity-90"
          >
            {step >= steps.length - 1 ? t('seeSystem') : t('next')}
            <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden="true" />
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
