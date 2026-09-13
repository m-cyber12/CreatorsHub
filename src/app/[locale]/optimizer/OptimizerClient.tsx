'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { Trash2, Wallet, Zap, ExternalLink, Info, Check, FolderKanban } from 'lucide-react';
import { ALL_TOOLS, type Tool } from '@/data/tools';
import {
  analyzeSubscriptions,
  quickAddCandidates,
  type SubInput,
  type FindingKind,
} from '@/lib/optimizer';
import { attachTools, createProject, loadProjects, type NoxiferaProject } from '@/lib/projects';

const STORAGE_KEY = 'noxifera_optimizer';

function parseMonthly(price?: string): number {
  if (!price || /free/i.test(price)) return 0;
  if (/one-?time|lifetime/i.test(price)) return 0;
  const m = price.replace(/,/g, '').match(/\$?(\d+(?:\.\d+)?)/);
  if (!m) return 0;
  const n = parseFloat(m[1]);
  return /yr|year/i.test(price) ? Math.round((n / 12) * 100) / 100 : n;
}

export function OptimizerClient() {
  const t = useTranslations('optimizer');
  const [rows, setRows] = useState<SubInput[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [projects, setProjects] = useState<NoxiferaProject[]>([]);
  const [attachTarget, setAttachTarget] = useState('');
  const [projMsg, setProjMsg] = useState<string | null>(null);
  const [projKind, setProjKind] = useState<'attach' | 'create' | null>(null);
  const [nameDraft, setNameDraft] = useState('');
  const [priceDraft, setPriceDraft] = useState('');
  const [catDraft, setCatDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setRows(JSON.parse(raw));
    } catch {
      /* corrupted storage — start fresh */
    }
    setProjects(loadProjects());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
    } catch {
      /* storage unavailable */
    }
  }, [rows, loaded]);

  const toolByName = useMemo(() => {
    const map = new Map<string, Tool>();
    for (const tool of ALL_TOOLS) map.set(tool.name.toLowerCase(), tool);
    return map;
  }, []);

  const categories = useMemo(
    () => Array.from(new Set(ALL_TOOLS.map((x) => x.category))).sort(),
    []
  );
  const quickAdds = useMemo(() => {
    const existing = new Set(rows.map((r) => r.slug));
    return quickAddCandidates(12).filter((q) => !existing.has(q.slug) && q.pricing !== 'Free');
  }, [rows]);

  const result = useMemo(() => analyzeSubscriptions(rows), [rows]);
  const knownSlugs = useMemo(
    () => rows.map((r) => r.slug).filter((x): x is string => Boolean(x)),
    [rows]
  );

  const flashProjectMsg = (msg: string, kind: 'attach' | 'create' | null = null) => {
    setProjMsg(msg);
    setProjKind(kind);
    setTimeout(() => {
      setProjMsg(null);
      setProjKind(null);
    }, 2500);
  };

  /** Attach the catalog-known subscriptions to an existing project (non-destructive). */
  const attachSubsToProject = () => {
    if (!attachTarget) return;
    const { added } = attachTools(attachTarget, knownSlugs, new Date().toISOString());
    setProjects(loadProjects());
    flashProjectMsg(added > 0 ? t('attached', { count: added }) : t('upToDate'), 'attach');
  };

  /** One click: the current stack becomes a new project with all known tools attached. */
  const saveSubsAsProject = () => {
    const p = createProject(t('projectName'), 'campaign', new Date().toISOString());
    if (!p) {
      flashProjectMsg(t('projectsFull'));
      return;
    }
    attachTools(p.id, knownSlugs, new Date().toISOString());
    setProjects(loadProjects());
    flashProjectMsg(t('created'), 'create');
  };

  function addRow() {
    const name = nameDraft.trim();
    const price = parseFloat(priceDraft);
    if (!name || Number.isNaN(price) || price < 0) return;
    const known = toolByName.get(name.toLowerCase());
    setRows((r) => [
      ...r,
      {
        id: `${Date.now()}-${r.length}`,
        name: known ? known.name : name,
        slug: known?.slug,
        category: known?.category ?? (catDraft || undefined),
        monthlyUsd: Math.round(price * 100) / 100,
      },
    ]);
    setNameDraft('');
    setPriceDraft('');
    setCatDraft('');
    inputRef.current?.focus();
  }

  function quickAdd(tool: Tool) {
    setRows((r) => [
      ...r,
      {
        id: `${Date.now()}-${r.length}`,
        name: tool.name,
        slug: tool.slug,
        category: tool.category,
        monthlyUsd: parseMonthly(tool.startingPrice),
      },
    ]);
  }

  function updateRow(id: string, patch: Partial<SubInput>) {
    setRows((r) => r.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  }

  function removeRow(id: string) {
    setRows((r) => r.filter((x) => x.id !== id));
  }

  const kindBadge: Record<FindingKind, string> = {
    duplicate: 'border-ember-500/40 bg-ember-500/10 text-ember-300',
    'free-tier': 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
    cheaper: 'border-sky-500/40 bg-sky-500/10 text-sky-300',
  };
  const kindLabel: Record<FindingKind, string> = {
    duplicate: t('kindDuplicate'),
    'free-tier': t('kindFreeTier'),
    cheaper: t('kindCheaper'),
  };

  return (
    <div>
      <span className="inline-flex items-center gap-2 rounded-full border border-accent-500/20 bg-accent-500/10 px-4 py-1.5 text-2xs font-semibold text-accent-300">
        <Wallet className="h-3.5 w-3.5" aria-hidden="true" /> {t('title')}
      </span>
      <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">{t('title')}</h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-zinc-400">{t('intro')}</p>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        {/* ── Input side ─────────────────────────────────────────────── */}
        <section>
          <h2 className="text-lg font-black">{t('listTitle')}</h2>

          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto]">
            <div className="relative">
              <input
                ref={inputRef}
                value={nameDraft}
                onChange={(e) => {
                  const v = e.target.value;
                  setNameDraft(v);
                  const known = toolByName.get(v.trim().toLowerCase());
                  if (known) {
                    setCatDraft('');
                    if (!priceDraft) setPriceDraft(String(parseMonthly(known.startingPrice)));
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') addRow();
                }}
                placeholder={t('namePlaceholder')}
                list="optimizer-tools"
                className="w-full rounded-xl border border-white/10 bg-surface-1 px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition-colors focus:border-accent-500/50"
                aria-label={t('namePlaceholder')}
              />
              <datalist id="optimizer-tools">
                {ALL_TOOLS.map((tool) => (
                  <option key={tool.slug} value={tool.name}>
                    {tool.category}
                  </option>
                ))}
              </datalist>
            </div>
            <input
              value={priceDraft}
              onChange={(e) => setPriceDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') addRow();
              }}
              type="number"
              min="0"
              step="0.01"
              placeholder={t('priceLabel')}
              className="rounded-xl border border-white/10 bg-surface-1 px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition-colors focus:border-accent-500/50 sm:w-36"
              aria-label={t('priceLabel')}
            />
          </div>

          {nameDraft.trim() && !toolByName.get(nameDraft.trim().toLowerCase()) && (
            <select
              value={catDraft}
              onChange={(e) => setCatDraft(e.target.value)}
              className="mt-2 rounded-xl border border-white/10 bg-surface-1 px-4 py-3 text-sm text-zinc-300 outline-none"
              aria-label={t('customCategory')}
            >
              <option value="">{t('customCategory')}</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}

          {rows.length > 0 && (
            <ul className="mt-4 space-y-2">
              {rows.map((row) => {
                const known = Boolean(row.slug);
                return (
                  <li
                    key={row.id}
                    className="flex items-center gap-3 rounded-xl border border-white/5 bg-surface-1 px-4 py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-2 truncate text-sm font-bold text-zinc-200">
                        {row.name}
                        {known && (
                          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                            {t('known')}
                          </span>
                        )}
                      </p>
                      <p className="truncate text-2xs text-zinc-500">
                        {(row.slug
                          ? ALL_TOOLS.find((x) => x.slug === row.slug)?.category
                          : row.category) ?? '—'}
                      </p>
                    </div>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={row.monthlyUsd}
                      onChange={(e) =>
                        updateRow(row.id, {
                          monthlyUsd: Math.max(0, parseFloat(e.target.value) || 0),
                        })
                      }
                      className="w-24 rounded-lg border border-white/10 bg-surface-0 px-3 py-2 text-right font-mono text-sm tabular-nums text-white outline-none focus:border-accent-500/50"
                      aria-label={`${t('priceLabel')} — ${row.name}`}
                    />
                    <button
                      type="button"
                      onClick={() => removeRow(row.id)}
                      className="rounded-lg p-2 text-zinc-600 transition-colors hover:bg-white/5 hover:text-ember-300"
                      aria-label={t('remove')}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="mt-6">
            <p className="text-2xs font-bold uppercase tracking-wider text-zinc-500">
              {t('quickAdd')}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {quickAdds.map((tool) => (
                <button
                  key={tool.slug}
                  type="button"
                  onClick={() => quickAdd(tool)}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-2xs font-semibold text-zinc-300 transition-colors hover:border-accent-500/50 hover:text-accent-300"
                >
                  {tool.name} · ${parseMonthly(tool.startingPrice)}
                </button>
              ))}
            </div>
          </div>

          {rows.length === 0 && (
            <div className="mt-6 rounded-2xl border border-dashed border-white/10 p-8 text-center">
              <p className="text-sm font-bold text-zinc-300">{t('emptyTitle')}</p>
              <p className="mt-1 text-2xs text-zinc-500">{t('emptySub')}</p>
            </div>
          )}
        </section>

        {/* ── Results side ───────────────────────────────────────────── */}
        <section>
          {rows.length === 0 ? (
            <div className="glass-panel flex h-full min-h-[300px] items-center justify-center rounded-2xl p-8 text-center text-2xs text-zinc-500">
              {t('emptySub')}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="glass-panel rounded-2xl p-4">
                  <p className="text-2xs font-bold uppercase tracking-wider text-zinc-500">
                    {t('currentTotal')}
                  </p>
                  <p className="mt-1 font-mono text-2xl font-black tabular-nums text-zinc-200">
                    ${result.currentTotal.toFixed(2)}
                  </p>
                </div>
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                  <p className="text-2xs font-bold uppercase tracking-wider text-emerald-300/80">
                    {t('optimizedTotal')}
                  </p>
                  <p className="mt-1 font-mono text-2xl font-black tabular-nums text-emerald-300">
                    ${result.optimizedTotal.toFixed(2)}
                  </p>
                </div>
              </div>

              {result.monthlySavings > 0 && (
                <div className="flex items-center gap-3 rounded-2xl border border-accent-500/30 bg-accent-500/10 px-5 py-4">
                  <Zap className="h-5 w-5 shrink-0 text-accent-400" aria-hidden="true" />
                  <div>
                    <p className="font-mono text-lg font-black tabular-nums text-accent-300">
                      ${result.monthlySavings.toFixed(2)}
                      <span className="font-sans text-2xs font-semibold text-accent-300/70">
                        {' '}
                        {t('monthlySavings')}
                      </span>
                    </p>
                    <p className="text-2xs text-accent-300/70">
                      ${result.yearlySavings.toFixed(0)} {t('yearlySavings')}
                    </p>
                  </div>
                </div>
              )}

              {knownSlugs.length > 0 && (
                <div className="rounded-2xl border border-white/10 bg-surface-1 p-4">
                  <p className="text-2xs font-bold uppercase tracking-wider text-zinc-500">{t('projectsTitle')}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <select
                      value={attachTarget}
                      onChange={(e) => setAttachTarget(e.target.value)}
                      aria-label={t('selectProject')}
                      className="max-w-44 rounded-xl border border-white/15 bg-surface-0 px-3 py-2.5 text-2xs font-bold text-zinc-200 focus:border-accent-500/60 focus:outline-none"
                    >
                      <option value="">{t('selectProject')}</option>
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={attachSubsToProject}
                      disabled={!attachTarget}
                      className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-surface-0 px-4 py-2.5 text-2xs font-bold text-zinc-200 transition-colors hover:border-accent-500/50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {projKind === 'attach' ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
                      ) : (
                        <FolderKanban className="h-3.5 w-3.5" aria-hidden="true" />
                      )}
                      {t('attachToProject')}
                    </button>
                    <button
                      type="button"
                      onClick={saveSubsAsProject}
                      className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-surface-0 px-4 py-2.5 text-2xs font-bold text-zinc-200 transition-colors hover:border-accent-500/50"
                    >
                      {projKind === 'create' ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
                      ) : (
                        <FolderKanban className="h-3.5 w-3.5" aria-hidden="true" />
                      )}
                      {t('saveAsProject')}
                    </button>
                    {knownSlugs.length > 0 && (
                      <Link
                        href={`/my?tab=stacks&new=1&tools=${knownSlugs.map(encodeURIComponent).join(',')}&name=${encodeURIComponent(t('stackName'))}`}
                        className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-surface-0 px-4 py-2.5 text-2xs font-bold text-zinc-200 transition-colors hover:border-accent-500/50"
                      >
                        <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                        {t('saveAsStack')}
                      </Link>
                    )}
                  </div>
                  {projMsg && <p className="mt-2 text-2xs font-semibold text-emerald-300">{projMsg}</p>}
                </div>
              )}

              <div>
                <h3 className="text-base font-black">{t('findingsTitle')}</h3>
                {result.findings.length === 0 ? (
                  <div className="mt-3 rounded-2xl border border-white/10 bg-surface-1 p-5">
                    <p className="text-sm font-bold text-zinc-300">{t('noFindings')}</p>
                    <p className="mt-1 text-2xs text-zinc-500">{t('noFindingsSub')}</p>
                  </div>
                ) : (
                  <ul className="mt-3 space-y-3">
                    {result.findings.map((f) => (
                      <li key={`${f.kind}-${f.subId}`} className="glass-panel rounded-2xl p-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${kindBadge[f.kind]}`}
                          >
                            {kindLabel[f.kind]}
                          </span>
                          <p className="flex-1 text-sm font-bold text-zinc-200">{f.title}</p>
                          <span className="font-mono text-xs font-black tabular-nums text-emerald-400">
                            {t('findingSavings', { n: `$${f.savings.toFixed(0)}` })}
                          </span>
                        </div>
                        <p className="mt-2 text-2xs leading-relaxed text-zinc-400">{f.detail}</p>
                        {f.altSlug && (
                          <Link
                            href={`/tool/${f.altSlug}`}
                            className="mt-2 inline-flex items-center gap-1 text-2xs font-bold text-accent-300 hover:text-accent-200"
                          >
                            {t('viewTool')} <ExternalLink className="h-3 w-3" aria-hidden="true" />
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {result.unanalysed > 0 && (
                <p className="flex items-start gap-2 rounded-xl border border-white/10 bg-surface-1 px-4 py-3 text-2xs text-zinc-500">
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  {t('unanalysed', { n: String(result.unanalysed) })}
                </p>
              )}

              <p className="text-2xs leading-relaxed text-zinc-600">{t('disclaimer')}</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
