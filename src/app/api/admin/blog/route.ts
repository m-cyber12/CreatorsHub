import { NextResponse } from 'next/server';
import { isAdminAuthorized, requireCsrf } from '@/lib/adminAuth';
import {
  getEffectivePosts,
  getBlogOverride,
  saveBlogOverride,
  addBlogOverride,
  deleteBlogOverride,
} from '@/lib/contentOverrides';
import type { BlogPost } from '@/data/posts';

export const dynamic = 'force-dynamic';

const FORBIDDEN = ['slug', '__isNew'];

function sanitize(fields: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(fields)) {
    if (FORBIDDEN.includes(k)) continue;
    if (typeof v === 'string') out[k] = v.slice(0, 60000);
    else out[k] = v;
  }
  return out;
}

/** GET — every post with effective values + overridden fields. */
export async function GET() {
  if (!(await isAdminAuthorized())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const posts = await getEffectivePosts();
  const payload = await Promise.all(
    posts.map(async (post) => {
      const o = await getBlogOverride(post.slug);
      const overriddenFields = o ? Object.keys(o).filter((k) => k !== '__isNew') : [];
      return { ...post, overriddenFields };
    })
  );
  return NextResponse.json({ posts: payload, count: payload.length });
}

/** PUT — save a field patch for one post (merge). */
export async function PUT(request: Request) {
  if (!(await isAdminAuthorized())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!(await requireCsrf(request))) {
    return NextResponse.json({ error: 'Invalid or missing CSRF token' }, { status: 403 });
  }
  const body = (await request.json()) as { slug?: string; fields?: Record<string, unknown> };
  if (!body.slug) return NextResponse.json({ error: 'slug is required' }, { status: 400 });
  const res = await saveBlogOverride(body.slug, sanitize(body.fields ?? {}));
  return NextResponse.json(res, { status: res.ok ? 200 : 500 });
}

/** POST — create a brand-new blog post. */
export async function POST(request: Request) {
  if (!(await isAdminAuthorized())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!(await requireCsrf(request))) {
    return NextResponse.json({ error: 'Invalid or missing CSRF token' }, { status: 403 });
  }
  const body = (await request.json()) as Partial<BlogPost> & { slug?: string };
  if (!body.slug?.trim()) return NextResponse.json({ error: 'slug is required' }, { status: 400 });
  const res = await addBlogOverride({ ...sanitize(body as Record<string, unknown>), slug: body.slug.trim() } as Partial<BlogPost> & { slug: string });
  return NextResponse.json(res, { status: res.ok ? 200 : res.error?.startsWith('A post') ? 409 : 500 });
}

/** DELETE — reset a post to defaults (existing) or remove it (new). */
export async function DELETE(request: Request) {
  if (!(await isAdminAuthorized())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!(await requireCsrf(request))) {
    return NextResponse.json({ error: 'Invalid or missing CSRF token' }, { status: 403 });
  }
  const body = (await request.json()) as { slug?: string };
  if (!body.slug) return NextResponse.json({ error: 'slug is required' }, { status: 400 });
  const res = await deleteBlogOverride(body.slug);
  return NextResponse.json(res, { status: res.ok ? 200 : 500 });
}
