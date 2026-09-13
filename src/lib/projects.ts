import { ALL_TOOLS, type Tool } from '@/data/tools';
import {
  WORKFLOWS,
  workflowMinutes,
  workflowNodeCost,
  type WorkflowTemplate,
} from '@/data/workflows';

/**
 * Projects (roadmap §42 #19 / Phase 5 "Projects").
 *
 * A project is a local container a creator organizes around a goal:
 * prompts, attached workflow templates, tools, notes, and a history log.
 *
 * Zero ongoing operations by design (ops doc §22/§38): everything is
 * client-side localStorage; costs are computed live from the catalog, never
 * stored or invented; assets/outputs from generated media are intentionally
 * NOT claimed here (that belongs to the Studio, which is the cost center).
 */

export const PROJECT_TYPES = ['youtube', 'podcast', 'newsletter', 'campaign', 'product-launch', 'series'] as const;
export type ProjectType = (typeof PROJECT_TYPES)[number];

export interface ProjectPrompt {
  id: string;
  title: string;
  body: string;
  addedAt: string;
}

export interface ProjectHistoryEntry {
  at: string;
  /** i18n-ready event key (no interpolation). */
  event: string;
}

export interface NoxiferaProject {
  id: string;
  name: string;
  type: ProjectType;
  prompts: ProjectPrompt[];
  /** Canonical workflow template slugs (validated against WORKFLOWS). */
  workflowSlugs: string[];
  /** Catalog tool slugs (validated against ALL_TOOLS). */
  toolSlugs: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
  history: ProjectHistoryEntry[];
}

export const PROJECTS_KEY = 'noxifera_projects';
export const MAX_PROJECTS = 12;
export const MAX_PROMPTS_PER_PROJECT = 25;
export const MAX_TOOLS_PER_PROJECT = 12;
export const MAX_HISTORY = 30;

const VALID_TYPES = new Set<string>(PROJECT_TYPES);
const VALID_WORKFLOWS = new Set(WORKFLOWS.map((w) => w.slug));
const VALID_TOOLS = new Set(ALL_TOOLS.map((t) => t.slug));

export function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function log(history: ProjectHistoryEntry[], event: string, at: string): ProjectHistoryEntry[] {
  return [...history, { at, event }].slice(-MAX_HISTORY);
}

export function loadProjects(storage: Storage = globalThis.localStorage): NoxiferaProject[] {
  try {
    const raw = storage.getItem(PROJECTS_KEY);
    if (!raw) return [];
    const p = JSON.parse(raw);
    if (!Array.isArray(p)) return [];
    return p
      .filter((x): x is NoxiferaProject => Boolean(x) && typeof x.id === 'string' && VALID_TYPES.has(x.type))
      .slice(0, MAX_PROJECTS);
  } catch {
    return [];
  }
}

export function saveProjects(projects: NoxiferaProject[], storage: Storage = globalThis.localStorage): void {
  try {
    storage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  } catch {
    /* storage full/blocked — degrades to session-only */
  }
}

export function createProject(
  name: string,
  type: ProjectType,
  now: string,
  storage: Storage = globalThis.localStorage
): NoxiferaProject | null {
  const trimmed = name.trim();
  if (!trimmed || !VALID_TYPES.has(type)) return null;
  const projects = loadProjects(storage);
  if (projects.length >= MAX_PROJECTS) return null;
  const project: NoxiferaProject = {
    id: newId('p'),
    name: trimmed,
    type,
    prompts: [],
    workflowSlugs: [],
    toolSlugs: [],
    notes: '',
    createdAt: now,
    updatedAt: now,
    history: log([], 'project.created', now),
  };
  saveProjects([project, ...projects], storage);
  return project;
}

/** All mutations go through updateProject so history + updatedAt stay consistent. */
export function updateProject(
  id: string,
  mutate: (p: NoxiferaProject) => NoxiferaProject,
  event: string,
  now: string,
  storage: Storage = globalThis.localStorage
): NoxiferaProject | null {
  const projects = loadProjects(storage);
  const idx = projects.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  const next = { ...mutate(projects[idx]), updatedAt: now, history: log(projects[idx].history, event, now) };
  const all = [...projects];
  all[idx] = next;
  saveProjects(all, storage);
  return next;
}

export function deleteProject(id: string, storage: Storage = globalThis.localStorage): NoxiferaProject[] {
  const projects = loadProjects(storage);
  const next = projects.filter((p) => p.id !== id);
  saveProjects(next, storage);
  return next;
}

// ── prompt ops ──────────────────────────────────────────────────────────

export function addPrompt(
  id: string,
  title: string,
  body: string,
  now: string,
  storage: Storage = globalThis.localStorage
): NoxiferaProject | null {
  return updateProject(
    id,
    (p) =>
      p.prompts.length >= MAX_PROMPTS_PER_PROJECT
        ? p
        : { ...p, prompts: [{ id: newId('pr'), title: title.trim(), body: body.trim(), addedAt: now }, ...p.prompts] },
    'prompt.added',
    now,
    storage
  );
}

export function removePrompt(id: string, promptId: string, now: string, storage: Storage = globalThis.localStorage) {
  return updateProject(
    id,
    (p) => ({ ...p, prompts: p.prompts.filter((x) => x.id !== promptId) }),
    'prompt.removed',
    now,
    storage
  );
}

