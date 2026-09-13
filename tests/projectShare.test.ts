import { describe, it, expect } from 'vitest';
import { encodeProjectShare, decodeProjectShare } from '../src/lib/projectShare';
import type { NoxiferaProject } from '../src/lib/projects';

const NOW = '2026-09-13T12:00:00.000Z';

function fakeProject(over: Partial<NoxiferaProject> = {}): NoxiferaProject {
  return {
    id: 'p_test',
    name: 'My Channel',
    type: 'youtube',
    prompts: [],
    workflowSlugs: ['faceless-video'],
    toolSlugs: ['chatgpt', 'elevenlabs'],
    notes: 'secret notes',
    createdAt: NOW,
    updatedAt: NOW,
    history: [],
    ...over,
  };
}

describe('project share — encode/decode', () => {
  it('round-trips name, type and slugs through URL-safe text', () => {
    const enc = encodeProjectShare(fakeProject());
    // URL-safe: no +, / or =
    expect(enc).not.toMatch(/[+/=]/);
    const dec = decodeProjectShare(enc);
    expect(dec).toEqual({
      name: 'My Channel',
      type: 'youtube',
      toolSlugs: ['chatgpt', 'elevenlabs'],
      workflowSlugs: ['faceless-video'],
    });
  });

  it('survives encodeURIComponent round-trip (as in a real URL)', () => {
    const enc = encodeProjectShare(fakeProject({ name: 'Café · قناة · 频道' }));
    const sp = new URLSearchParams();
    sp.set('import', enc);
    const dec = decodeProjectShare(sp.get('import')!);
    expect(dec?.name).toBe('Café · قناة · 频道');
  });

  it('does not leak prompts or notes', () => {
    const dec = decodeProjectShare(
      encodeProjectShare(fakeProject({ notes: 'secret', prompts: [{ id: 'x', title: 't', body: 'b', addedAt: NOW }] }))
    );
    expect(dec).not.toBeNull();
    expect(JSON.stringify(dec)).not.toContain('secret');
    expect(JSON.stringify(dec)).not.toContain('addedAt');
  });

  it('drops unknown slugs but keeps the valid ones', () => {
    const enc = encodeProjectShare(
      fakeProject({ toolSlugs: ['chatgpt', 'not-a-tool'], workflowSlugs: ['nope', 'faceless-video'] })
    );
    const dec = decodeProjectShare(enc);
    expect(dec?.toolSlugs).toEqual(['chatgpt']);
    expect(dec?.workflowSlugs).toEqual(['faceless-video']);
  });
});

describe('project share — strict decoding', () => {
  it('rejects garbage, non-JSON, and wrong shapes', () => {
    expect(decodeProjectShare('!!!not-base64!!!')).toBeNull();
    expect(decodeProjectShare(Buffer.from('not json').toString('base64'))).toBeNull();
    expect(decodeProjectShare(Buffer.from(JSON.stringify({ n: 'x' })).toString('base64'))).toBeNull(); // no type
    expect(decodeProjectShare(Buffer.from(JSON.stringify({ n: '', t: 'youtube' })).toString('base64'))).toBeNull(); // empty name
    expect(decodeProjectShare(Buffer.from(JSON.stringify({ n: 'x', t: 'hacking' })).toString('base64'))).toBeNull(); // bad type
    expect(decodeProjectShare('')).toBeNull();
  });

  it('caps name length and slug counts', () => {
    const enc = encodeProjectShare(
      fakeProject({
        name: 'x'.repeat(500),
        toolSlugs: Array.from({ length: 20 }, (_, i) => (i % 2 ? 'chatgpt' : 'elevenlabs')),
      })
    );
    const dec = decodeProjectShare(enc);
    expect(dec?.name).toHaveLength(80);
    expect(dec?.toolSlugs).toHaveLength(12);
  });
});
