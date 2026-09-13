'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import {
  Bookmark,
  Check,
  Clock,
  Copy,
  ExternalLink,
  Pencil,
  Rocket,
  Share2,
  Trash2,
  Wallet,
  FolderKanban,
  Plus,
} from 'lucide-react';
import { SmartImage } from '@/components/SmartImage';
import { VerificationBadge } from '@/components/VerificationBadge';
import { WORKFLOWS, type WorkflowClientData } from '@/data/workflows';
import { loadProjects, toggleWorkflow, type NoxiferaProject } from '@/lib/projects';
import { track } from '@/lib/analytics';

const SAVED_KEY = 'noxifera_workflows';
/** Playbook slugs that have a real /workflows page. Anything else (custom /my
 *  workflows, retired playbooks) opens in the workspace editor instead. */
const KNOWN_PLAYBOOK_SLUGS = new Set(WORKFLOWS.map((w) => w.slug));

interface SavedWorkflow {
  id: string;
  name: string;
  slug: string;
  picks: Record<string, string>;
  savedAt: string;
}

type NodeData = WorkflowClientData['nodes'][number];

function readUrlPicks(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const sp = new URLSearchParams(window.location.search);
  const picks: Record<string, string> = {};
  (sp.get('pick') || '').split(',').forEach((pair) => {
    const [id, slug] = pair.split(':');
    if (id && slug) picks[id] = slug;
  });
  return picks;
}

