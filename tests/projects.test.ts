import { describe, it, expect } from 'vitest';
import { WORKFLOWS } from '../src/data/workflows';
import {
  loadProjects,
  saveProjects,
  createProject,
  updateProject,
  deleteProject,
  addPrompt,
  removePrompt,
  toggleTool,
  toggleWorkflow,
  attachTools,
  setNotes,
  projectMonthlyCost,
  projectTools,
  projectWorkflows,
  projectMinutes,
  workflowTitleFor,
  projectWorkflowCoverage,
  PROJECTS_KEY,
  MAX_PROJECTS,
  MAX_PROMPTS_PER_PROJECT,
  type NoxiferaProject,
} from '../src/lib/projects';

const NOW = '2026-09-12T12:00:00.000Z';

class MemStorage implements Storage {
  private m = new Map<string, string>();
  getItem(k: string) { return this.m.get(k) ?? null; }
  setItem(k: string, v: string) { this.m.set(k, v); }
  removeItem(k: string) { this.m.delete(k); }
  clear() { this.m.clear(); }
  key(i: number) { return [...this.m.keys()][i] ?? null; }
  get length() { return this.m.size; }
}

describe('projects — CRUD', () => {
  it('creates, lists and deletes projects', () => {
    const s = new MemStorage();
    const p = createProject('My YouTube Channel', 'youtube', NOW, s);
    expect(p).not.toBeNull();
    expect(p!.type).toBe('youtube');
    expect(loadProjects(s)).toHaveLength(1);
    expect(p!.history.map((h) => h.event)).toEqual(['project.created']);

    deleteProject(p!.id, s);
    expect(loadProjects(s)).toHaveLength(0);
  });

  it('rejects empty names and invalid types', () => {
    const s = new MemStorage();
    expect(createProject('   ', 'youtube', NOW, s)).toBeNull();
    expect(createProject('X', 'not-a-type' as never, NOW, s)).toBeNull();
    expect(loadProjects(s)).toHaveLength(0);
  });

  it('caps the number of projects', () => {
    const s = new MemStorage();
    for (let i = 0; i < MAX_PROJECTS; i++) createProject(`P${i}`, 'campaign', NOW, s);
    expect(createProject('One too many', 'campaign', NOW, s)).toBeNull();
    expect(loadProjects(s)).toHaveLength(MAX_PROJECTS);
  });

  it('tolerates corrupted storage and invalid shapes', () => {
    const s = new MemStorage();
    s.setItem(PROJECTS_KEY, '{bad json');
    expect(loadProjects(s)).toEqual([]);
    s.setItem(PROJECTS_KEY, JSON.stringify([{ id: 'x', type: 'nope' }, 'garbage', null]));
    expect(loadProjects(s)).toEqual([]);
  });
});

describe('projects — prompts', () => {
  it('adds and removes prompts with history entries', () => {
    const s = new MemStorage();
    const p = createProject('Podcast', 'podcast', NOW, s)!;
    const withPrompt = addPrompt(p.id, 'Hook formula', 'Write 5 cold open hooks…', NOW, s)!;
    expect(withPrompt.prompts).toHaveLength(1);
    expect(withPrompt.prompts[0].title).toBe('Hook formula');
    const afterRemove = removePrompt(p.id, withPrompt.prompts[0].id, NOW, s)!;
    expect(afterRemove.prompts).toHaveLength(0);
    expect(afterRemove.history.map((h) => h.event)).toEqual(['project.created', 'prompt.added', 'prompt.removed']);
  });

  it('trims prompt text and caps per-project prompts', () => {
    const s = new MemStorage();
    const p = createProject('P', 'series', NOW, s)!;
    addPrompt(p.id, '  Trim me  ', '  body  ', NOW, s);
    const stored = loadProjects(s)[0];
    expect(stored.prompts[0].title).toBe('Trim me');
    expect(stored.prompts[0].body).toBe('body');

    for (let i = 0; i < MAX_PROMPTS_PER_PROJECT - 1; i++) addPrompt(p.id, `P${i}`, 'b', NOW, s);
    const overflow = addPrompt(p.id, 'overflow', 'b', NOW, s);
    expect(overflow!.prompts).toHaveLength(MAX_PROMPTS_PER_PROJECT);
  });
});

