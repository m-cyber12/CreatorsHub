import { describe, it, expect } from 'vitest';
import {
  STUDIO_TOOLS,
  STUDIO_TOOL_SLUGS,
  studioToolKind,
  studioToolUsesQuota,
  isCloudSource,
  studioSourceLabel,
} from '@/lib/studio';

/**
 * Studio execution-model registry — marketing copy must match the
 * implementation. Local utilities must never be quota-gated; AI-assisted
 * results must always carry their true provenance.
 */

describe('studio registry', () => {
  it('covers all 8 utilities', () => {
    expect(STUDIO_TOOL_SLUGS).toHaveLength(8);
    for (const slug of STUDIO_TOOL_SLUGS) {
      expect(STUDIO_TOOLS[slug].slug).toBe(slug);
    }
  });

  it('gates quota ONLY on the utilities that call /api/ai-studio/generate', () => {
    expect(studioToolUsesQuota('prompt-builder')).toBe(true);
    expect(studioToolUsesQuota('thumbnail-brief')).toBe(true);
    expect(studioToolUsesQuota('thumbnail-text')).toBe(true);
    for (const slug of ['content-calendar', 'image-tools', 'subtitle-tools', 'audio-trimmer', 'video-inspector']) {
      expect(studioToolUsesQuota(slug)).toBe(false);
      expect(studioToolKind(slug)).toBe('local');
    }
  });

  it('treats unknown slugs as local (fail closed — never quota-gate)', () => {
    expect(studioToolUsesQuota('not-a-tool')).toBe(false);
    expect(studioToolKind('not-a-tool')).toBe('local');
  });
});

describe('studio provenance labels', () => {
  it('recognises cloud model sources', () => {
    expect(isCloudSource('Google Gemini 1.5 Flash (Free Tier)')).toBe(true);
    expect(isCloudSource('Groq Llama 3.3 (Free)')).toBe(true);
    expect(isCloudSource('OpenRouter Free Model')).toBe(true);
    expect(isCloudSource('OpenAI GPT-4o-mini')).toBe(true);
  });

  it('never presents the local engine as AI output', () => {
    expect(isCloudSource('Studio Smart Engine (local templates)')).toBe(false);
    expect(isCloudSource('Studio Smart Engine')).toBe(false);
    expect(isCloudSource(null)).toBe(false);
    expect(isCloudSource(undefined)).toBe(false);
    expect(studioSourceLabel('Studio Smart Engine').ai).toBe(false);
    expect(studioSourceLabel('Google Gemini 1.5 Flash (Free Tier)').ai).toBe(true);
  });
});
