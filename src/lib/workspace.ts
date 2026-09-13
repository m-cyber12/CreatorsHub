import { ALL_TOOLS } from '@/data/tools';
import { GRAVEYARD } from '@/data/graveyard';

/**
 * "My NOXIFERA" workspace — the retention layer.
 *
 * A local-first personal workspace: saved tools, stacks, workflows,
 * comparisons, experiments, alerts, and preferences. Browser persistence is
 * the v1 store (no account required); every function below is a small,
 * syncable unit so a future Supabase sync can replace the storage backend
 * without touching the UI:
 *
 *   saveTool() / removeTool() / getSavedTools()
 *   saveStackEntry() / renameStackEntry() / duplicateStackEntry() / ...
 *   saveWorkflowEntry() / ...
 *   saveComparison() / ...   saveExperiment() / ...
 *   savePreferences() / getPreferences()
 *
 * Rules:
 *  - Never drop entries for slugs that left the catalog — surface them as
 *    "no longer listed" so the user decides (silent loss destroys trust).
 *  - Never invent prices: snapshots store the catalog values verbatim and
 *    change detection compares verbatim.
 *  - All functions accept an injectable Storage for tests.
 */

const KNOWN_SLUGS = new Set(ALL_TOOLS.map((t) => t.slug));

function safeStorage(): Storage | null {
  try {
    return globalThis.localStorage;
  } catch {
    return null;
  }
}

