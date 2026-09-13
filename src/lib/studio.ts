/**
 * AI Studio registry — single source of truth for what each Studio utility
 * actually does.
 *
 * Trust fix (2026-09): every Studio page displayed "Browser-only · no API"
 * while Prompt Builder, Thumbnail Brief and Thumbnail Text actually POST to
 * /api/ai-studio/generate (cloud AI with local fallback) and consumed a paid
 * "AI generations" quota. Marketing copy must match the implementation:
 *
 *   - 'ai-assisted' utilities call /api/ai-studio/generate. When a cloud
 *     model key is configured the run is AI-generated; otherwise the
 *     built-in local engine produces a structured starting point. Either
 *     way the result is labelled with its TRUE source (see the `source`
 *     field of the API response) and counts as one Studio run against the
 *     daily quota.
 *   - 'local' utilities run 100% in the browser (no network, no quota, no
 *     account needed). They are unlimited and must NEVER be quota-gated —
 *     blocking a local file export on an "AI runs" limit is both a bug and
 *     a misleading paywall.
 */

export type StudioToolKind = 'ai-assisted' | 'local';

export type StudioToolSlug =
  | 'prompt-builder'
  | 'thumbnail-brief'
  | 'thumbnail-text'
  | 'content-calendar'
  | 'image-tools'
  | 'subtitle-tools'
  | 'audio-trimmer'
  | 'video-inspector';

export interface StudioToolMeta {
  slug: StudioToolSlug;
  kind: StudioToolKind;
  /** i18n key under `studio.nav.*` for the display name. */
  navKey: string;
  /** True when runs consume the daily Studio quota. */
  usesQuota: boolean;
}

export const STUDIO_TOOLS: Record<StudioToolSlug, StudioToolMeta> = {
  'prompt-builder': { slug: 'prompt-builder', kind: 'ai-assisted', navKey: 'nav.promptBuilder', usesQuota: true },
  'thumbnail-brief': { slug: 'thumbnail-brief', kind: 'ai-assisted', navKey: 'nav.thumbnailBrief', usesQuota: true },
  'thumbnail-text': { slug: 'thumbnail-text', kind: 'ai-assisted', navKey: 'nav.thumbnailText', usesQuota: true },
  'content-calendar': { slug: 'content-calendar', kind: 'local', navKey: 'nav.contentCalendar', usesQuota: false },
  'image-tools': { slug: 'image-tools', kind: 'local', navKey: 'nav.imageTools', usesQuota: false },
  'subtitle-tools': { slug: 'subtitle-tools', kind: 'local', navKey: 'nav.subtitleTools', usesQuota: false },
  'audio-trimmer': { slug: 'audio-trimmer', kind: 'local', navKey: 'nav.audioTrimmer', usesQuota: false },
  'video-inspector': { slug: 'video-inspector', kind: 'local', navKey: 'nav.videoInspector', usesQuota: false },
};

export const STUDIO_TOOL_SLUGS = Object.keys(STUDIO_TOOLS) as StudioToolSlug[];

export function studioToolKind(slug: string): StudioToolKind {
  return (STUDIO_TOOLS as Record<string, StudioToolMeta>)[slug]?.kind ?? 'local';
}

/** True when this utility's runs count against the daily Studio quota. */
export function studioToolUsesQuota(slug: string): boolean {
  return (STUDIO_TOOLS as Record<string, StudioToolMeta>)[slug]?.usesQuota ?? false;
}

export function isStudioToolSlug(slug: string): slug is StudioToolSlug {
  return slug in STUDIO_TOOLS;
}

/**
 * Values of the `source` field returned by /api/ai-studio/generate that
 * indicate a real cloud model produced the output (vs. the local engine).
 * Keep in sync with src/app/api/ai-studio/generate/route.ts.
 */
const CLOUD_SOURCES = [
  'Google Gemini',
  'Groq Llama',
  'OpenRouter',
  'OpenAI GPT',
];

/** True when the API response source names a cloud AI model. */
export function isCloudSource(source: string | null | undefined): boolean {
  if (!source) return false;
  return CLOUD_SOURCES.some((s) => source.includes(s));
}

/** Honest one-line provenance label for a Studio result. */
export function studioSourceLabel(source: string | null | undefined): {
  ai: boolean;
  label: string;
} {
  if (isCloudSource(source)) {
    return { ai: true, label: source as string };
  }
  return { ai: false, label: 'Studio local engine (no AI model call)' };
}