describe('projects — attachments (validated against the catalog)', () => {
  it('attaches real tools and workflows, rejects unknown slugs', () => {
    const s = new MemStorage();
    const p = createProject('Launch', 'product-launch', NOW, s)!;
    toggleTool(p.id, 'runway', NOW, s);
    toggleTool(p.id, 'not-a-tool', NOW, s);
    toggleWorkflow(p.id, 'faceless-video', NOW, s);
    toggleWorkflow(p.id, 'nope', NOW, s);
    const cur = loadProjects(s)[0];
    expect(cur.toolSlugs).toEqual(['runway']);
    expect(cur.workflowSlugs).toEqual(['faceless-video']);
  });

  it('toggle removes when already attached', () => {
    const s = new MemStorage();
    const p = createProject('P', 'youtube', NOW, s)!;
    toggleTool(p.id, 'elevenlabs', NOW, s);
    const cur = toggleTool(p.id, 'elevenlabs', NOW, s)!;
    expect(cur.toolSlugs).toEqual([]);
  });

  it('attachTools adds missing valid slugs non-destructively', () => {
    const s = new MemStorage();
    const p = createProject('Advisor plan', 'youtube', NOW, s)!;
    toggleTool(p.id, 'elevenlabs', NOW, s); // pre-existing
    const res = attachTools(p.id, ['elevenlabs', 'runway', 'not-a-tool'], NOW, s);
    expect(res.added).toBe(1);
    expect(res.project!.toolSlugs).toEqual(['elevenlabs', 'runway']); // existing kept, never removed
    expect(res.project!.history[res.project!.history.length - 1].event).toBe('tools.attached');
  });

  it('attachTools is a no-op (no history entry) when nothing new to add', () => {
    const s = new MemStorage();
    const p = createProject('P', 'podcast', NOW, s)!;
    const res = attachTools(p.id, ['runway'], NOW, s);
    expect(res.added).toBe(1);
    const again = attachTools(p.id, ['runway', 'nope'], NOW, s);
    expect(again.added).toBe(0);
    expect(loadProjects(s)[0].history).toHaveLength(2); // created + one tools.attached
  });

  it('attachTools respects the per-project tool cap', () => {
    const s = new MemStorage();
    const p = createProject('Cap', 'campaign', NOW, s)!;
    const slugs = ['runway', 'capcut', 'elevenlabs', 'opusclip', 'canva', 'midjourney', 'descript', 'veed', 'chatgpt', 'claude', 'murf-ai', 'jasper', 'munch'];
    const res = attachTools(p.id, slugs, NOW, s);
    expect(res.project!.toolSlugs).toHaveLength(12);
    expect(res.added).toBeLessThanOrEqual(12);
  });

  it('attachTools returns null project for unknown ids', () => {
    const s = new MemStorage();
    expect(attachTools('ghost', ['runway'], NOW, s)).toEqual({ project: null, added: 0 });
  });

  it('derives tools, workflows, minutes and cost live from the catalog', () => {
    const s = new MemStorage();
    const p = createProject('P', 'youtube', NOW, s)!;
    toggleTool(p.id, 'runway', NOW, s); // $15/mo
    toggleTool(p.id, 'capcut', NOW, s); // Free → $0
    toggleWorkflow(p.id, 'podcast-to-shorts', NOW, s);
    const cur = loadProjects(s)[0];
    expect(projectTools(cur).map((t) => t.slug).sort()).toEqual(['capcut', 'runway']);
    expect(projectMonthlyCost(cur)).toBe(15);
    expect(projectWorkflows(cur)).toHaveLength(1);
    expect(workflowTitleFor('podcast-to-shorts')).toBe('One Episode → 10 Publishable Shorts');
    expect(projectMinutes(cur)).toBeGreaterThan(0);
  });
});

