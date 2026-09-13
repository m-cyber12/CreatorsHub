/**
 * Noxifera Workflow Engine — Roadmap §6 (Phase 4: "Workflow Builder").
 *
 * Turns a creator goal into an executable system: a pipeline of nodes, each
 * with the tool (a real catalog slug — cost is computed from the catalog at
 * render time, never hardcoded), instructions, an optional exact prompt,
 * input/output, time estimate and alternatives.
 *
 * Actions: save, duplicate, edit (local tool overrides), share (URL),
 * publish (copy the plan as markdown), open in Studio.
 */

import { ALL_TOOLS } from './tools';
import { podcastToShorts } from './workflow-entries/podcast-to-shorts';
import { facelessVideo } from './workflow-entries/faceless-video';
import { ugcAds } from './workflow-entries/ugc-ads';
import { dubbedContent } from './workflow-entries/dubbed-content';
import { youtubeLongForm } from './workflow-entries/youtube-long-form';

export interface WorkflowNode {
  id: string;
  label: string;
  /** Catalog slug of the primary tool (omitted for manual steps). */
  tool?: string;
  /** True for steps that are human, not tool. */
  manual?: boolean;
  /** Catalog slugs of alternative tools for this step. */
  alternatives: string[];
  input: string;
  output: string;
  instructions: string;
  /** Exact prompt to use (AI steps only). */
  prompt?: string;
  minutes: number;
}

export interface WorkflowTemplate {
  slug: string;
  title: string;
  oneLiner: string;
  frequency?: string;
  nodes: WorkflowNode[];
  notes: string[];
}

export const WORKFLOWS: WorkflowTemplate[] = [
  podcastToShorts,
  facelessVideo,
  ugcAds,
  dubbedContent,
  youtubeLongForm,
];

export function getWorkflow(slug: string): WorkflowTemplate | undefined {
  return WORKFLOWS.find((w) => w.slug === slug);
}

export function workflowMinutes(w: WorkflowTemplate): number {
  return w.nodes.reduce((s, n) => s + n.minutes, 0);
}

/** Entry-paid-tier cost convention (Free = $0, one-time/lifetime = $0). */
export function workflowNodeCost(toolSlug?: string): number {
  if (!toolSlug) return 0;
  const tool = ALL_TOOLS.find((x) => x.slug === toolSlug);
  if (!tool || tool.pricing === 'Free') return 0;
  if (!tool.startingPrice || /one-?time|lifetime/i.test(tool.startingPrice)) return 0;
  const m = tool.startingPrice.replace(/,/g, '').match(/\$?(\d+(?:\.\d+)?)/);
  if (!m) return 0;
  const n = parseFloat(m[1]);
  return /yr|year/i.test(tool.startingPrice) ? n / 12 : n;
}

/** Compact, serializable view of a workflow for client components. */
export function workflowForClient(w: WorkflowTemplate) {
  const costBySlug: Record<string, number> = {};
  for (const n of w.nodes) {
    for (const s of [n.tool, ...n.alternatives]) {
      if (s) costBySlug[s] = Math.round(workflowNodeCost(s) * 100) / 100;
    }
  }
  const toolInfo = (slug?: string) => {
    const tool = slug ? ALL_TOOLS.find((x) => x.slug === slug) : undefined;
    if (!tool) return undefined;
    return {
      slug: tool.slug,
      name: tool.name,
      logo: tool.logo,
      tagline: tool.tagline,
      pricing: tool.pricing,
      verificationLevel: tool.verificationLevel,
    };
  };
  return {
    slug: w.slug,
    title: w.title,
    oneLiner: w.oneLiner,
    frequency: w.frequency,
    costBySlug,
    nodes: w.nodes.map((n) => ({
      id: n.id,
      label: n.label,
      tool: n.tool,
      toolInfo: toolInfo(n.tool),
      manual: Boolean(n.manual),
      alternatives: n.alternatives,
      alternativeInfo: n.alternatives
        .map(toolInfo)
        .filter(Boolean) as NonNullable<ReturnType<typeof toolInfo>>[],
      input: n.input,
      output: n.output,
      instructions: n.instructions,
      prompt: n.prompt,
      minutes: n.minutes,
    })),
    notes: w.notes,
  };
}

export type WorkflowClientData = ReturnType<typeof workflowForClient>;
