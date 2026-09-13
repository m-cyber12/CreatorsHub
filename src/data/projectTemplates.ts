import type { ProjectType } from '@/lib/projects';

/**
 * Project templates (upgrade #22 — "start from a template").
 *
 * Every slug is validated against the live catalog at test time
 * (tests/projectTemplates.test.ts); the lib silently drops unknown
 * slugs, so this file must never invent slugs.
 *
 * i18n: display copy lives under `projects.templates.{id}.*` in the
 * message files — never hardcode user-facing strings here.
 */
export interface ProjectTemplate {
  id: string;
  /** Project type to create (valid ProjectType). */
  type: ProjectType;
  /** Workflow template slugs to attach (valid WORKFLOWS slugs). */
  workflowSlugs: string[];
  /** Catalog tool slugs to attach (valid ALL_TOOLS slugs). */
  toolSlugs: string[];
}

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'faceless-video',
    type: 'youtube',
    workflowSlugs: ['faceless-video'],
    toolSlugs: ['chatgpt', 'elevenlabs', 'invideo', 'canva', 'vidiq'],
  },
  {
    id: 'podcast-repurpose',
    type: 'podcast',
    workflowSlugs: ['podcast-to-shorts'],
    toolSlugs: ['riverside', 'descript', 'opusclip', 'submagic'],
  },
  {
    id: 'shorts-growth',
    type: 'youtube',
    workflowSlugs: [],
    toolSlugs: ['opusclip', 'submagic', 'capcut'],
  },
  {
    id: 'global-dubbing',
    type: 'youtube',
    workflowSlugs: ['dubbed-content'],
    toolSlugs: ['rask-ai', 'elevenlabs', 'happy-scribe'],
  },
  {
    id: 'ugc-ads',
    type: 'campaign',
    workflowSlugs: ['ugc-ads'],
    toolSlugs: ['heygen', 'canva', 'capcut'],
  },
];
