import { NextResponse } from 'next/server';
import { isAdminAuthorized, requireCsrf } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

const POST_COLUMNS =
  'id, entity_type, entity_slug, kind, parent_id, title, body, author_name, helpful_count, status, created_at';

/**
 * GET /api/admin/community — moderation queues for scoped Q&A (P3/P4):
 * pending posts plus reported posts with their reports. Newest first.
 */
export async function GET() {
  if (!(await isAdminAuthorized())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const empty = { configured: Boolean(supabaseAdmin), pending: [], reports: [] };
  if (!supabaseAdmin) return NextResponse.json(empty, { status: 200 });

  try {
    const [{ data: pending }, { data: reports }] = await Promise.all([
      supabaseAdmin
        .from('community_posts')
        .select(POST_COLUMNS)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(100),
      supabaseAdmin
        .from('community_reports')
        .select('id, post_id, reason, detail, created_at')
        .order('created_at', { ascending: false })
        .limit(100),
    ]);

    const reportList = (reports ?? []) as { id: number; post_id: number; reason: string; detail: string | null; created_at: string }[];
    const postIds = [...new Set(reportList.map((r) => r.post_id))];
    let postsById = new Map<number, unknown>();
    if (postIds.length > 0) {
      const { data: reported } = await supabaseAdmin.from('community_posts').select(POST_COLUMNS).in('id', postIds);
      postsById = new Map(((reported ?? []) as { id: number }[]).map((p) => [p.id, p]));
    }

    return NextResponse.json(
      {
        configured: true,
        pending: pending ?? [],
        reports: reportList.map((r) => ({ ...r, post: postsById.get(r.post_id) ?? null })),
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(empty, { status: 200 });
  }
}

/**
 * PATCH /api/admin/community — { id, status: 'approved' | 'removed' }.
 * Removing a post cascades its reports (migration 0019 FK).
 */
export async function PATCH(request: Request) {
  if (!(await isAdminAuthorized())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!(await requireCsrf(request))) {
    return NextResponse.json({ error: 'Invalid or missing CSRF token' }, { status: 403 });
  }
  if (!supabaseAdmin) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });

  try {
    const { id, status } = await request.json();
    if (!id || (status !== 'approved' && status !== 'removed')) {
      return NextResponse.json({ error: 'Invalid id or status' }, { status: 400 });
    }
    const { error } = await supabaseAdmin.from('community_posts').update({ status }).eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 });
  }
}