export function WorkflowClient({ data }: { data: WorkflowClientData }) {
  const t = useTranslations('workflows');
  const [picks, setPicks] = useState<Record<string, string>>({});
  const [editMode, setEditMode] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [saved, setSaved] = useState<SavedWorkflow[]>([]);
  const [projects, setProjects] = useState<NoxiferaProject[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate: URL picks win, then load saved list + projects.
  useEffect(() => {
    setPicks(readUrlPicks());
    setProjects(loadProjects());
    try {
      const raw = localStorage.getItem(SAVED_KEY);
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) {
          setSaved(arr.filter((s) => s && typeof s.id === 'string' && typeof s.slug === 'string'));
        }
      }
    } catch {
      /* corrupted storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(SAVED_KEY, JSON.stringify(saved));
    } catch {
      /* private mode */
    }
  }, [saved, hydrated]);

  const activeTool = (n: NodeData): string | undefined => picks[n.id] ?? n.tool;

  const totalCost = useMemo(() => {
    // Computed from the catalog-derived cost map — renders correctly in SSR
    // (picks are {} on the server) and updates live when the user edits.
    return Math.round(
      data.nodes.reduce((sum, n) => {
        const slug = picks[n.id] ?? n.tool;
        return sum + (slug ? data.costBySlug[slug] ?? 0 : 0);
      }, 0)
    );
  }, [data, picks]);

  const totalMinutes = useMemo(() => data.nodes.reduce((s, n) => s + n.minutes, 0), [data]);

  const flash = (key: string) => {
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const persistPicksInUrl = (next: Record<string, string>) => {
    const sp = new URLSearchParams();
    const entries = Object.entries(next).filter(([, s]) => s);
    if (entries.length > 0) sp.set('pick', entries.map(([id, s]) => `${id}:${s}`).join(','));
    const q = sp.toString();
    window.history.replaceState(null, '', q ? `?${q}` : window.location.pathname);
  };

  const save = () => {
    const entry: SavedWorkflow = {
      id: `${Date.now()}`,
      name: `${data.title}${Object.keys(picks).length > 0 ? ' (edited)' : ''}`,
      slug: data.slug,
      picks,
      savedAt: new Date().toISOString(),
    };
    setSaved((cur) => [entry, ...cur].slice(0, 12));
    track('workflow_saved', { slug: data.slug, steps: Object.keys(picks).length });
    flash('save');
  };

  const duplicate = () => {
    setSaved((cur) =>
      [
        ...cur,
        ...cur
          .filter((s) => s.slug === data.slug)
          .slice(0, 1)
          .map((s) => ({ ...s, id: `${Date.now()}-dup`, name: `${s.name} (copy)` })),
      ].slice(0, 12)
    );
    flash('duplicate');
  };

  const share = async () => {
    const sp = new URLSearchParams();
    const entries = Object.entries(picks).filter(([, s]) => s);
    if (entries.length > 0) sp.set('pick', entries.map(([id, s]) => `${id}:${s}`).join(','));
    const q = sp.toString();
    const url = `${window.location.origin}/workflows/${data.slug}${q ? `?${q}` : ''}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      /* clipboard blocked */
    }
    flash('share');
  };

  const publish = async () => {
    const toolNameFor = (n: NodeData): string => {
      if (n.manual) return '—';
      const slug = picks[n.id] ?? n.tool;
      if (slug === n.tool) return n.toolInfo?.name ?? '—';
      return n.alternativeInfo.find((a) => a.slug === slug)?.name ?? '—';
    };
    const lines = [
      `# ${data.title}`,
      '',
      data.oneLiner,
      '',
      ...data.nodes.flatMap((n, i) => {
        const out: string[] = [`${i + 1}. **${n.label}** — ${toolNameFor(n)}`];
        out.push(
          `   - ${t('input')}: ${n.input} → ${t('output')}: ${n.output} (${n.minutes} ${t('minutesShort')})`
        );
        out.push(`   - ${n.instructions}`);
        if (n.prompt) out.push(`   - ${t('prompt')}: “${n.prompt}”`);
        return out;
      }),
      '',
      `${t('totalTime')}: ${totalMinutes} ${t('minutesShort')} · ${t('totalCost')}: ~$${totalCost}`,
    ];
    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      flash('publish');
    } catch {
      /* clipboard blocked */
    }
  };

  const applyPicks = (next: Record<string, string>) => {
    setPicks(next);
    persistPicksInUrl(next);
  };

  return (
    <div>
      {/* Actions */}
      <div className="mt-8 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={save}
          className="inline-flex items-center gap-1.5 rounded-xl border border-accent-500/40 bg-accent-500/10 px-3 py-2 text-2xs font-bold text-accent-300 hover:bg-accent-500/20"
        >
          <Bookmark className="h-3.5 w-3.5" aria-hidden="true" />
          {copied === 'save' ? t('savedFlash') : t('save')}
        </button>
        <button
          type="button"
          onClick={duplicate}
          className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-surface-1 px-3 py-2 text-2xs font-bold text-zinc-300 hover:border-accent-500/40"
        >
          <Copy className="h-3.5 w-3.5" aria-hidden="true" />
          {copied === 'duplicate' ? t('savedFlash') : t('duplicate')}
        </button>
        <button
          type="button"
          onClick={() => setEditMode((e) => !e)}
          aria-pressed={editMode}
          className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-2xs font-bold transition-colors ${
            editMode
              ? 'border-accent-500/60 bg-accent-500/20 text-accent-200'
              : 'border-white/10 bg-surface-1 text-zinc-300 hover:border-accent-500/40'
          }`}
        >
          <Pencil className="h-3.5 w-3.5" aria-hidden="true" /> {t('edit')}
        </button>
        <button
          type="button"
          onClick={share}
          className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-surface-1 px-3 py-2 text-2xs font-bold text-zinc-300 hover:border-accent-500/40"
        >
          <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
          {copied === 'share' ? t('linkCopied') : t('share')}
        </button>
        <button
          type="button"
          onClick={publish}
          className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-surface-1 px-3 py-2 text-2xs font-bold text-zinc-300 hover:border-accent-500/40"
        >
          <Check className="h-3.5 w-3.5" aria-hidden="true" />
          {copied === 'publish' ? t('planCopied') : t('publish')}
        </button>
        <Link
          href="/ai-studio/prompt-builder"
          className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-surface-1 px-3 py-2 text-2xs font-bold text-zinc-300 hover:border-accent-500/40"
        >
          <Rocket className="h-3.5 w-3.5" aria-hidden="true" />
          {t('openStudio')}
          <ExternalLink className="h-3 w-3" aria-hidden="true" />
        </Link>
      </div>

      {/* Totals (live when edited) */}
      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="glass-panel rounded-2xl p-4">
          <p className="flex items-center gap-1.5 text-2xs font-bold uppercase tracking-wider text-zinc-500">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" /> {t('totalTime')}
          </p>
          <p className="mt-1 font-mono text-2xl font-black tabular-nums text-zinc-200">
            {totalMinutes}
            <span className="text-sm text-zinc-500"> {t('minutesShort')}</span>
          </p>
        </div>
        <div className="rounded-2xl border border-accent-500/30 bg-accent-500/10 p-4">
          <p className="flex items-center gap-1.5 text-2xs font-bold uppercase tracking-wider text-accent-300/80">
            <Wallet className="h-3.5 w-3.5" aria-hidden="true" /> {t('totalCost')}
          </p>
          <p className="mt-1 font-mono text-2xl font-black tabular-nums text-accent-300">
            ${totalCost}
            <span className="font-sans text-2xs font-normal text-accent-300/70"> {t('perRun')}</span>
          </p>
        </div>
      </div>

      {/* Pipeline */}
      <h2 className="mt-10 text-xl font-black">{t('pipelineTitle')}</h2>
      <ol className="mt-5 space-y-4">
        {data.nodes.map((n, i) => {
          const activeSlug = activeTool(n);
          const activeInfo =
            activeSlug === n.tool ? n.toolInfo : n.alternativeInfo.find((a) => a.slug === activeSlug);
          const options = [n.tool, ...n.alternatives].filter(Boolean) as string[];
          return (
            <li key={n.id} className="glass-panel rounded-2xl p-5">
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-500 font-mono text-2xs font-black text-black">
                  {i + 1}
                </span>
                <h3 className="text-sm font-black">{n.label}</h3>
                {n.manual && (
                  <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-2xs font-semibold text-zinc-400">
                    {t('manualBadge')}
                  </span>
                )}
                <span className="ml-auto font-mono text-2xs tabular-nums text-zinc-500">
                  {n.minutes} {t('minutesShort')}
                </span>
              </div>

              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <p className="rounded-xl border border-white/5 bg-surface-0 px-3 py-2 text-2xs text-zinc-400">
                  <span className="font-bold text-zinc-500">{t('input')}: </span>
                  {n.input}
                </p>
                <p className="rounded-xl border border-white/5 bg-surface-0 px-3 py-2 text-2xs text-zinc-400">
                  <span className="font-bold text-zinc-500">{t('output')}: </span>
                  {n.output}
                </p>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-zinc-300">{n.instructions}</p>

              {n.prompt && (
                <details className="mt-3 rounded-xl border border-accent-500/20 bg-accent-500/5 px-4 py-3">
                  <summary className="flex cursor-pointer list-none items-center justify-between text-2xs font-bold text-accent-300">
                    {t('prompt')}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        navigator.clipboard?.writeText(n.prompt as string);
                        flash(`prompt-${n.id}`);
                      }}
                      className="rounded-md p-1 hover:bg-white/10"
                      aria-label={t('copyPrompt')}
                    >
                      {copied === `prompt-${n.id}` ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                      )}
                    </button>
                  </summary>
                  <pre className="mt-2 whitespace-pre-wrap font-mono text-2xs leading-relaxed text-zinc-300">
                    {n.prompt}
                  </pre>
                </details>
              )}

              <div className="mt-4 flex flex-col gap-4 border-t border-white/5 pt-4 sm:flex-row sm:items-center">
                {activeInfo ? (
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <SmartImage
                      src={activeInfo.logo}
                      alt=""
                      width={40}
                      height={40}
                      className="h-10 w-10 rounded-lg border border-white/10 object-cover"
                    />
                    <div className="min-w-0">
                      <Link
                        href={`/tool/${activeInfo.slug}`}
                        className="text-sm font-bold text-accent-300 hover:text-accent-200"
                      >
                        {activeInfo.name}
                      </Link>{' '}
                      <VerificationBadge level={activeInfo.verificationLevel} />
                      <p className="truncate text-2xs text-zinc-500">{activeInfo.tagline}</p>
                    </div>
                    <span className="ml-auto hidden font-mono text-xs font-bold tabular-nums text-emerald-300 sm:block">
                      {(data.costBySlug[activeInfo.slug] ?? 0) > 0
                        ? `$${data.costBySlug[activeInfo.slug]}/mo`
                        : activeInfo.pricing}
                    </span>
                  </div>
                ) : (
                  <p className="flex-1 text-2xs text-zinc-500">{t('manualBadge')}</p>
                )}

                {editMode && options.length > 0 && !n.manual && (
                  <label className="text-2xs font-semibold text-zinc-500">
                    <span className="sr-only">{n.label}</span>
                    <select
                      value={activeSlug ?? ''}
                      onChange={(e) => {
                        const next = { ...picks };
                        if (e.target.value === n.tool) delete next[n.id];
                        else next[n.id] = e.target.value;
                        applyPicks(next);
                      }}
                      className="mt-1 block rounded-xl border border-white/10 bg-surface-2 px-3 py-2 text-2xs font-semibold text-white focus:border-accent-500 focus:outline-none"
                    >
                      {options.map((slug) => {
                        const info =
                          slug === n.tool ? n.toolInfo : n.alternativeInfo.find((a) => a.slug === slug);
                        return (
                          <option key={slug} value={slug}>
                            {info?.name ?? slug}
                            {slug === n.tool ? '' : ` — ${t('alternatives')}`}
                          </option>
                        );
                      })}
                    </select>
                  </label>
                )}

                {!editMode && n.alternatives.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-2xs text-zinc-500">{t('alternatives')}:</span>
                    {n.alternativeInfo.map((a) => (
                      <Link
                        key={a.slug}
                        href={`/tool/${a.slug}`}
                        className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-2xs font-semibold text-zinc-300 transition-colors hover:border-accent-500/50 hover:text-accent-300"
                      >
                        {a.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      {/* Saved workflows */}
      {hydrated && saved.length > 0 && (
        <section className="mt-12">
          <h2 className="text-base font-black">{t('savedWorkflows')}</h2>
          <ul className="mt-3 space-y-2">
            {saved.map((s) => (
              <li
                key={s.id}
                className="flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-surface-1 px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-zinc-200">{s.name}</p>
                  <p className="text-2xs text-zinc-500">
                    {new Date(s.savedAt).toLocaleDateString()}
                    {Object.keys(s.picks).length > 0 && ` · ${Object.keys(s.picks).length} ✎`}
                  </p>
                </div>
                <Link
                  href={
                    KNOWN_PLAYBOOK_SLUGS.has(s.slug)
                      ? `/workflows/${s.slug}${
                          Object.keys(s.picks).length > 0
                            ? `?pick=${Object.entries(s.picks).map(([id, sl]) => `${id}:${sl}`).join(',')}`
                            : ''
                        }`
                      : `/my?tab=workflows&open=${encodeURIComponent(s.id)}`
                  }
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-2xs font-bold text-zinc-200 hover:border-accent-500/50 hover:text-accent-300"
                >
                  {t('open')}
                </Link>
                <button
                  type="button"
                  onClick={() => setSaved((cur) => cur.filter((x) => x.id !== s.id))}
                  className="rounded-lg p-2 text-zinc-600 hover:bg-white/5 hover:text-rose-300"
                  aria-label={t('delete')}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Link to my projects (upgrade #20) */}
      {hydrated && projects.length > 0 && (
        <section className="mt-12">
          <h2 className="flex items-center gap-2 text-base font-black">
            <FolderKanban className="h-4 w-4 text-accent-400" aria-hidden="true" /> {t('projectsTitle')}
          </h2>
          <p className="mt-1 text-2xs text-zinc-500">{t('projectsSub')}</p>
          <ul className="mt-3 space-y-2">
            {projects.map((p) => {
              const linked = p.workflowSlugs.includes(data.slug);
              return (
                <li
                  key={p.id}
                  className="flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-surface-1 px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-zinc-200">{p.name}</p>
                    <p className="text-2xs text-zinc-500">
                      {new Date(p.updatedAt).toLocaleDateString()}
                      {p.workflowSlugs.length > 0 && ` · ${p.workflowSlugs.length} ✦`}
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-pressed={linked}
                    onClick={() => {
                      toggleWorkflow(p.id, data.slug, new Date().toISOString());
                      setProjects(loadProjects());
                    }}
                    className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-2xs font-bold transition-colors ${
                      linked
                        ? 'border-accent-500/60 bg-accent-500/15 text-accent-300 hover:bg-accent-500/25'
                        : 'border-white/10 bg-white/5 text-zinc-200 hover:border-accent-500/50 hover:text-accent-300'
                    }`}
                  >
                    {linked ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <Plus className="h-3.5 w-3.5" aria-hidden="true" />}
                    {linked ? t('unlinkProject') : t('linkProject')}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
