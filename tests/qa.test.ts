import { describe, it, expect } from 'vitest';
import {
  groupQaPosts,
  qaEntityExists,
  validateQaPost,
  validateQaReport,
  type CommunityPost,
} from '@/lib/qa';
import { ALL_TOOLS } from '@/data/tools';
import { OUTCOMES } from '@/data/outcomes';
import { WORKFLOWS } from '@/data/workflows';

const TOOL = ALL_TOOLS[0].slug;
const OUTCOME = OUTCOMES[0].slug;
const WORKFLOW = WORKFLOWS[0].slug;

const basePost = {
  entity_type: 'tool' as const,
  entity_slug: TOOL,
  kind: 'question' as const,
  parent_id: null,
  title: 'Does it export SRT files?',
  body: 'I need proper SRT exports for my editing workflow in Premiere.',
  author_name: 'Maya',
};

describe('qaEntityExists', () => {
  it('accepts real slugs per entity type', () => {
    expect(qaEntityExists('tool', TOOL)).toBe(true);
    expect(qaEntityExists('outcome', OUTCOME)).toBe(true);
    expect(qaEntityExists('workflow', WORKFLOW)).toBe(true);
  });

  it('rejects unknown slugs, cross-type slugs and unknown types', () => {
    expect(qaEntityExists('tool', 'no-such-tool')).toBe(false);
    // A tool slug is not a valid outcome slug — scope is strict.
    expect(qaEntityExists('outcome', TOOL)).toBe(false);
    expect(qaEntityExists('forum', TOOL)).toBe(false);
    expect(qaEntityExists('tool', '')).toBe(false);
  });
});

describe('validateQaPost', () => {
  it('accepts a valid question, tip and showcase', () => {
    for (const kind of ['question', 'tip', 'showcase'] as const) {
      const r = validateQaPost({ ...basePost, kind });
      expect(r.ok, kind).toBe(true);
    }
  });

  it('accepts answers with a parent id and no title', () => {
    const r = validateQaPost({
      ...basePost,
      kind: 'answer',
      parent_id: 12,
      title: undefined,
      body: 'Yes — File > Export > Subtitles gives you a clean SRT.',
    });
    expect(r).toMatchObject({ ok: true, post: { parent_id: 12, title: null } });
  });

  it('rejects answers without a parent and non-answers with one', () => {
    expect(validateQaPost({ ...basePost, kind: 'answer', parent_id: null }).ok).toBe(false);
    expect(validateQaPost({ ...basePost, kind: 'answer', parent_id: 'x' }).ok).toBe(false);
    expect(validateQaPost({ ...basePost, kind: 'tip', parent_id: 3 }).ok).toBe(false);
  });

  it('enforces title and body length limits', () => {
    expect(validateQaPost({ ...basePost, title: 'Hi' }).ok).toBe(false);
    expect(validateQaPost({ ...basePost, title: 'x'.repeat(121) }).ok).toBe(false);
    expect(validateQaPost({ ...basePost, body: 'short' }).ok).toBe(false);
    expect(validateQaPost({ ...basePost, body: 'x'.repeat(2001) }).ok).toBe(false);
  });

  it('rejects unknown entities, kinds and trims the author name', () => {
    expect(validateQaPost({ ...basePost, entity_slug: 'nope' }).ok).toBe(false);
    expect(validateQaPost({ ...basePost, entity_type: 'blog' }).ok).toBe(false);
    expect(validateQaPost({ ...basePost, kind: 'rant' }).ok).toBe(false);
    const anon = validateQaPost({ ...basePost, author_name: '' });
    expect(anon).toMatchObject({ ok: true, post: { author_name: 'Anonymous Creator' } });
    const long = validateQaPost({ ...basePost, author_name: 'x'.repeat(100) });
    expect(long.ok && long.post.author_name.length).toBe(40);
  });
});

describe('validateQaReport', () => {
  it('accepts known reasons with optional detail', () => {
    for (const reason of ['spam', 'abuse', 'misinformation', 'other']) {
      const r = validateQaReport({ post_id: 5, reason, detail: null });
      expect(r.ok, reason).toBe(true);
    }
    const withDetail = validateQaReport({ post_id: 5, reason: 'spam', detail: 'crypto link' });
    expect(withDetail).toMatchObject({ ok: true, report: { detail: 'crypto link' } });
  });

  it('rejects bad ids, reasons and oversized details', () => {
    expect(validateQaReport({ post_id: 0, reason: 'spam', detail: null }).ok).toBe(false);
    expect(validateQaReport({ post_id: 'x', reason: 'spam', detail: null }).ok).toBe(false);
    expect(validateQaReport({ post_id: 5, reason: 'dislike', detail: null }).ok).toBe(false);
    expect(validateQaReport({ post_id: 5, reason: 'spam', detail: 'x'.repeat(501) }).ok).toBe(false);
  });
});

describe('groupQaPosts', () => {
  const post = (over: Partial<CommunityPost> & { id: number; kind: CommunityPost['kind'] }): CommunityPost => ({
    entity_type: 'tool',
    entity_slug: TOOL,
    parent_id: null,
    title: null,
    body: 'body text here',
    author_name: 'A',
    helpful_count: 0,
    created_at: '2026-09-01T00:00:00.000Z',
    ...over,
  });

  it('nests answers under their questions, oldest first', () => {
    const posts = [
      post({ id: 1, kind: 'question', title: 'Q?' }),
      post({ id: 3, kind: 'answer', parent_id: 1, created_at: '2026-09-03T00:00:00.000Z' }),
      post({ id: 2, kind: 'answer', parent_id: 1, created_at: '2026-09-02T00:00:00.000Z' }),
      post({ id: 4, kind: 'tip', title: 'T' }),
      post({ id: 5, kind: 'showcase', title: 'S' }),
    ];
    const { questions, tips, showcases } = groupQaPosts(posts);
    expect(questions).toHaveLength(1);
    expect(questions[0].answers.map((a) => a.id)).toEqual([2, 3]);
    expect(tips.map((p) => p.id)).toEqual([4]);
    expect(showcases.map((p) => p.id)).toEqual([5]);
  });

  it('drops orphan answers (parent not in the approved set)', () => {
    const { questions } = groupQaPosts([post({ id: 9, kind: 'answer', parent_id: 99 })]);
    expect(questions).toEqual([]);
  });
});