function readJson<T>(storage: Storage | null, key: string): T | null {
  if (!storage) return null;
  try {
    const raw = storage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeJson(storage: Storage | null, key: string, value: unknown): void {
  if (!storage) return;
  try {
    storage.setItem(key, JSON.stringify(value));
    notifyWorkspaceChanged();
  } catch {
    /* storage full/blocked — degrades gracefully */
  }
}

export function newWorkspaceId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Same-tab sync: every persist below notifies listeners (the AppProviders
 * workspace state, /my tabs) so all components stay consistent without a
 * global store. No-op outside the browser (SSR, tests).
 */
export const WORKSPACE_CHANGED_EVENT = 'noxifera:workspace-changed';

export function notifyWorkspaceChanged(): void {
  try {
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(new Event(WORKSPACE_CHANGED_EVENT));
    }
  } catch {
    /* never break a persist */
  }
}

/* ── Saved tools ───────────────────────────────────────────────────────── */

export const SAVED_TOOLS_KEY = 'noxifera_saved_tools';
const LEGACY_BOOKMARKS_KEYS = ['noxifera_bookmarks', 'cah_bookmarks'];
export const MAX_SAVED_TOOLS = 200;
export const MAX_HISTORY_ENTRIES = 30;

export type ToolStatus = 'interested' | 'using' | 'testing' | 'replaced' | 'cancelled';

export const TOOL_STATUSES: ToolStatus[] = ['interested', 'using', 'testing', 'replaced', 'cancelled'];

export interface ToolStatusEntry {
  status: ToolStatus;
  at: string;
  note?: string;
}

export interface SavedTool {
  slug: string;
  savedAt: string;
  updatedAt: string;
  note: string;
  status: ToolStatus;
  history: ToolStatusEntry[];
  /** Verbatim catalog snapshot at save time — for honest change detection. */
  priceAtSave?: string;
  pricingAtSave?: string;
  verificationAtSave?: string;
}

function isStatus(s: unknown): s is ToolStatus {
  return typeof s === 'string' && (TOOL_STATUSES as string[]).includes(s);
}

function normalizeSavedTool(x: unknown): SavedTool | null {
  if (!x || typeof x !== 'object') return null;
  const r = x as Partial<SavedTool>;
  if (typeof r.slug !== 'string' || !r.slug) return null;
  const now = new Date().toISOString();
  const status = isStatus(r.status) ? r.status : 'interested';
  const history = Array.isArray(r.history)
    ? r.history
        .filter((h): h is ToolStatusEntry => Boolean(h) && isStatus((h as ToolStatusEntry).status) && typeof (h as ToolStatusEntry).at === 'string')
        .slice(-MAX_HISTORY_ENTRIES)
    : [];
  return {
    slug: r.slug,
    savedAt: typeof r.savedAt === 'string' ? r.savedAt : now,
    updatedAt: typeof r.updatedAt === 'string' ? r.updatedAt : now,
    note: typeof r.note === 'string' ? r.note.slice(0, 500) : '',
    status,
    history,
    priceAtSave: typeof r.priceAtSave === 'string' ? r.priceAtSave : undefined,
    pricingAtSave: typeof r.pricingAtSave === 'string' ? r.pricingAtSave : undefined,
    verificationAtSave: typeof r.verificationAtSave === 'string' ? r.verificationAtSave : undefined,
  };
}

/** One-way, idempotent merge of pre-workspace bookmark slug arrays. */
function migrateLegacyBookmarks(storage: Storage | null, current: SavedTool[]): SavedTool[] {
  if (!storage) return current;
  const have = new Set(current.map((t) => t.slug));
  let merged = current;
  for (const key of LEGACY_BOOKMARKS_KEYS) {
    const raw = readJson<unknown>(storage, key);
    if (!Array.isArray(raw)) continue;
    const now = new Date().toISOString();
    const fresh = raw
      .filter((s): s is string => typeof s === 'string' && s.length > 0 && !have.has(s))
      .map((slug): SavedTool => {
        have.add(slug);
        const tool = ALL_TOOLS.find((t) => t.slug === slug);
        return {
          slug,
          savedAt: now,
          updatedAt: now,
          note: '',
          status: 'interested',
          history: [{ status: 'interested', at: now }],
          priceAtSave: tool?.startingPrice,
          pricingAtSave: tool?.pricing,
          verificationAtSave: tool?.verificationLevel,
        };
      });
    if (fresh.length > 0) merged = [...merged, ...fresh];
  }
  return merged.slice(0, MAX_SAVED_TOOLS);
}

export function getSavedTools(storage: Storage | null = safeStorage()): SavedTool[] {
  const raw = readJson<unknown>(storage, SAVED_TOOLS_KEY);
  const list = Array.isArray(raw)
    ? raw.map(normalizeSavedTool).filter((x): x is SavedTool => x !== null)
    : [];
  const merged = migrateLegacyBookmarks(storage, list);
  if (merged.length !== list.length) writeJson(storage, SAVED_TOOLS_KEY, merged);
  return merged;
}

export function getSavedTool(slug: string, storage: Storage | null = safeStorage()): SavedTool | null {
  return getSavedTools(storage).find((t) => t.slug === slug) ?? null;
}

export function isToolSaved(slug: string, storage: Storage | null = safeStorage()): boolean {
  return getSavedTools(storage).some((t) => t.slug === slug);
}

function persistSavedTools(list: SavedTool[], storage: Storage | null): SavedTool[] {
  const capped = list.slice(0, MAX_SAVED_TOOLS);
  writeJson(storage, SAVED_TOOLS_KEY, capped);
  return capped;
}

/** Save a tool (idempotent). Snapshots current catalog pricing verbatim. */
export function saveTool(slug: string, storage: Storage | null = safeStorage()): SavedTool[] {
  const list = getSavedTools(storage);
  if (list.some((t) => t.slug === slug)) return list;
  const now = new Date().toISOString();
  const tool = ALL_TOOLS.find((t) => t.slug === slug);
  return persistSavedTools(
    [
      {
        slug,
        savedAt: now,
        updatedAt: now,
        note: '',
        status: 'interested',
        history: [{ status: 'interested', at: now }],
        priceAtSave: tool?.startingPrice,
        pricingAtSave: tool?.pricing,
        verificationAtSave: tool?.verificationLevel,
      },
      ...list,
    ],
    storage
  );
}

export function removeTool(slug: string, storage: Storage | null = safeStorage()): SavedTool[] {
  return persistSavedTools(
    getSavedTools(storage).filter((t) => t.slug !== slug),
    storage
  );
}

/** Toggle — returns the new list plus whether the tool is now saved. */
export function toggleSavedTool(
  slug: string,
  storage: Storage | null = safeStorage()
): { list: SavedTool[]; saved: boolean } {
  if (isToolSaved(slug, storage)) return { list: removeTool(slug, storage), saved: false };
  return { list: saveTool(slug, storage), saved: true };
}

export function setToolNote(slug: string, note: string, storage: Storage | null = safeStorage()): SavedTool[] {
  const now = new Date().toISOString();
  return persistSavedTools(
    getSavedTools(storage).map((t) =>
      t.slug === slug ? { ...t, note: note.slice(0, 500), updatedAt: now } : t
    ),
    storage
  );
}

export function setToolStatus(
  slug: string,
  status: ToolStatus,
  note?: string,
  storage: Storage | null = safeStorage()
): SavedTool[] {
  if (!isStatus(status)) return getSavedTools(storage);
  const now = new Date().toISOString();
  const cleanNote = typeof note === 'string' ? note.trim().slice(0, 300) : '';
  return persistSavedTools(
    getSavedTools(storage).map((t) => {
      if (t.slug !== slug || t.status === status) return t;
      const entry: ToolStatusEntry = { status, at: now, ...(cleanNote ? { note: cleanNote } : {}) };
      return { ...t, status, updatedAt: now, history: [...t.history, entry].slice(-MAX_HISTORY_ENTRIES) };
    }),
    storage
  );
}

/* ── Saved stacks (shared with Stack Builder) ───────────────────────────── */

export const SAVED_STACKS_KEY = 'noxifera_saved_stacks';
export const MAX_SAVED_STACKS = 12;

/**
 * Goal/budget keys shared with the Stack Builder (its GOALS/BUDGETS tables
 * are the visual source; these mirrors must stay in sync so /my stacks
 * open in the builder without loss).
 */
export const STACK_GOAL_KEYS = [
  'faceless',
  'shorts',
  'podcast',
  'thumbnails',
  'dubbing',
  'avatars',
  'longform',
  'ugc',
] as const;
export type StackGoalKey = (typeof STACK_GOAL_KEYS)[number];
export const STACK_BUDGET_KEYS = ['free', 'budget', 'pro'] as const;
export type StackBudgetKey = (typeof STACK_BUDGET_KEYS)[number];

/**
 * Workflow playbook matching a stack goal (single source; the Stack Builder
 * and My NOXIFERA both link through it). Goals without a playbook yet are
 * absent — callers must handle undefined.
 */
export const STACK_GOAL_TO_WORKFLOW: Partial<Record<StackGoalKey, string>> = {
  faceless: 'faceless-video',
  podcast: 'podcast-to-shorts',
  dubbing: 'dubbed-content',
  longform: 'youtube-long-form',
  ugc: 'ugc-ads',
};

export interface SavedStackEntry {
  id: string;
  name: string;
  goal: string;
  budget: string;
  picks: Record<number, string>;
  savedAt: string;
  updatedAt?: string;
  notes?: string;
}

function normalizeStack(x: unknown): SavedStackEntry | null {
  if (!x || typeof x !== 'object') return null;
  const r = x as Partial<SavedStackEntry>;
  if (typeof r.id !== 'string' || typeof r.name !== 'string') return null;
  if (typeof r.goal !== 'string' || typeof r.budget !== 'string') return null;
  const picks: Record<number, string> = {};
  if (r.picks && typeof r.picks === 'object') {
    for (const [k, v] of Object.entries(r.picks)) {
      if (typeof v === 'string' && v) picks[Number(k)] = v;
    }
  }
  return {
    id: r.id,
    name: r.name.slice(0, 80),
    goal: r.goal,
    budget: r.budget,
    picks,
    savedAt: typeof r.savedAt === 'string' ? r.savedAt : new Date().toISOString(),
    updatedAt: typeof r.updatedAt === 'string' ? r.updatedAt : undefined,
    notes: typeof r.notes === 'string' ? r.notes.slice(0, 500) : undefined,
  };
}

export function getSavedStacks(storage: Storage | null = safeStorage()): SavedStackEntry[] {
  const raw = readJson<unknown>(storage, SAVED_STACKS_KEY);
  if (!Array.isArray(raw)) return [];
  return raw.map(normalizeStack).filter((x): x is SavedStackEntry => x !== null);
}

function persistStacks(list: SavedStackEntry[], storage: Storage | null): SavedStackEntry[] {
  const capped = list.slice(0, MAX_SAVED_STACKS);
  writeJson(storage, SAVED_STACKS_KEY, capped);
  return capped;
}

export function saveStackEntry(
  entry: Omit<SavedStackEntry, 'id' | 'savedAt'>,
  storage: Storage | null = safeStorage()
): SavedStackEntry[] {
  const now = new Date().toISOString();
  return persistStacks(
    [{ ...entry, id: newWorkspaceId('stack'), savedAt: now, updatedAt: now }, ...getSavedStacks(storage)],
    storage
  );
}

export function renameStackEntry(id: string, name: string, storage: Storage | null = safeStorage()): SavedStackEntry[] {
  const trimmed = name.trim().slice(0, 80);
  if (!trimmed) return getSavedStacks(storage);
  return persistStacks(
    getSavedStacks(storage).map((s) =>
      s.id === id ? { ...s, name: trimmed, updatedAt: new Date().toISOString() } : s
    ),
    storage
  );
}

export function duplicateStackEntry(id: string, storage: Storage | null = safeStorage()): SavedStackEntry[] {
  const found = getSavedStacks(storage).find((s) => s.id === id);
  if (!found) return getSavedStacks(storage);
  const now = new Date().toISOString();
  return persistStacks(
    [{ ...found, id: newWorkspaceId('stack'), name: `${found.name} (copy)`.slice(0, 80), savedAt: now, updatedAt: now }, ...getSavedStacks(storage)],
    storage
  );
}

export function removeStackEntry(id: string, storage: Storage | null = safeStorage()): SavedStackEntry[] {
  return persistStacks(
    getSavedStacks(storage).filter((s) => s.id !== id),
    storage
  );
}

export function setStackNotes(id: string, notes: string, storage: Storage | null = safeStorage()): SavedStackEntry[] {
  return persistStacks(
    getSavedStacks(storage).map((s) =>
      s.id === id ? { ...s, notes: notes.slice(0, 500), updatedAt: new Date().toISOString() } : s
    ),
    storage
  );
}

export interface StackPatch {
  name?: string;
  goal?: string;
  budget?: string;
  picks?: Record<number, string>;
  notes?: string;
}

/** Generic stack updater for the /my editor (validates + stamps updatedAt). */
export function updateStackEntry(id: string, patch: StackPatch, storage: Storage | null = safeStorage()): SavedStackEntry[] {
  if (patch.name !== undefined && !patch.name.trim()) return getSavedStacks(storage);
  const picks =
    patch.picks === undefined
      ? undefined
      : Object.fromEntries(
          Object.entries(patch.picks).filter(([, v]) => typeof v === 'string' && v)
        );
  return persistStacks(
    getSavedStacks(storage).map((s) =>
      s.id === id
        ? {
            ...s,
            ...(patch.name !== undefined ? { name: patch.name.trim().slice(0, 80) } : {}),
            ...(patch.goal !== undefined ? { goal: patch.goal.slice(0, 40) } : {}),
            ...(patch.budget !== undefined ? { budget: patch.budget.slice(0, 40) } : {}),
            ...(picks !== undefined ? { picks } : {}),
            ...(patch.notes !== undefined ? { notes: patch.notes.slice(0, 500) } : {}),
            updatedAt: new Date().toISOString(),
          }
        : s
    ),
    storage
  );
}

/* ── Saved workflows (shared with Workflow pages) ───────────────────────── */

export const SAVED_WORKFLOWS_KEY = 'noxifera_workflows';
export const MAX_SAVED_WORKFLOWS = 12;

export interface WorkflowStep {
  id: string;
  title: string;
  toolSlug?: string;
  note?: string;
}

export interface SavedWorkflowEntry {
  id: string;
  name: string;
  /** Playbook slug this was saved from, or 'custom' for workflows built in /my. */
  slug: string;
  picks: Record<string, string>;
  /** Custom steps — only present when slug === 'custom'. */
  steps?: WorkflowStep[];
  savedAt: string;
  updatedAt?: string;
  notes?: string;
}

function normalizeStep(x: unknown): WorkflowStep | null {
  if (!x || typeof x !== 'object') return null;
  const r = x as Partial<WorkflowStep>;
  if (typeof r.id !== 'string' || !r.id || typeof r.title !== 'string' || !r.title.trim()) return null;
  return {
    id: r.id.slice(0, 40),
    title: r.title.trim().slice(0, 120),
    toolSlug: typeof r.toolSlug === 'string' && r.toolSlug ? r.toolSlug.slice(0, 80) : undefined,
    note: typeof r.note === 'string' && r.note ? r.note.slice(0, 500) : undefined,
  };
}

function normalizeWorkflow(x: unknown): SavedWorkflowEntry | null {
  if (!x || typeof x !== 'object') return null;
  const r = x as Partial<SavedWorkflowEntry>;
  if (typeof r.id !== 'string' || typeof r.name !== 'string' || typeof r.slug !== 'string') return null;
  const picks: Record<string, string> = {};
  if (r.picks && typeof r.picks === 'object') {
    for (const [k, v] of Object.entries(r.picks)) {
      if (typeof v === 'string' && v) picks[k] = v;
    }
  }
  const steps = Array.isArray(r.steps)
    ? r.steps.map(normalizeStep).filter((s): s is WorkflowStep => s !== null).slice(0, 24)
    : undefined;
  return {
    id: r.id,
    name: r.name.slice(0, 80),
    slug: r.slug,
    picks,
    ...(steps && steps.length > 0 ? { steps } : {}),
    savedAt: typeof r.savedAt === 'string' ? r.savedAt : new Date().toISOString(),
    updatedAt: typeof r.updatedAt === 'string' ? r.updatedAt : undefined,
    notes: typeof r.notes === 'string' ? r.notes.slice(0, 500) : undefined,
  };
}

export function getSavedWorkflows(storage: Storage | null = safeStorage()): SavedWorkflowEntry[] {
  const raw = readJson<unknown>(storage, SAVED_WORKFLOWS_KEY);
  if (!Array.isArray(raw)) return [];
  return raw.map(normalizeWorkflow).filter((x): x is SavedWorkflowEntry => x !== null);
}

function persistWorkflows(list: SavedWorkflowEntry[], storage: Storage | null): SavedWorkflowEntry[] {
  const capped = list.slice(0, MAX_SAVED_WORKFLOWS);
  writeJson(storage, SAVED_WORKFLOWS_KEY, capped);
  return capped;
}

export function saveWorkflowEntry(
  entry: Omit<SavedWorkflowEntry, 'id' | 'savedAt'>,
  storage: Storage | null = safeStorage()
): SavedWorkflowEntry[] {
  const now = new Date().toISOString();
  return persistWorkflows(
    [{ ...entry, id: newWorkspaceId('wf'), savedAt: now, updatedAt: now }, ...getSavedWorkflows(storage)],
    storage
  );
}

export function renameWorkflowEntry(id: string, name: string, storage: Storage | null = safeStorage()): SavedWorkflowEntry[] {
  const trimmed = name.trim().slice(0, 80);
  if (!trimmed) return getSavedWorkflows(storage);
  return persistWorkflows(
    getSavedWorkflows(storage).map((w) =>
      w.id === id ? { ...w, name: trimmed, updatedAt: new Date().toISOString() } : w
    ),
    storage
  );
}

export function duplicateWorkflowEntry(id: string, storage: Storage | null = safeStorage()): SavedWorkflowEntry[] {
  const found = getSavedWorkflows(storage).find((w) => w.id === id);
  if (!found) return getSavedWorkflows(storage);
  const now = new Date().toISOString();
  return persistWorkflows(
    [{ ...found, id: newWorkspaceId('wf'), name: `${found.name} (copy)`.slice(0, 80), savedAt: now, updatedAt: now }, ...getSavedWorkflows(storage)],
    storage
  );
}

export function removeWorkflowEntry(id: string, storage: Storage | null = safeStorage()): SavedWorkflowEntry[] {
  return persistWorkflows(
    getSavedWorkflows(storage).filter((w) => w.id !== id),
    storage
  );
}

export function setWorkflowNotes(id: string, notes: string, storage: Storage | null = safeStorage()): SavedWorkflowEntry[] {
  return persistWorkflows(
    getSavedWorkflows(storage).map((w) =>
      w.id === id ? { ...w, notes: notes.slice(0, 500), updatedAt: new Date().toISOString() } : w
    ),
    storage
  );
}

export interface WorkflowPatch {
  name?: string;
  picks?: Record<string, string>;
  steps?: WorkflowStep[];
  notes?: string;
}

/** Generic workflow updater for the /my editor (validates + stamps updatedAt). */
export function updateWorkflowEntry(
  id: string,
  patch: WorkflowPatch,
  storage: Storage | null = safeStorage()
): SavedWorkflowEntry[] {
  if (patch.name !== undefined && !patch.name.trim()) return getSavedWorkflows(storage);
  const picks =
    patch.picks === undefined
      ? undefined
      : Object.fromEntries(Object.entries(patch.picks).filter(([, v]) => typeof v === 'string' && v));
  const steps =
    patch.steps === undefined
      ? undefined
      : patch.steps.map(normalizeStep).filter((s): s is WorkflowStep => s !== null).slice(0, 24);
  return persistWorkflows(
    getSavedWorkflows(storage).map((w) =>
      w.id === id
        ? {
            ...w,
            ...(patch.name !== undefined ? { name: patch.name.trim().slice(0, 80) } : {}),
            ...(picks !== undefined ? { picks } : {}),
            ...(steps !== undefined ? { steps } : {}),
            ...(patch.notes !== undefined ? { notes: patch.notes.slice(0, 500) } : {}),
            updatedAt: new Date().toISOString(),
          }
        : w
    ),
    storage
  );
}

/* ── Saved comparisons ──────────────────────────────────────────────────── */

export const SAVED_COMPARISONS_KEY = 'noxifera_saved_comparisons';
export const MAX_SAVED_COMPARISONS = 12;

export interface SavedComparison {
  id: string;
  name: string;
  slugs: string[];
  savedAt: string;
}

export function getSavedComparisons(storage: Storage | null = safeStorage()): SavedComparison[] {
  const raw = readJson<unknown>(storage, SAVED_COMPARISONS_KEY);
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((x): x is SavedComparison => {
      const r = x as Partial<SavedComparison>;
      return (
        Boolean(r) &&
        typeof r.id === 'string' &&
        typeof r.name === 'string' &&
        Array.isArray(r.slugs) &&
        r.slugs.length >= 2 &&
        typeof r.savedAt === 'string'
      );
    })
    .slice(0, MAX_SAVED_COMPARISONS);
}

export function saveComparison(name: string, slugs: string[], storage: Storage | null = safeStorage()): SavedComparison[] {
  const clean = [...new Set(slugs.filter((s) => typeof s === 'string' && s))].slice(0, 3);
  if (clean.length < 2) return getSavedComparisons(storage);
  const list = getSavedComparisons(storage);
  return persistComparisons(
    [{ id: newWorkspaceId('cmp'), name: name.trim().slice(0, 80) || clean.join(' vs '), slugs: clean, savedAt: new Date().toISOString() }, ...list],
    storage
  );
}

function persistComparisons(list: SavedComparison[], storage: Storage | null): SavedComparison[] {
  const capped = list.slice(0, MAX_SAVED_COMPARISONS);
  writeJson(storage, SAVED_COMPARISONS_KEY, capped);
  return capped;
}

export function renameComparison(id: string, name: string, storage: Storage | null = safeStorage()): SavedComparison[] {
  const trimmed = name.trim().slice(0, 80);
  if (!trimmed) return getSavedComparisons(storage);
  const raw = readJson<unknown>(storage, SAVED_COMPARISONS_KEY);
  if (!Array.isArray(raw)) return [];
  const next = raw
    .map((x) => {
      const r = x as Partial<SavedComparison>;
      if (!r || typeof r.id !== 'string') return x;
      return r.id === id ? { ...r, name: trimmed } : x;
    });
  writeJson(storage, SAVED_COMPARISONS_KEY, next.slice(0, MAX_SAVED_COMPARISONS));
  return getSavedComparisons(storage);
}

export function removeComparison(id: string, storage: Storage | null = safeStorage()): SavedComparison[] {
  return persistComparisons(
    getSavedComparisons(storage).filter((c) => c.id !== id),
    storage
  );
}

/* ── Experiments ────────────────────────────────────────────────────────── */

export const EXPERIMENTS_KEY = 'noxifera_experiments';
export const MAX_EXPERIMENTS = 50;

export type ExperimentStatus = 'idea' | 'running' | 'done';
export const EXPERIMENT_STATUSES: ExperimentStatus[] = ['idea', 'running', 'done'];

export interface Experiment {
  id: string;
  title: string;
  toolSlug?: string;
  outcomeSlug?: string;
  hypothesis: string;
  result: string;
  status: ExperimentStatus;
  createdAt: string;
  updatedAt: string;
}

function normalizeExperiment(x: unknown): Experiment | null {
  if (!x || typeof x !== 'object') return null;
  const r = x as Partial<Experiment>;
  if (typeof r.id !== 'string' || typeof r.title !== 'string' || !r.title.trim()) return null;
  const status: ExperimentStatus = EXPERIMENT_STATUSES.includes(r.status as ExperimentStatus)
    ? (r.status as ExperimentStatus)
    : 'idea';
  const now = new Date().toISOString();
  return {
    id: r.id,
    title: r.title.slice(0, 120),
    toolSlug: typeof r.toolSlug === 'string' && r.toolSlug ? r.toolSlug : undefined,
    outcomeSlug: typeof r.outcomeSlug === 'string' && r.outcomeSlug ? r.outcomeSlug : undefined,
    hypothesis: typeof r.hypothesis === 'string' ? r.hypothesis.slice(0, 1000) : '',
    result: typeof r.result === 'string' ? r.result.slice(0, 2000) : '',
    status,
    createdAt: typeof r.createdAt === 'string' ? r.createdAt : now,
    updatedAt: typeof r.updatedAt === 'string' ? r.updatedAt : now,
  };
}

export function getExperiments(storage: Storage | null = safeStorage()): Experiment[] {
  const raw = readJson<unknown>(storage, EXPERIMENTS_KEY);
  if (!Array.isArray(raw)) return [];
  return raw.map(normalizeExperiment).filter((x): x is Experiment => x !== null);
}

function persistExperiments(list: Experiment[], storage: Storage | null): Experiment[] {
  const capped = list.slice(0, MAX_EXPERIMENTS);
  writeJson(storage, EXPERIMENTS_KEY, capped);
  return capped;
}

export function saveExperiment(
  input: { title: string; toolSlug?: string; outcomeSlug?: string; hypothesis?: string; result?: string; status?: ExperimentStatus },
  storage: Storage | null = safeStorage()
): Experiment[] {
  const title = input.title.trim().slice(0, 120);
  if (!title) return getExperiments(storage);
  const now = new Date().toISOString();
  const entry: Experiment = {
    id: newWorkspaceId('exp'),
    title,
    toolSlug: input.toolSlug || undefined,
    outcomeSlug: input.outcomeSlug || undefined,
    hypothesis: (input.hypothesis ?? '').slice(0, 1000),
    result: (input.result ?? '').slice(0, 2000),
    status: input.status && EXPERIMENT_STATUSES.includes(input.status) ? input.status : 'idea',
    createdAt: now,
    updatedAt: now,
  };
  return persistExperiments([entry, ...getExperiments(storage)], storage);
}

export function updateExperiment(
  id: string,
  patch: Partial<Pick<Experiment, 'title' | 'hypothesis' | 'result' | 'status' | 'toolSlug' | 'outcomeSlug'>>,
  storage: Storage | null = safeStorage()
): Experiment[] {
  return persistExperiments(
    getExperiments(storage).map((e) => {
      if (e.id !== id) return e;
      const next: Experiment = { ...e, updatedAt: new Date().toISOString() };
      if (typeof patch.title === 'string' && patch.title.trim()) next.title = patch.title.trim().slice(0, 120);
      if (typeof patch.hypothesis === 'string') next.hypothesis = patch.hypothesis.slice(0, 1000);
      if (typeof patch.result === 'string') next.result = patch.result.slice(0, 2000);
      if (patch.status && EXPERIMENT_STATUSES.includes(patch.status)) next.status = patch.status;
      if (patch.toolSlug !== undefined) next.toolSlug = patch.toolSlug || undefined;
      if (patch.outcomeSlug !== undefined) next.outcomeSlug = patch.outcomeSlug || undefined;
      return next;
    }),
    storage
  );
}

export function removeExperiment(id: string, storage: Storage | null = safeStorage()): Experiment[] {
  return persistExperiments(
    getExperiments(storage).filter((e) => e.id !== id),
    storage
  );
}

/* ── Preferences (feed the Advisor) ─────────────────────────────────────── */

export const PREFERENCES_KEY = 'noxifera_preferences';

export interface CreatorPreferences {
  creatorType?: string;
  platform?: string;
  contentFormat?: string;
  frequency?: string;
  budget?: string;
  skillLevel?: string;
  currentTools: string[];
  workflowStyle?: string;
  updatedAt?: string;
}

const PREF_STRING_KEYS = ['creatorType', 'platform', 'contentFormat', 'frequency', 'budget', 'skillLevel', 'workflowStyle'] as const;

export function getPreferences(storage: Storage | null = safeStorage()): CreatorPreferences {
  const raw = readJson<Partial<CreatorPreferences>>(storage, PREFERENCES_KEY);
  const prefs: CreatorPreferences = { currentTools: [] };
  if (raw && typeof raw === 'object') {
    for (const k of PREF_STRING_KEYS) {
      const v = raw[k];
      if (typeof v === 'string' && v.trim()) prefs[k] = v.trim().slice(0, 60);
    }
    if (Array.isArray(raw.currentTools)) {
      prefs.currentTools = raw.currentTools.filter((s): s is string => typeof s === 'string' && KNOWN_SLUGS.has(s)).slice(0, 30);
    }
    if (typeof raw.updatedAt === 'string') prefs.updatedAt = raw.updatedAt;
  }
  return prefs;
}

export function savePreferences(patch: Partial<CreatorPreferences>, storage: Storage | null = safeStorage()): CreatorPreferences {
  const cur = getPreferences(storage);
  const next: CreatorPreferences = { ...cur, ...patch, updatedAt: new Date().toISOString() };
  if (patch.currentTools) {
    next.currentTools = patch.currentTools.filter((s) => KNOWN_SLUGS.has(s)).slice(0, 30);
  }
  writeJson(storage, PREFERENCES_KEY, next);
  return next;
}

/* ── Change detection (the return loop, computed locally) ───────────────── */

export type AlertKind = 'price-changed' | 'pricing-model-changed' | 'verification-upgraded' | 'tool-retired' | 'tool-unlisted';

export interface WorkspaceAlert {
  kind: AlertKind;
  slug: string;
  toolName: string;
  detail: string;
  at: string;
}

/**
 * Compare saved-tool snapshots against the live catalog. Pure + honest:
 * only verbatim differences are reported, and only upgrades (never
 * downgrades, which would just be catalog corrections).
 */
export function computeAlerts(saved: SavedTool[]): WorkspaceAlert[] {
  const alerts: WorkspaceAlert[] = [];
  const now = new Date().toISOString();
  const rank = (v?: string) => (v === 'hands-on-tested' ? 2 : v === 'pricing-verified' ? 1 : 0);
  for (const s of saved) {
    const tool = ALL_TOOLS.find((t) => t.slug === s.slug);
    if (!tool) {
      const dead = GRAVEYARD.find((g) => g.slug === s.slug);
      alerts.push({
        kind: dead ? 'tool-retired' : 'tool-unlisted',
        slug: s.slug,
        toolName: dead?.name ?? s.slug,
        detail: dead ? 'retired' : 'unlisted',
        at: now,
      });
      continue;
    }
    if (s.priceAtSave !== undefined && tool.startingPrice !== s.priceAtSave) {
      alerts.push({
        kind: 'price-changed',
        slug: s.slug,
        toolName: tool.name,
        detail: `${s.priceAtSave || '—'} → ${tool.startingPrice || '—'}`,
        at: now,
      });
    }
    if (s.pricingAtSave !== undefined && tool.pricing !== s.pricingAtSave) {
      alerts.push({
        kind: 'pricing-model-changed',
        slug: s.slug,
        toolName: tool.name,
        detail: `${s.pricingAtSave} → ${tool.pricing}`,
        at: now,
      });
    }
    if (s.verificationAtSave !== undefined && rank(tool.verificationLevel) > rank(s.verificationAtSave)) {
      alerts.push({
        kind: 'verification-upgraded',
        slug: s.slug,
        toolName: tool.name,
        detail: `${s.verificationAtSave} → ${tool.verificationLevel}`,
        at: now,
      });
    }
  }
  return alerts;
}

/** Refresh a saved tool's snapshot to today's catalog values (after review). */
export function acknowledgeToolChanges(slug: string, storage: Storage | null = safeStorage()): SavedTool[] {
  const tool = ALL_TOOLS.find((t) => t.slug === slug);
  if (!tool) return getSavedTools(storage);
  return persistSavedTools(
    getSavedTools(storage).map((t) =>
      t.slug === slug
        ? { ...t, priceAtSave: tool.startingPrice, pricingAtSave: tool.pricing, verificationAtSave: tool.verificationLevel, updatedAt: new Date().toISOString() }
        : t
    ),
    storage
  );
}

/* ── Stack optimization (lightweight, deterministic) ─────────────────────── */

export interface OverlapGroup {
  /** Shared capability signal (category or tag). */
  signal: string;
  kind: 'category' | 'tag';
  slugs: string[];
}

/**
 * Find saved tools that overlap on category or capability tags. Purely
 * descriptive — it reports shared signals and lets the user decide. No
 * savings are claimed unless both prices parse to numbers.
 */
export function findStackOverlaps(slugs: string[]): OverlapGroup[] {
  const tools = slugs
    .map((s) => ALL_TOOLS.find((t) => t.slug === s))
    .filter((t): t is NonNullable<typeof t> => Boolean(t));
  const groups: OverlapGroup[] = [];
  const byCategory = new Map<string, string[]>();
  for (const t of tools) {
    const arr = byCategory.get(t.category) ?? [];
    arr.push(t.slug);
    byCategory.set(t.category, arr);
  }
  for (const [category, members] of byCategory) {
    if (members.length >= 2) groups.push({ signal: category, kind: 'category', slugs: members });
  }
  const byTag = new Map<string, string[]>();
  for (const t of tools) {
    for (const tag of t.tags) {
      const arr = byTag.get(tag) ?? [];
      if (!arr.includes(t.slug)) arr.push(t.slug);
      byTag.set(tag, arr);
    }
  }
  for (const [tag, members] of byTag) {
    if (members.length >= 3) groups.push({ signal: tag, kind: 'tag', slugs: members });
  }
  return groups;
}

/** First $-number in a price display, or null when it does not parse. */
export function parsePriceNumber(display?: string): number | null {
  if (!display) return null;
  const m = display.replace(/,/g, '').match(/\$?\s*(\d+(?:\.\d+)?)/);
  if (!m) return null;
  const n = parseFloat(m[1]);
  return Number.isFinite(n) ? n : null;
}

/* ── Share / import (portable links, no account needed) ─────────────────── */

export const SHARE_VERSION = 1;
const MAX_SHARE_CHARS = 8000;

export type ShareKind = 'stack' | 'workflow';

export interface SharePayload {
  v: number;
  kind: ShareKind;
  data: Record<string, unknown>;
}

function base64UrlEncode(s: string): string {
  const b64 = typeof btoa === 'function'
    ? btoa(unescape(encodeURIComponent(s)))
    : Buffer.from(s, 'utf8').toString('base64');
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64UrlDecode(s: string): string | null {
  try {
    const b64 = s.replace(/-/g, '+').replace(/_/g, '/');
    const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);
    if (typeof atob === 'function') return decodeURIComponent(escape(atob(padded)));
    return Buffer.from(padded, 'base64').toString('utf8');
  } catch {
    return null;
  }
}

/** Encode a stack/workflow entry as a URL-hash-safe string. Returns '' when too large. */
export function encodeSharePayload(kind: ShareKind, entry: SavedStackEntry | SavedWorkflowEntry): string {
  const { id: _id, savedAt: _savedAt, updatedAt: _updatedAt, ...rest } = entry;
  const payload: SharePayload = { v: SHARE_VERSION, kind, data: rest as Record<string, unknown> };
  const out = base64UrlEncode(JSON.stringify(payload));
  return out.length > MAX_SHARE_CHARS ? '' : out;
}

/** Decode + validate a shared payload. Unknown slugs survive (surfaced as unlisted). */
export function decodeSharePayload(code: string): SharePayload | null {
  if (!code || code.length > MAX_SHARE_CHARS + 64) return null;
  const json = base64UrlDecode(code.trim());
  if (!json) return null;
  try {
    const p = JSON.parse(json) as Partial<SharePayload>;
    if (p.v !== SHARE_VERSION) return null;
    if (p.kind !== 'stack' && p.kind !== 'workflow') return null;
    if (!p.data || typeof p.data !== 'object') return null;
    return { v: p.v, kind: p.kind, data: p.data as Record<string, unknown> };
  } catch {
    return null;
  }
}

/** Import a shared stack into this browser (fresh id + timestamps). Null when invalid. */
export function importSharedStack(data: Record<string, unknown>, storage: Storage | null = safeStorage()): SavedStackEntry[] | null {
  const name = typeof data.name === 'string' ? data.name.trim().slice(0, 80) : '';
  if (!name) return null;
  const goal = typeof data.goal === 'string' && data.goal ? data.goal.slice(0, 40) : 'faceless';
  const budget = typeof data.budget === 'string' && data.budget ? data.budget.slice(0, 40) : 'budget';
  const picks: Record<number, string> = {};
  if (data.picks && typeof data.picks === 'object') {
    for (const [k, v] of Object.entries(data.picks as Record<string, unknown>)) {
      if (typeof v === 'string' && v) picks[Number(k)] = v.slice(0, 80);
    }
  }
  const notes = typeof data.notes === 'string' ? data.notes.slice(0, 500) : undefined;
  return saveStackEntry({ name, goal, budget, picks, ...(notes ? { notes } : {}) }, storage);
}

/** Import a shared workflow into this browser (fresh id + timestamps). Null when invalid. */
export function importSharedWorkflow(data: Record<string, unknown>, storage: Storage | null = safeStorage()): SavedWorkflowEntry[] | null {
  const name = typeof data.name === 'string' ? data.name.trim().slice(0, 80) : '';
  if (!name) return null;
  const slug = typeof data.slug === 'string' && data.slug ? data.slug.slice(0, 80) : 'custom';
  const picks: Record<string, string> = {};
  if (data.picks && typeof data.picks === 'object') {
    for (const [k, v] of Object.entries(data.picks as Record<string, unknown>)) {
      if (typeof v === 'string' && v) picks[k.slice(0, 40)] = v.slice(0, 80);
    }
  }
  const steps = Array.isArray(data.steps)
    ? data.steps.map(normalizeStep).filter((s): s is WorkflowStep => s !== null).slice(0, 24)
    : undefined;
  const notes = typeof data.notes === 'string' ? data.notes.slice(0, 500) : undefined;
  return saveWorkflowEntry(
    { name, slug, picks, ...(steps && steps.length > 0 ? { steps } : {}), ...(notes ? { notes } : {}) },
    storage
  );
}
