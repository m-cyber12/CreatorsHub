import { NextResponse } from 'next/server';
import { isAdminAuthorized, requireCsrf } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

/**
 * Admin image upload (v3.5).
 *
 * Uploads an image into the public Supabase Storage bucket `tool-images` under
 * `{slug}/{timestamp}.{ext}` and returns the public URL to paste into the
 * tool's Logo / Cover fields.
 *
 * Setup once (one-time):
 *   supabase storage buckets create tool-images --public   (or in dashboard)
 * Requires SUPABASE_SERVICE_ROLE_KEY (already needed for the panel to write).
 * If storage isn't configured, returns a graceful error — the panel still
 * works with plain image URLs.
 */

const BUCKET = 'tool-images';

export async function POST(request: Request) {
  if (!(await isAdminAuthorized())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!(await requireCsrf(request))) {
    return NextResponse.json({ error: 'Invalid or missing CSRF token' }, { status: 403 });
  }

  const ctype = request.headers.get('content-type') ?? '';
  if (!ctype.includes('multipart/form-data')) {
    return NextResponse.json(
      {
        ok: false,
        error:
          'Expected multipart/form-data (got ' + ctype.split(';')[0] + '). Upload from the admin panel — do not set Content-Type manually on FormData.',
      },
      { status: 400 }
    );
  }

  if (!supabaseAdmin) {
    return NextResponse.json(
      { ok: false, error: 'SUPABASE_SERVICE_ROLE_KEY is not configured — paste an image URL instead.' },
      { status: 200 }
    );
  }

  let slug = '';
  let file: File | null = null;
  try {
    const form = await request.formData();
    slug = String(form.get('slug') ?? '').trim().replace(/[^a-z0-9-]+/g, '-');
    file = form.get('file') as File | null;
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: 'Invalid form data: ' + (e instanceof Error ? e.message : 'could not parse') },
      { status: 400 }
    );
  }

  if (!slug || !file || file.size === 0) {
    return NextResponse.json({ ok: false, error: 'slug and file are required' }, { status: 400 });
  }
  // v3.5: the same endpoint also accepts videos for the hover preview
  // (previewVideoUrl). Images: 4 MB cap. Videos: 25 MB cap — note Vercel
  // Hobby limits request bodies to ~4.5 MB, so large videos should be hosted
  // elsewhere and pasted as a URL.
  const isVideo = (file.type || '').startsWith('video/');
  const MAX = isVideo ? 25 * 1024 * 1024 : 4 * 1024 * 1024;
  if (file.size > MAX) {
    return NextResponse.json(
      { ok: false, error: `File is too large (max ${isVideo ? '25 MB' : '4 MB'})` },
      { status: 400 }
    );
  }

  const ext = (file.name.split('.').pop() || (isVideo ? 'mp4' : 'png')).toLowerCase().replace(/[^a-z0-9]/g, '');
  const imgExts = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'avif'];
  const vidExts = ['mp4', 'webm', 'mov', 'ogv', 'm4v'];
  const safeExt = isVideo
    ? (vidExts.includes(ext) ? ext : 'mp4')
    : (imgExts.includes(ext) ? ext : 'png');
  const path = `${slug}/${Date.now()}.${safeExt}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  const { error } = await supabaseAdmin.storage.from(BUCKET).upload(path, bytes, {
    contentType: file.type || (isVideo ? 'video/mp4' : 'image/png'),
    upsert: false,
  });
  if (error) {
    const hint = error.message?.includes('bucket') ? 'Bucket does not exist — create a public bucket named `tool-images`.' : error.message;
    return NextResponse.json({ ok: false, error: `Upload failed: ${hint}` }, { status: 500 });
  }

  const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);
  return NextResponse.json({ ok: true, url: data.publicUrl, path });
}