describe('projects — notes, history and timestamps', () => {
  it('saves notes and keeps the history cap', () => {
    const s = new MemStorage();
    const p = createProject('P', 'newsletter', NOW, s)!;
    setNotes(p.id, 'Ship the first issue Friday.', NOW, s);
    expect(loadProjects(s)[0].notes).toBe('Ship the first issue Friday.');

    let cur = p;
    for (let i = 0; i < 40; i++) cur = addPrompt(cur.id, `P${i}`, 'x', NOW, s)!;
    expect(cur.history.length).toBeLessThanOrEqual(30);
    expect(cur.history[cur.history.length - 1].event).toBe('prompt.added');
    expect(cur.updatedAt).toBe(NOW);
  });

  it('ignores updates to unknown project ids', () => {
    const s = new MemStorage();
    expect(updateProject('ghost', (x: NoxiferaProject) => x, 'notes.saved', NOW, s)).toBeNull();
  });

  it('round-trips through storage', () => {
    const s = new MemStorage();
    const p = createProject('RT', 'campaign', NOW, s)!;
    addPrompt(p.id, 'A', 'B', NOW, s);
    const s2 = new MemStorage();
    s2.setItem(PROJECTS_KEY, s.getItem(PROJECTS_KEY)!);
    expect(loadProjects(s2)[0].prompts).toHaveLength(1);
    saveProjects(loadProjects(s), s2);
    expect(loadProjects(s2)[0].name).toBe('RT');
  });
});

describe('projects — workflow coverage', () => {
  const FACELESS = WORKFLOWS.find((w) => w.slug === 'faceless-video')!;
  const TOOL_NODES = FACELESS.nodes.filter((n) => Boolean(n.tool));

  it('reports 0% with no tools and 100% once every step tool is attached', () => {
    const s = new MemStorage();
    const p = createProject('C', 'youtube', NOW, s)!;
    toggleWorkflow(p.id, 'faceless-video', NOW, s);
    let cov = projectWorkflowCoverage(loadProjects(s)[0])[0];
    expect(cov.total).toBe(TOOL_NODES.length);
    expect(cov.covered).toBe(0);
    expect(cov.missing.map((m) => m.toolSlug)).toEqual(TOOL_NODES.map((n) => n.tool));
    for (const n of TOOL_NODES) toggleTool(p.id, n.tool!, NOW, s);
    cov = projectWorkflowCoverage(loadProjects(s)[0])[0];
    expect(cov.covered).toBe(cov.total);
    expect(cov.missing).toEqual([]);
  });

  it('partial coverage lists exactly the missing steps, in workflow order', () => {
    const s = new MemStorage();
    const p = createProject('C', 'youtube', NOW, s)!;
    toggleWorkflow(p.id, 'faceless-video', NOW, s);
    toggleTool(p.id, TOOL_NODES[0].tool!, NOW, s);
    const cov = projectWorkflowCoverage(loadProjects(s)[0])[0];
    expect(cov.covered).toBe(1);
    expect(cov.missing.map((m) => m.toolSlug)).toEqual(TOOL_NODES.slice(1).map((n) => n.tool));
  });

  it('only covers attached workflows; unknown attached workflows never appear', () => {
    const s = new MemStorage();
    const p = createProject('C', 'youtube', NOW, s)!;
    expect(projectWorkflowCoverage(loadProjects(s)[0])).toEqual([]);
    toggleWorkflow(p.id, 'not-a-workflow', NOW, s); // lib rejects unknown slugs
    expect(projectWorkflowCoverage(loadProjects(s)[0])).toEqual([]);
  });
});
