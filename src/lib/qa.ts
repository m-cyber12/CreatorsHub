import { ALL_TOOLS } from '@/data/tools';
import { OUTCOMES } from '@/data/outcomes';
import { WORKFLOWS } from '@/data/workflows';

/**
 * Scoped Q&A (P3) — shared validation and types.
 *
 * Posts attach to exactly one catalog entity (tool, outcome, workflow).
 * Validation lives here so the API routes and the test suite share one
 * implementation; length limits mirror the reviews route conventions.
 */

export const QA_ENTITY_TYPES = ['tool', 'outcome', 'workflow'] as const;
export type QaEntityType = (typeof QA_ENTITY_TYPES)[number];

export const QA_KINDS = ['question', 'answer', 'tip', 'showcase'] as const;
export type QaKind = (typeof QA_KINDS)[number];

export const QA_REPORT_REASONS = ['spam', 'abuse', 'misinformation', 'other'] as const;
export type QaReportReason = (typeof QA_REPORT_REASONS)[number];

export const QA_TITLE_MIN = 3;
export const QA_TITLE_MAX = 120;
export const QA_BODY_MIN = 10;
export const QA_BODY_MAX = 2000;
export const QA_NAME_MAX = 40;
export const QA_REPORT_DETAIL_MAX = 500;

export interface CommunityPost {
  id: number;
  entity_type: QaEntityType;
  entity_slug: string;
  kind: QaKind;
  parent_id: number | null;
  title: string | null;
  body: string;
  author_name: string;
  helpful_count: number;
  created_at: string;
}

/** A question with its approved answers nested. */
export interface QuestionThread extends CommunityPost {
  answers: CommunityPost[];
}

export function qaEntityExists(entityType: string, slug: string): boolean {
  if (entityType === 'tool') return ALL_TOOLS.some((t) => t.slug === slug);
  if (entityType === 'outcome') return OUTCOMES.some((o) => o.slug === slug);
  if (entityType === 'workflow') return WORKFLOWS.some((w) => w.slug === slug);
  return false;
}

export interface QaPostInput {
  entity_type: unknown;
  entity_slug: unknown;
  kind: unknown;
  parent_id: unknown;
  title: unknown;
  body: unknown;
  author_name: unknown;
}

export interface ValidQaPost {
  entity_type: QaEntityType;
  entity_slug: string;
  kind: QaKind;
  parent_id: number | null;
  title: string | null;
  body: string;
  author_name: string;
}

/**
 * Validate a post submission. Returns the sanitized row or an error code
 * the route maps to a 400 response. Parent-entity consistency (parent is a
 * question on the same entity) is checked by the route against the database.
 */
export function validateQaPost(input: QaPostInput): { ok: true; post: ValidQaPost } | { ok: false; error: string } {
  const { entity_type, entity_slug, kind, parent_id, title, body, author_name } = input;

  if (entity_type !== 'tool' && entity_type !== 'outcome' && entity_type !== 'workflow') {
    return { ok: false, error: 'Unknown entity type' };
  }
  if (typeof entity_slug !== 'string' || !qaEntityExists(entity_type, entity_slug)) {
    return { ok: false, error: 'Unknown entity' };
  }
  if (kind !== 'question' && kind !== 'answer' && kind !== 'tip' && kind !== 'showcase') {
    return { ok: false, error: 'Unknown post kind' };
  }

  let parent: number | null = null;
  if (kind === 'answer') {
    parent = typeof parent_id === 'number' && Number.isInteger(parent_id) ? parent_id : Number(parent_id);
    if (!Number.isInteger(parent) || (parent as number) <= 0) {
      return { ok: false, error: 'Answers require a parent question id' };
    }
  } else if (parent_id !== undefined && parent_id !== null) {
    return { ok: false, error: 'Only answers take a parent id' };
  }

  let cleanTitle: string | null = null;
  if (kind !== 'answer') {
    if (typeof title !== 'string' || title.trim().length < QA_TITLE_MIN || title.length > QA_TITLE_MAX) {
      return { ok: false, error: `Title must be ${QA_TITLE_MIN}-${QA_TITLE_MAX} characters` };
    }
    cleanTitle = title.trim();
  }

  if (typeof body !== 'string' || body.trim().length < QA_BODY_MIN || body.length > QA_BODY_MAX) {
    return { ok: false, error: `Body must be ${QA_BODY_MIN}-${QA_BODY_MAX} characters` };
  }

  const safeName =
    typeof author_name === 'string' && author_name.trim()
      ? author_name.trim().slice(0, QA_NAME_MAX)
      : 'Anonymous Creator';

  return {
    ok: true,
    post: {
      entity_type,
      entity_slug,
      kind,
      parent_id: kind === 'answer' ? (parent as number) : null,
      title: cleanTitle,
      body: body.trim(),
      author_name: safeName,
    },
  };
}

export function validateQaReport(input: {
  post_id: unknown;
  reason: unknown;
  detail: unknown;
}): { ok: true; report: { post_id: number; reason: QaReportReason; detail: string | null } } | { ok: false; error: string } {
  const id = typeof input.post_id === 'number' ? input.post_id : Number(input.post_id);
  if (!Number.isInteger(id) || id <= 0) return { ok: false, error: 'Unknown post' };
  const { reason, detail } = input;
  if (reason !== 'spam' && reason !== 'abuse' && reason !== 'misinformation' && reason !== 'other') {
    return { ok: false, error: 'Unknown report reason' };
  }
  if (detail !== undefined && detail !== null && detail !== '') {
    if (typeof detail !== 'string' || detail.length > QA_REPORT_DETAIL_MAX) {
      return { ok: false, error: `Report detail must be under ${QA_REPORT_DETAIL_MAX} characters` };
    }
    return { ok: true, report: { post_id: id, reason, detail: detail.trim() || null } };
  }
  return { ok: true, report: { post_id: id, reason, detail: null } };
}

/** Group a flat approved-post list into questions-with-answers, tips, showcases. */
export function groupQaPosts(posts: CommunityPost[]): {
  questions: QuestionThread[];
  tips: CommunityPost[];
  showcases: CommunityPost[];
} {
  const answersByParent = new Map<number, CommunityPost[]>();
  for (const p of posts) {
    if (p.kind === 'answer' && p.parent_id !== null) {
      const list = answersByParent.get(p.parent_id) ?? [];
      list.push(p);
      answersByParent.set(p.parent_id, list);
    }
  }
  const byDateAsc = (a: CommunityPost, b: CommunityPost) => (a.created_at < b.created_at ? -1 : 1);
  const questions: QuestionThread[] = posts
    .filter((p) => p.kind === 'question')
    .map((p) => ({ ...p, answers: (answersByParent.get(p.id) ?? []).sort(byDateAsc) }));
  const tips = posts.filter((p) => p.kind === 'tip');
  const showcases = posts.filter((p) => p.kind === 'showcase');
  return { questions, tips, showcases };
}