// ── attachment ops ──────────────────────────────────────────────────────

export function toggleTool(id: string, slug: string, now: string, storage: Storage = globalThis.localStorage) {
  if (!VALID_TOOLS.has(slug)) return loadProjects(storage).find((p) => p.id === id) ?? null;
  return updateProject(
    id,
    (p) =>
      p.toolSlugs.includes(slug)
        ? { ...p, toolSlugs: p.toolSlugs.filter((s) => s !== slug) }
        : p.toolSlugs.length >= MAX_TOOLS_PER_PROJECT
        ? p
        : { ...p, toolSlugs: [...p.toolSlugs, slug] },
    'tool.toggled',
    now,
    storage
  );
}

export function toggleWorkflow(id: string, slug: string, now: string, storage: Storage = globalThis.localStorage) {
  if (!VALID_WORKFLOWS.has(slug)) return loadProjects(storage).find((p) => p.id === id) ?? null;
  return updateProject(
    id,
    (p) =>
      p.workflowSlugs.includes(slug)
        ? { ...p, workflowSlugs: p.workflowSlugs.filter((s) => s !== slug) }
        : { ...p, workflowSlugs: [...p.workflowSlugs, slug] },
    'workflow.toggled',
    now,
    storage
  );
}

export function setNotes(id: string, notes: string, now: string, storage: Storage = globalThis.localStorage) {
  return updateProject(id, (p) => ({ ...p, notes }), 'notes.saved', now, storage);
}

/**
 * Attach catalog tools non-destructively (e.g. an advisor plan's picks):
 * valid slugs not already attached are appended up to the cap; tools already
 * on the project are kept, never removed. Returns how many were added.
 */
export function attachTools(
  id: string,
  slugs: string[],
  now: string,
  storage: Storage = globalThis.localStorage
): { project: NoxiferaProject | null; added: number } {
  const projects = loadProjects(storage);
  const project = projects.find((p) => p.id === id);
  if (!project) return { project: null, added: 0 };
  const fresh = [
    ...new Set(slugs.filter((s) => VALID_TOOLS.has(s) && !project.toolSlugs.includes(s))),
  ].slice(0, MAX_TOOLS_PER_PROJECT - project.toolSlugs.length);
  if (fresh.length === 0) return { project, added: 0 };
  const updated = updateProject(
    id,
    (p) => ({ ...p, toolSlugs: [...p.toolSlugs, ...fresh] }),
    'tools.attached',
    now,
    storage
  );
  return { project: updated, added: fresh.length };
}

// ── derived views ───────────────────────────────────────────────────────

export function projectTools(project: NoxiferaProject): Tool[] {
  return project.toolSlugs
    .map((s) => ALL_TOOLS.find((t) => t.slug === s))
    .filter((t): t is Tool => Boolean(t));
}

export function projectWorkflows(project: NoxiferaProject): WorkflowTemplate[] {
  return WORKFLOWS.filter((w) => project.workflowSlugs.includes(w.slug));
}

/** Estimated monthly cost, computed live from catalog prices for attached tools. */
export function projectMonthlyCost(project: NoxiferaProject): number {
  const total = projectTools(project).reduce((sum, t) => sum + workflowNodeCost(t.slug), 0);
  return Math.round(total * 100) / 100;
}

export function workflowMinutesFor(slug: string): number {
  const w = WORKFLOWS.find((x) => x.slug === slug);
  return w ? workflowMinutes(w) : 0;
}

export function workflowTitleFor(slug: string): string {
  const w = WORKFLOWS.find((x) => x.slug === slug);
  return w ? w.title : slug;
}

/** Total production minutes across attached workflows (for the project card). */
export function projectMinutes(project: NoxiferaProject): number {
  return project.workflowSlugs.reduce((sum, s) => sum + workflowMinutesFor(s), 0);
}

// ── workflow coverage (upgrade #26) ────────────────────────────────────

export interface WorkflowCoverageMissing {
  /** Display label of the workflow step. */
  label: string;
  /** Catalog slug the step uses. */
  toolSlug: string;
  /** Catalog display name (falls back to the slug). */
  toolName: string;
}

export interface WorkflowCoverage {
  slug: string;
  title: string;
  /** Tool-driven steps in the workflow (manual steps don't count). */
  total: number;
  /** Tool-driven steps whose tool is attached to the project. */
  covered: number;
  /** Steps whose tool is missing, in workflow order. */
  missing: WorkflowCoverageMissing[];
}

/**
 * For each attached workflow: how many of its tool steps are covered by the
 * project's attached tools. Purely derived from the catalog — nothing stored.
 */
export function projectWorkflowCoverage(project: NoxiferaProject): WorkflowCoverage[] {
  const attached = new Set(project.toolSlugs);
  return projectWorkflows(project).map((w) => {
    const nodes = w.nodes.filter((n) => Boolean(n.tool));
    const missing: WorkflowCoverageMissing[] = nodes
      .filter((n) => !attached.has(n.tool!))
      .map((n) => ({
        label: n.label,
        toolSlug: n.tool!,
        toolName: ALL_TOOLS.find((t) => t.slug === n.tool)?.name ?? n.tool!,
      }));
    return {
      slug: w.slug,
      title: w.title,
      total: nodes.length,
      covered: nodes.length - missing.length,
      missing,
    };
  });
}
