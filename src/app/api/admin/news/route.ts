import { NextResponse } from 'next/server';
import { isAdminAuthorized, requireCsrf } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { newsSlug } from '@/data/news';

/**
 * Admin news CRUD + editorial gate (v3.4+ real news site)
 *
 * GET    /api/admin/news            → all items (newest first, with content)
 * POST   /api/admin/news            → create new {title, excerpt, content, category, image?, slug?}
 * PUT    /api/admin/news            → edit {slug, title?, excerpt?, content?, category?, image?}
 * PATCH  /api/admin/news            → { slug, action: 'approve' | 'reject' } (legacy) OR toggle settings
 * DELETE /api/admin/news            → { slug } OR { all: true } deletes all
 */

export async function GET() {
  if (!(await isAdminAuthorized())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!supabaseAdmin) return NextResponse.json([], { status: 200 });
  try {
    const { data, error } = await supabaseAdmin
      .from('news_items')
      .select('slug, title, excerpt, content, source, source_url, category, published_at, approved, ai_summarized, image, iso_date')
      .order('published_at', { ascending: false })
      .limit(300);
    if (error) return NextResponse.json([], { status: 200 });
    return NextResponse.json(data || [], { status: 200 });
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: Request) {
  if (!(await isAdminAuthorized())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!(await requireCsrf(request))) {
    return NextResponse.json({ error: 'Invalid or missing CSRF token' }, { status: 403 });
  }
  if (!supabaseAdmin) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });

  try {
    const body = await request.json();
    const { title, excerpt, content, category, image, slug: providedSlug, published_at } = body;

    if (!title || String(title).trim().length < 5) {
      return NextResponse.json({ error: 'Title must be at least 5 chars' }, { status: 400 });
    }
    if (!content || String(content).trim().length < 20) {
      return NextResponse.json({ error: 'Content must be at least 20 chars' }, { status: 400 });
    }

    const slug = providedSlug ? newsSlug(String(providedSlug)) : newsSlug(String(title));
    if (!slug) return NextResponse.json({ error: 'Invalid slug' }, { status: 400 });

    const now = new Date().toISOString();
    const row = {
      slug,
      title: String(title).trim(),
      excerpt: String(excerpt || content).slice(0, 400).trim(),
      content: String(content).trim(),
      source: '', // No source - real site
      source_url: '',
      category: String(category || 'Industry').trim(),
      published_at: published_at ? new Date(published_at).toISOString() : now,
      iso_date: (published_at ? new Date(published_at) : new Date()).toISOString().slice(0, 10),
      image: image || null,
      ai_summarized: false,
      approved: true,
    };

    const { data, error } = await supabaseAdmin
      .from('news_items')
      .upsert(row, { onConflict: 'slug' })
      .select('slug')
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ success: true, slug: data.slug }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Bad request' }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  if (!(await isAdminAuthorized())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!(await requireCsrf(request))) {
    return NextResponse.json({ error: 'Invalid or missing CSRF token' }, { status: 403 });
  }
  if (!supabaseAdmin) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });

  try {
    const body = await request.json();
    const { slug, title, excerpt, content, category, image, published_at } = body;
    if (!slug) return NextResponse.json({ error: 'slug required' }, { status: 400 });

    const updates: any = {};
    if (title !== undefined) updates.title = String(title).trim();
    if (excerpt !== undefined) updates.excerpt = String(excerpt).slice(0, 400).trim();
    if (content !== undefined) updates.content = String(content).trim();
    if (category !== undefined) updates.category = String(category).trim();
    if (image !== undefined) updates.image = image || null;
    if (published_at !== undefined) {
      updates.published_at = new Date(published_at).toISOString();
      updates.iso_date = new Date(published_at).toISOString().slice(0, 10);
    }
    updates.updated_at = new Date().toISOString();

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from('news_items').update(updates).eq('slug', slug);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ success: true, slug }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Bad request' }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  if (!(await isAdminAuthorized())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!(await requireCsrf(request))) {
    return NextResponse.json({ error: 'Invalid or missing CSRF token' }, { status: 403 });
  }
  if (!supabaseAdmin) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  try {
    const { slug, action } = await request.json();
    if (!slug || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Expected { slug, action: "approve" | "reject" }' }, { status: 400 });
    }

    if (action === 'approve') {
      const { error } = await supabaseAdmin.from('news_items').update({ approved: true }).eq('slug', slug);
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ success: true, slug, approved: true }, { status: 200 });
    }

    const { error } = await supabaseAdmin.from('news_items').delete().eq('slug', slug);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ success: true, slug, rejected: true }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Bad request' }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  if (!(await isAdminAuthorized())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!(await requireCsrf(request))) {
    return NextResponse.json({ error: 'Invalid or missing CSRF token' }, { status: 403 });
  }
  if (!supabaseAdmin) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });

  try {
    const body = await request.json().catch(() => ({}));
    const { slug, all } = body as { slug?: string; all?: boolean };

    if (all) {
      // Delete all news - requested feature
      const { error, count } = await supabaseAdmin.from('news_items').delete().gte('created_at', '1970-01-01').select('slug');
      // Supabase delete with no filter needs a filter; we use gte created_at
      if (error) {
        // fallback: delete in batches
        const { data: allRows } = await supabaseAdmin.from('news_items').select('slug').limit(1000);
        if (allRows) {
          for (const r of allRows) {
            await supabaseAdmin.from('news_items').delete().eq('slug', r.slug);
          }
        }
      }
      return NextResponse.json({ success: true, deletedAll: true }, { status: 200 });
    }

    if (!slug) return NextResponse.json({ error: 'slug required or {all:true}' }, { status: 400 });

    const { error } = await supabaseAdmin.from('news_items').delete().eq('slug', slug);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ success: true, slug }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Bad request' }, { status: 400 });
  }
}
