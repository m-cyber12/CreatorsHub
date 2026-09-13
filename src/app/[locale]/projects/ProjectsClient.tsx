'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from '@/i18n/navigation';
import { ALL_TOOLS } from '@/data/tools';
import { WORKFLOWS, workflowNodeCost } from '@/data/workflows';
import {
  loadProjects,
  createProject,
  deleteProject,
  addPrompt,
  removePrompt,
  toggleTool,
  toggleWorkflow,
  attachTools,
  setNotes,
  projectTools,
  projectMonthlyCost,
  projectMinutes,
  projectWorkflowCoverage,
  workflowMinutesFor,
  PROJECT_TYPES,
  type NoxiferaProject,
  type ProjectType,
} from '@/lib/projects';
import { PROJECT_TEMPLATES, type ProjectTemplate } from '@/data/projectTemplates';
import { collectBackup, restoreBackup } from '@/lib/backup';
import { encodeProjectShare, decodeProjectShare, type ProjectSharePayload } from '@/lib/projectShare';
import { SmartImage } from '@/components/SmartImage';
import {
  FolderKanban,
  Plus,
  Trash2,
  ArrowLeft,
  Copy,
  Check,
  GitBranch,
  Wallet,
  Clock,
  X,
  StickyNote,
  History as HistoryIcon,
  Database,
  Download,
  Upload,
  Share2,
} from 'lucide-react';

const TYPE_ICONS: Record<ProjectType, string> = {
  youtube: '▶️',
  podcast: '🎙️',
  newsletter: '✉️',
  campaign: '📣',
  'product-launch': '🚀',
  series: '📚',
};

/** Project type slug → i18n leaf key (slugs use hyphens, keys use camelCase). */
const TYPE_I18N: Record<ProjectType, string> = {
  youtube: 'type.youtube',
  podcast: 'type.podcast',
  newsletter: 'type.newsletter',
  campaign: 'type.campaign',
  'product-launch': 'type.productLaunch',
  series: 'type.series',
};

const EVENT_I18N: Record<string, string> = {
  'project.created': 'evProjectCreated',
  'prompt.added': 'evPromptAdded',
  'prompt.removed': 'evPromptRemoved',
  'tool.toggled': 'evToolToggled',
  'workflow.toggled': 'evWorkflowToggled',
  'notes.saved': 'evNotesSaved',
  'tools.attached': 'evToolsAttached',
};

