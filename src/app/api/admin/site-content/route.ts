import { NextResponse } from 'next/server';
import { isAdminAuthorized, requireCsrf } from '@/lib/adminAuth';
import { getAdminSiteContent, saveSiteContent, DEFAULT_CONTENT, type SiteContent } from '@/lib/siteContent';

/**
 * Admin API for the Site Content / Preview tab.
 *
 *  GET  /api/admin/site-content — effective content (overrides + defaults)
 *  PUT  /api/admin/site-content — save edited content (service-role write)
 *
 * The values are rendered by the public pages immediately after saving.
 */
export const dynamic = 'force-dynamic';

export async function GET() {
  if (!(await isAdminAuthorized())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const effective = await getAdminSiteContent(true);
  return NextResponse.json({ defaults: DEFAULT_CONTENT, effective });
}

export async function PUT(request: Request) {
  if (!(await isAdminAuthorized())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!(await requireCsrf(request))) {
    return NextResponse.json({ error: 'Invalid or missing CSRF token' }, { status: 403 });
  }

  let body: Partial<SiteContent>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Expected an object of content values' }, { status: 400 });
  }

  const res = await saveSiteContent(body);
  if (!res.ok) return NextResponse.json({ error: res.error }, { status: 400 });
  return NextResponse.json({ success: true, saved: Object.keys(body).filter((k) => k in DEFAULT_CONTENT).length });
}
