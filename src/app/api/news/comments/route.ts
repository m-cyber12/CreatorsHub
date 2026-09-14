import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { supabase } from '@/lib/supabase';
import { rateLimit, clientIp } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');
  if (!slug) return NextResponse.json({ error: 'slug required' }, { status: 400 });

  const client = supabase || supabaseAdmin;
  if (!client) return NextResponse.json([], { status: 200 });

  try {
    const { data, error } = await client
      .from('news_comments')
      .select('id, news_slug, author_name, body, created_at')
      .eq('news_slug', slug)
      .eq('status', 'approved')
      .order('created_at', { ascending: true })
      .limit(100);
    if (error) return NextResponse.json([], { status: 200 });
    return NextResponse.json(data || [], { status: 200 });
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: Request) {
  if (!rateLimit(`news_comment:${clientIp(request)}`, 10, 60_000)) {
    return NextResponse.json({ error: 'Too many comments, wait a minute' }, { status: 429 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Comments not configured' }, { status: 503 });
  }

  try {
    const body = await request.json();
    const { slug, author_name, author_email, body: commentBody } = body;

    if (!slug || !author_name || !commentBody) {
      return NextResponse.json({ error: 'slug, author_name, body required' }, { status: 400 });
    }
    if (String(author_name).trim().length < 2 || String(author_name).trim().length > 60) {
      return NextResponse.json({ error: 'Name must be 2-60 chars' }, { status: 400 });
    }
    if (String(commentBody).trim().length < 3 || String(commentBody).trim().length > 2000) {
      return NextResponse.json({ error: 'Comment must be 3-2000 chars' }, { status: 400 });
    }

    // Ensure news exists
    const { data: newsExists } = await supabaseAdmin
      .from('news_items')
      .select('slug')
      .eq('slug', slug)
      .single();
    if (!newsExists) return NextResponse.json({ error: 'News not found' }, { status: 404 });

    const { data, error } = await supabaseAdmin
      .from('news_comments')
      .insert({
        news_slug: slug,
        author_name: String(author_name).trim(),
        author_email: author_email ? String(author_email).trim().slice(0, 120) : null,
        body: String(commentBody).trim(),
        status: 'approved',
      })
      .select('id, news_slug, author_name, body, created_at')
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ success: true, comment: data }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Bad request' }, { status: 400 });
  }
}