export function ProjectsClient() {
  const t = useTranslations('projects');
  const [projects, setProjects] = useState<NoxiferaProject[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  // create form
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<ProjectType>('youtube');

  // detail form state
  const [promptTitle, setPromptTitle] = useState('');
  const [promptBody, setPromptBody] = useState('');
  const [toolQuery, setToolQuery] = useState('');
  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);

  const [pending, setPending] = useState<ProjectSharePayload | null>(null);

  useEffect(() => {
    setProjects(loadProjects());
    // Shared link: ?import=… → confirmation card (never auto-creates).
    const raw = new URLSearchParams(window.location.search).get('import');
    if (raw) {
      const dec = decodeProjectShare(raw);
      if (dec) setPending(dec);
      const sp = new URLSearchParams(window.location.search);
      sp.delete('import');
      const q = sp.toString();
      window.history.replaceState(null, '', q ? `?${q}` : window.location.pathname);
    }
    setReady(true);
  }, []);

  const selected = projects.find((p) => p.id === selectedId) ?? null;

  const refresh = () => setProjects(loadProjects());

  const toolMatches = useMemo(() => {
    const q = toolQuery.trim().toLowerCase();
    if (q.length < 2) return [];
    return ALL_TOOLS.filter(
      (x) => x.name.toLowerCase().includes(q) || x.slug.toLowerCase().includes(q)
    ).slice(0, 6);
  }, [toolQuery]);

  const now = () => new Date().toISOString();

  const handleCreate = () => {
    const p = createProject(name, type, now());
    if (p) {
      refresh();
      setName('');
      setCreating(false);
      setSelectedId(p.id);
    }
  };

  /** Start a project from a template: create + attach its tools and workflows. */
  const createFromTemplate = (tpl: ProjectTemplate) => {
    const p = createProject(t(`templates.${tpl.id}.name`), tpl.type, now());
    if (!p) return;
    if (tpl.toolSlugs.length > 0) attachTools(p.id, tpl.toolSlugs, now());
    for (const slug of tpl.workflowSlugs) toggleWorkflow(p.id, slug, now());
    refresh();
    setSelectedId(p.id);
  };

  // ── backup & restore ─────────────────────────────────────────────────
  const [backupMsg, setBackupMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const flashBackup = (m: string) => {
    setBackupMsg(m);
    window.setTimeout(() => setBackupMsg(null), 3000);
  };

  const downloadBackup = () => {
    const blob = new Blob([JSON.stringify(collectBackup(), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `noxifera-backup-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleRestoreFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const res = restoreBackup(JSON.parse(await file.text()));
      if (res.restored.length > 0) {
        refresh();
        flashBackup(t('backupRestored', { count: res.restored.length }));
      } else {
        flashBackup(t('backupInvalid'));
      }
    } catch {
      flashBackup(t('backupInvalid'));
    }
  };

  const handleDelete = (id: string) => {
    deleteProject(id);
    refresh();
    if (selectedId === id) setSelectedId(null);
  };

  /** Copy a shareable link for this project's structure. */
  const shareProject = async (p: NoxiferaProject) => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/projects?import=${encodeProjectShare(p)}`);
      setCopiedPrompt('share');
      window.setTimeout(() => setCopiedPrompt(null), 2000);
    } catch {
      /* clipboard blocked */
    }
  };

  /** Accept a shared project: create it with tools + workflows attached. */
  const createFromShare = (data: ProjectSharePayload) => {
    const p = createProject(data.name, data.type, now());
    if (!p) return;
    if (data.toolSlugs.length > 0) attachTools(p.id, data.toolSlugs, now());
    for (const slug of data.workflowSlugs) toggleWorkflow(p.id, slug, now());
    refresh();
    setPending(null);
    setSelectedId(p.id);
  };

  const copyPrompt = async (id: string, body: string) => {
    try {
      await navigator.clipboard.writeText(body);
      setCopiedPrompt(id);
      window.setTimeout(() => setCopiedPrompt(null), 2000);
    } catch {
      /* clipboard blocked */
    }
  };

  if (!ready) return null;

  // ── Detail view ─────────────────────────────────────────────────────
  if (selected) {
    const cost = projectMonthlyCost(selected);
    const minutes = projectMinutes(selected);
    return (
      <div className="mt-10 space-y-8">
        <button
          type="button"
          onClick={() => setSelectedId(null)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-400 hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" /> {t('backToList')}
        </button>

        {/* Project header */}
        <div className="flex flex-wrap items-center gap-4 rounded-3xl border border-white/10 bg-surface-1 p-6">
          <span className="text-3xl" aria-hidden="true">
            {TYPE_ICONS[selected.type]}
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-xl font-black text-white">{selected.name}</h2>
            <p className="mt-0.5 text-2xs text-zinc-500">
              {t(TYPE_I18N[selected.type])} · {t('updated', { date: new Date(selected.updatedAt).toLocaleDateString() })}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 font-mono text-2xs font-bold text-emerald-300">
              <Wallet className="h-3 w-3" /> ${cost.toFixed(2)}/mo
            </span>
            {minutes > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 font-mono text-2xs font-bold text-cyan-300">
                <Clock className="h-3 w-3" /> {minutes} {t('minUnit')}
              </span>
            )}
            <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 font-mono text-2xs font-bold text-zinc-400">
              {selected.prompts.length} {t('promptsShort')} · {selected.toolSlugs.length} {t('toolsShort')}
            </span>
            <button
              type="button"
              onClick={() => shareProject(selected)}
              aria-label={t('shareLink')}
              className="rounded-lg p-2 text-zinc-600 hover:bg-white/5 hover:text-accent-300"
            >
              {copiedPrompt === 'share' ? <Check className="h-4 w-4 text-emerald-400" /> : <Share2 className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={() => handleDelete(selected.id)}
              aria-label={t('deleteProject')}
              className="rounded-lg p-2 text-zinc-600 hover:bg-white/5 hover:text-rose-300"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Prompts */}
          <section className="rounded-3xl border border-white/10 bg-surface-1 p-6">
            <h3 className="text-sm font-bold text-white">{t('promptsTitle')}</h3>
            <div className="mt-3 space-y-2">
              <input
                type="text"
                value={promptTitle}
                onChange={(e) => setPromptTitle(e.target.value)}
                placeholder={t('promptTitlePh')}
                className="w-full rounded-xl border border-white/10 bg-surface-2 px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:border-accent-500/60 focus:outline-none"
              />
              <textarea
                value={promptBody}
                onChange={(e) => setPromptBody(e.target.value)}
                placeholder={t('promptBodyPh')}
                rows={3}
                className="w-full resize-y rounded-xl border border-white/10 bg-surface-2 px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:border-accent-500/60 focus:outline-none"
              />
              <button
                type="button"
                disabled={!promptTitle.trim() || !promptBody.trim()}
                onClick={() => {
                  addPrompt(selected.id, promptTitle, promptBody, now());
                  setPromptTitle('');
                  setPromptBody('');
                  refresh();
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-accent-500 px-4 py-2 text-2xs font-bold text-black transition-colors hover:bg-accent-400 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Plus className="h-3 w-3" /> {t('addPrompt')}
              </button>
            </div>
            {selected.prompts.length === 0 ? (
              <p className="mt-4 text-2xs text-zinc-600">{t('noPrompts')}</p>
            ) : (
              <ul className="mt-4 space-y-2.5">
                {selected.prompts.map((pr) => (
                  <li key={pr.id} className="rounded-xl border border-white/10 bg-surface-2/60 p-3.5">
                    <div className="flex items-center gap-2">
                      <p className="min-w-0 flex-1 truncate text-xs font-bold text-white">{pr.title}</p>
                      <button
                        type="button"
                        onClick={() => copyPrompt(pr.id, pr.body)}
                        aria-label={t('copyPrompt')}
                        className="rounded-md p-1.5 text-zinc-500 hover:bg-white/5 hover:text-accent-300"
                      >
                        {copiedPrompt === pr.id ? (
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          removePrompt(selected.id, pr.id, now());
                          refresh();
                        }}
                        aria-label={t('removePrompt')}
                        className="rounded-md p-1.5 text-zinc-600 hover:bg-white/5 hover:text-rose-300"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <p className="mt-1.5 line-clamp-3 whitespace-pre-line text-2xs leading-relaxed text-zinc-400">
                      {pr.body}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Workflows */}
          <section className="rounded-3xl border border-white/10 bg-surface-1 p-6">
            <h3 className="flex items-center gap-2 text-sm font-bold text-white">
              <GitBranch className="h-4 w-4 text-accent-400" /> {t('workflowsTitle')}
            </h3>
            <ul className="mt-3 space-y-2">
              {WORKFLOWS.map((w) => {
                const on = selected.workflowSlugs.includes(w.slug);
                return (
                  <li key={w.slug}>
                    <button
                      type="button"
                      aria-pressed={on}
                      onClick={() => {
                        toggleWorkflow(selected.id, w.slug, now());
                        refresh();
                      }}
                      className={`flex w-full items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left transition-colors ${
                        on
                          ? 'border-accent-500/60 bg-accent-500/15'
                          : 'border-white/10 bg-white/5 hover:border-white/25'
                      }`}
                    >
                      <span
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                          on ? 'border-accent-400 bg-accent-500' : 'border-zinc-600'
                        }`}
                      >
                        {on && <Check className="h-3 w-3 text-black" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className={`block truncate text-xs font-bold ${on ? 'text-accent-300' : 'text-zinc-200'}`}>
                          {w.title}
                        </span>
                        <span className="block truncate text-2xs text-zinc-500">{w.oneLiner}</span>
                      </span>
                      <span className="shrink-0 font-mono text-2xs text-zinc-500">
                        {workflowMinutesFor(w.slug)} {t('minUnit')}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>

            {/* Workflow coverage (upgrade #26) */}
            {projectWorkflowCoverage(selected).map((cov) => (
              <div key={cov.slug} className="mt-3 rounded-xl border border-white/10 bg-surface-0 p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-2xs font-bold text-zinc-200">{cov.title}</p>
                  <span className="ml-auto font-mono text-2xs text-zinc-500">
                    {t('coverageOf', { covered: cov.covered, total: cov.total })}
                  </span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/5">
                  <div
                    className={`h-full rounded-full ${cov.covered === cov.total ? 'bg-emerald-400' : 'bg-accent-500'}`}
                    style={{ width: `${cov.total ? (cov.covered / cov.total) * 100 : 0}%` }}
                  />
                </div>
                {cov.missing.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {cov.missing.map((m) => (
                      <button
                        key={m.toolSlug}
                        type="button"
                        onClick={() => {
                          toggleTool(selected.id, m.toolSlug, now());
                          refresh();
                        }}
                        title={m.label}
                        className="inline-flex items-center gap-1 rounded-full border border-dashed border-white/20 bg-white/5 px-2.5 py-0.5 text-2xs font-semibold text-zinc-300 transition-colors hover:border-emerald-400/60 hover:text-emerald-300"
                      >
                        <Plus className="h-2.5 w-2.5" aria-hidden="true" />
                        {m.toolName}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 flex items-center gap-1 text-2xs font-semibold text-emerald-300">
                    <Check className="h-3 w-3" aria-hidden="true" /> {t('coverageComplete')}
                  </p>
                )}
              </div>
            ))}
          </section>

          {/* Tools */}
          <section className="rounded-3xl border border-white/10 bg-surface-1 p-6">
            <h3 className="flex items-center gap-2 text-sm font-bold text-white">
              <Wallet className="h-4 w-4 text-emerald-400" /> {t('toolsTitle')}
            </h3>
            <input
              type="text"
              value={toolQuery}
              onChange={(e) => setToolQuery(e.target.value)}
              placeholder={t('toolSearchPh')}
              className="mt-3 w-full rounded-xl border border-white/10 bg-surface-2 px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:border-accent-500/60 focus:outline-none"
            />
            {toolQuery.trim().length >= 2 && (
              <ul className="mt-2 space-y-1">
                {toolMatches.length === 0 && <li className="px-1 text-2xs text-zinc-600">{t('noToolMatches')}</li>}
                {toolMatches.map((tool) => {
                  const on = selected.toolSlugs.includes(tool.slug);
                  const cost = workflowNodeCost(tool.slug);
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
                      <span className="min-w-0 flex-1 truncate text-2xs font-bold text-zinc-300">{tool.name}</span>
                      <span className="shrink-0 font-mono text-2xs text-emerald-400">
                        {cost > 0 ? `$${cost}/mo` : t('freeTool')}
                      </span>
                      <button
                        type="button"
                        aria-pressed={on}
                        onClick={() => {
                          toggleTool(selected.id, tool.slug, now());
                          refresh();
                        }}
                        className={`shrink-0 rounded-lg border px-2 py-1 text-2xs font-bold transition-colors ${
                          on
                            ? 'border-accent-500/60 bg-accent-500/15 text-accent-300'
                            : 'border-white/10 bg-white/5 text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        {on ? '✓' : <Plus className="inline h-3 w-3" />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
            {selected.toolSlugs.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {projectTools(selected).map((tool) => (
                  <span
                    key={tool.slug}
                    className="inline-flex items-center gap-1.5 rounded-full border border-accent-500/40 bg-accent-500/10 px-2.5 py-1 text-2xs font-bold text-accent-300"
                  >
                    {tool.name}
                    <button
                      type="button"
                      onClick={() => {
                        toggleTool(selected.id, tool.slug, now());
                        refresh();
                      }}
                      aria-label={`${t('removePrompt')} — ${tool.name}`}
                      className="text-accent-400 hover:text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-2xs text-zinc-600">{t('noTools')}</p>
            )}
          </section>

          {/* Notes + history */}
          <section className="rounded-3xl border border-white/10 bg-surface-1 p-6">
            <h3 className="flex items-center gap-2 text-sm font-bold text-white">
              <StickyNote className="h-4 w-4 text-amber-400" /> {t('notesTitle')}
            </h3>
            <ProjectNotes project={selected} t={t} onSaved={refresh} />

            <h3 className="mt-6 flex items-center gap-2 text-sm font-bold text-white">
              <HistoryIcon className="h-4 w-4 text-zinc-400" /> {t('historyTitle')}
            </h3>
            <ul className="mt-3 space-y-1.5">
              {[...selected.history].reverse().slice(0, 10).map((h, i) => (
                <li key={`${h.at}-${i}`} className="flex items-baseline gap-2 text-2xs">
                  <span className="shrink-0 font-mono text-zinc-600">
                    {new Date(h.at).toLocaleDateString()} {new Date(h.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="text-zinc-400">{t(EVENT_I18N[h.event] ?? 'evProjectCreated')}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    );
  }

  // ── List view ───────────────────────────────────────────────────────
  return (
    <div className="mt-10 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-bold text-zinc-400">
          {t('countLabel', { count: String(projects.length) })}
        </p>
        <button
          type="button"
          onClick={() => setCreating((c) => !c)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-accent-500 px-4 py-2.5 text-xs font-bold text-black transition-colors hover:bg-accent-400 shadow-lg"
        >
          <Plus className="h-3.5 w-3.5" /> {t('newProject')}
        </button>
      </div>

      {creating && (
        <div className="rounded-3xl border border-accent-500/30 bg-surface-1 p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="flex-1">
              <span className="text-2xs font-bold text-zinc-400">{t('projectName')}</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('projectNamePh')}
                className="mt-1 w-full rounded-xl border border-white/10 bg-surface-2 px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-accent-500/60 focus:outline-none"
              />
            </label>
            <label>
              <span className="text-2xs font-bold text-zinc-400">{t('projectType')}</span>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as ProjectType)}
                className="mt-1 block rounded-xl border border-white/10 bg-surface-2 px-3 py-2.5 text-sm font-bold text-white focus:border-accent-500/60 focus:outline-none"
              >
                {PROJECT_TYPES.map((tp) => (
                  <option key={tp} value={tp}>
                    {TYPE_ICONS[tp]} {t(TYPE_I18N[tp])}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={!name.trim()}
                onClick={handleCreate}
                className="rounded-xl bg-accent-500 px-5 py-2.5 text-xs font-bold text-black hover:bg-accent-400 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {t('create')}
              </button>
              <button
                type="button"
                onClick={() => setCreating(false)}
                className="rounded-xl border border-white/10 bg-surface-2 px-4 py-2.5 text-xs font-bold text-zinc-300 hover:text-white"
              >
                {t('cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shared project confirmation (upgrade #24) */}
      {pending && (
        <div className="mb-6 rounded-3xl border border-accent-500/40 bg-accent-500/10 p-5">
          <p className="text-sm font-black text-accent-300">{t('importTitle')}</p>
          <p className="mt-1 text-2xs text-zinc-300">
            <span className="font-bold text-white">“{pending.name}”</span> — {t('importSub')}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => createFromShare(pending)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-accent-500 px-4 py-2 text-2xs font-bold text-black transition-opacity hover:opacity-90"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" /> {t('importCreate')}
            </button>
            <button
              type="button"
              onClick={() => setPending(null)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-surface-1 px-4 py-2 text-2xs font-bold text-zinc-300 hover:text-white"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" /> {t('importDismiss')}
            </button>
          </div>
        </div>
      )}

      {projects.length === 0 ? (
        <div className="space-y-8">
          <div className="flex flex-col items-center rounded-3xl border border-dashed border-white/10 bg-surface-1 py-12 text-center">
            <FolderKanban className="mb-3 h-10 w-10 text-zinc-600" />
            <h3 className="text-base font-bold text-white">{t('emptyTitle')}</h3>
            <p className="mt-1 max-w-md text-xs text-zinc-500">{t('emptySub')}</p>
          </div>
          <section>
            <h3 className="text-sm font-black text-white">{t('templatesTitle')}</h3>
            <p className="mt-1 text-xs text-zinc-500">{t('templatesSub')}</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {PROJECT_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => createFromTemplate(tpl)}
                  className="group flex flex-col rounded-3xl border border-white/10 bg-surface-1 p-5 text-left transition-all hover:border-accent-500/50"
                >
                  <p className="text-sm font-black text-white group-hover:text-accent-300">
                    {t(`templates.${tpl.id}.name`)}
                  </p>
                  <p className="mt-1 text-2xs leading-relaxed text-zinc-500">
                    {t(`templates.${tpl.id}.desc`)}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    {tpl.toolSlugs.map((s) => (
                      <span
                        key={s}
                        className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-2xs text-zinc-400"
                      >
                        {ALL_TOOLS.find((x) => x.slug === s)?.name ?? s}
                      </span>
                    ))}
                    {tpl.workflowSlugs.length > 0 && (
                      <span className="rounded-full border border-accent-500/40 bg-accent-500/10 px-2 py-0.5 text-2xs font-semibold text-accent-300">
                        ✦ {t('templatesWorkflowChip')}
                      </span>
                    )}
                  </div>
                  <span className="mt-3 inline-flex items-center gap-1 text-2xs font-bold text-accent-400">
                    <Plus className="h-3 w-3" aria-hidden="true" /> {t('templatesCreate')}
                  </span>
                </button>
              ))}
            </div>
          </section>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => {
            const cost = projectMonthlyCost(p);
            const minutes = projectMinutes(p);
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedId(p.id)}
                className="group flex flex-col rounded-3xl border border-white/10 bg-surface-1 p-5 text-left transition-all hover:border-accent-500/50"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl" aria-hidden="true">
                    {TYPE_ICONS[p.type]}
                  </span>
                  <p className="min-w-0 flex-1 truncate text-sm font-black text-white group-hover:text-accent-300">
                    {p.name}
                  </p>
                </div>
                <p className="mt-1 text-2xs text-zinc-500">{t(TYPE_I18N[p.type])}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2 font-mono text-2xs font-bold">
                  <span className="text-emerald-300">${cost.toFixed(2)}/mo</span>
                  {minutes > 0 && <span className="text-cyan-300">{minutes} {t('minUnit')}</span>}
                  <span className="text-zinc-500">
                    {p.prompts.length}P · {p.toolSlugs.length}T · {p.workflowSlugs.length}W
                  </span>
                </div>
                {(() => {
                  const covs = projectWorkflowCoverage(p);
                  const total = covs.reduce((s, c) => s + c.total, 0);
                  const covered = covs.reduce((s, c) => s + c.covered, 0);
                  if (covs.length === 0 || total === 0) return null;
                  return (
                    <div
                      className="mt-3 flex items-center gap-2"
                      title={t('coverageOf', { covered, total })}
                      aria-label={t('coverageOf', { covered, total })}
                    >
                      <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/5">
                        <div
                          className={`h-full rounded-full ${covered === total ? 'bg-emerald-400/80' : 'bg-accent-500/80'}`}
                          style={{ width: `${Math.round((covered / total) * 100)}%` }}
                        />
                      </div>
                      <span className="text-zinc-500">
                        {covered}/{total}
                      </span>
                    </div>
                  );
                })()}
                <p className="mt-2 text-2xs text-zinc-600">
                  {t('updated', { date: new Date(p.updatedAt).toLocaleDateString() })}
                </p>
              </button>
            );
          })}
        </div>
      )}

      {/* Backup & restore (upgrade #23) */}
      <section className="mt-10">
        <div className="rounded-3xl border border-white/10 bg-surface-1 p-6">
          <h3 className="flex items-center gap-2 text-sm font-bold text-white">
            <Database className="h-4 w-4 text-accent-400" aria-hidden="true" /> {t('backupTitle')}
          </h3>
          <p className="mt-1 max-w-2xl text-2xs leading-relaxed text-zinc-500">{t('backupSub')}</p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={downloadBackup}
              className="inline-flex items-center gap-2 rounded-xl border border-accent-500/40 bg-accent-500/10 px-4 py-2.5 text-2xs font-bold text-accent-300 transition-colors hover:bg-accent-500/20"
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" /> {t('backupDownload')}
            </button>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-surface-0 px-4 py-2.5 text-2xs font-bold text-zinc-200 transition-colors hover:border-accent-500/50"
            >
              <Upload className="h-3.5 w-3.5" aria-hidden="true" /> {t('backupRestore')}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={handleRestoreFile}
              aria-label={t('backupRestore')}
            />
            {backupMsg && <span className="text-2xs font-semibold text-emerald-300">{backupMsg}</span>}
          </div>
        </div>
      </section>
    </div>
  );
}

function ProjectNotes({
  project,
  t,
  onSaved,
}: {
  project: NoxiferaProject;
  t: (k: string) => string;
  onSaved: () => void;
}) {
  const [draft, setDraft] = useState(project.notes);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setDraft(project.notes);
  }, [project.id, project.notes]);

  return (
    <div className="mt-3">
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder={t('notesPh')}
        rows={4}
        className="w-full resize-y rounded-xl border border-white/10 bg-surface-2 px-3 py-2 text-xs leading-relaxed text-white placeholder:text-zinc-600 focus:border-accent-500/60 focus:outline-none"
      />
      <button
        type="button"
        disabled={draft === project.notes}
        onClick={() => {
          setNotes(project.id, draft, new Date().toISOString());
          setSaved(true);
          onSaved();
          window.setTimeout(() => setSaved(false), 2000);
        }}
        className="mt-2 inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-surface-2 px-4 py-2 text-2xs font-bold text-zinc-300 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        {saved ? <Check className="h-3 w-3 text-emerald-400" /> : null}
        {saved ? t('notesSaved') : t('saveNotes')}
      </button>
    </div>
  );
}
