import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { rateLimit, clientIp } from '@/lib/rateLimit';
import { qaEntityExists, validateQaPost } from '@/lib/qa';

export const dynamic = 'force-dynamic';

const POST_COLUMNS =
  'id, entity_type, entity_slug, kind, parent_id, title, body, author_name, helpful_count, created_at';

// GET /api/qa?entity=tool&slug=<slug> — approved posts only, flat list.
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const entity = params.get('entity') ?? '';
  const slug = params.get('slug') ?? '';
  if (!qaEntityExists(entity, slug)) {
    return NextResponse.json({ error: 'Unknown entity' }, { status: 400 });
  }
  if (!supabase) return NextResponse.json({ posts: [] }, { status: 200 });

  const { data, error } = await supabase
    .from('community_posts')
    .select(POST_COLUMNS)
    .eq('entity_type', entity)
    .eq('entity_slug', slug)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) return NextResponse.json({ posts: [] }, { status: 200 });
  return NextResponse.json({ posts: data ?? [] }, { status: 200 });
}

// POST /api/qa — submit a question, answer, tip or showcase (held for moderation).
export async function POST(request: Request) {
  if (!rateLimit(`qa:${clientIp(request)}`, 3, 10 * 60_000)) {
    return NextResponse.json({ error: 'Too many posts — please try again later.' }, { status: 429 });
  }

  try {
    const result = validateQaPost(await request.json());
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
    const post = result.post;

    if (!supabaseAdmin) {
      // Never pretend a community contribution was saved when persistence is absent.
      return NextResponse.json(
        { error: 'Community Q&A is temporarily unavailable while moderation storage is being configured.' },
        { status: 503 }
      );
    }

    if (post.kind === 'answer' && post.parent_id !== null) {
      const { data: parent } = await supabaseAdmin
        .from('community_posts')
        .select('id, entity_type, entity_slug, kind')
        .eq('id', post.parent_id)
        .single();
      if (
        !parent ||
        (parent as { kind: string }).kind !== 'question' ||
        (parent as { entity_type: string }).entity_type !== post.entity_type ||
        (parent as { entity_slug: string }).entity_slug !== post.entity_slug
      ) {
        return NextResponse.json({ error: 'Answers must reply to a question on the same page.' }, { status: 400 });
      }
    }

    const { data, error } = await supabaseAdmin
      .from('community_posts')
      .insert([{ ...post, status: 'pending', helpful_count: 0 }])
      .select(POST_COLUMNS)
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ success: true, post: data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 });
  }
}

// PATCH /api/qa — { id, action: 'helpful' }
export async function PATCH(request: Request) {
  if (!rateLimit(`qahelpful:${clientIp(request)}`, 30, 60_000)) {
    return NextResponse.json({ error: 'Rate limit exceeded.' }, { status: 429 });
  }
  if (!supabaseAdmin) return NextResponse.json({ error: 'Not configured.' }, { status: 503 });
  try {
    const { id, action } = await request.json();
    if (action !== 'helpful' || !id) return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    await supabaseAdmin.rpc('increment_post_helpful', { post_id: id });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 });
  }
}
