import { NextResponse } from 'next/server';
import { isAdminAuthorized, requireCsrf } from '@/lib/adminAuth';
import {
  getEffectiveTools,
  getToolOverride,
  saveToolOverride,
  addToolOverride,
  deleteToolOverride,
} from '@/lib/contentOverrides';
import type { Tool } from '@/data/tools';

export const dynamic = 'force-dynamic';

/** Fields that should never be written from the panel (computed/structural). */
const FORBIDDEN = ['id', 'slug', '__isNew', 'scores', 'verdict', 'evidenceUrls', 'pros', 'cons', 'keyCapabilities', 'testedAt', 'planTested'];

function sanitize(fields: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(fields)) {
    if (FORBIDDEN.includes(k)) continue;
    if (typeof v === 'string') out[k] = v.slice(0, 12000);
    else out[k] = v;
  }
  return out;
}

/** GET — every tool with its effective (overridden) values + which fields are overridden. */
export async function GET() {
  if (!(await isAdminAuthorized())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const tools = await getEffectiveTools();
  const payload = await Promise.all(
    tools.map(async (tool) => {
      const o = await getToolOverride(tool.slug);
      const overriddenFields = o ? Object.keys(o).filter((k) => k !== '__isNew') : [];
      return { ...tool, overriddenFields };
    })
  );
  return NextResponse.json({ tools: payload, count: payload.length });
}

/** PUT — save a field patch for one tool (merge into existing override). */
export async function PUT(request: Request) {
  if (!(await isAdminAuthorized())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!(await requireCsrf(request))) {
    return NextResponse.json({ error: 'Invalid or missing CSRF token' }, { status: 403 });
  }
  const body = (await request.json()) as { slug?: string; fields?: Record<string, unknown> };
  if (!body.slug) return NextResponse.json({ error: 'slug is required' }, { status: 400 });
  const res = await saveToolOverride(body.slug, sanitize(body.fields ?? {}));
  return NextResponse.json(res, { status: res.ok ? 200 : 500 });
}

/** POST — create a brand-new tool. */
export async function POST(request: Request) {
  if (!(await isAdminAuthorized())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!(await requireCsrf(request))) {
    return NextResponse.json({ error: 'Invalid or missing CSRF token' }, { status: 403 });
  }
  const body = (await request.json()) as Partial<Tool> & { slug?: string };
  if (!body.slug?.trim()) return NextResponse.json({ error: 'slug is required' }, { status: 400 });
  const res = await addToolOverride({ ...sanitize(body as Record<string, unknown>), slug: body.slug.trim() } as Partial<Tool> & { slug: string });
  return NextResponse.json(res, { status: res.ok ? 200 : res.error?.startsWith('A tool') ? 409 : 500 });
}

/** DELETE — reset a tool to defaults (existing) or remove it (new). */
export async function DELETE(request: Request) {
  if (!(await isAdminAuthorized())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!(await requireCsrf(request))) {
    return NextResponse.json({ error: 'Invalid or missing CSRF token' }, { status: 403 });
  }
  const body = (await request.json()) as { slug?: string };
  if (!body.slug) return NextResponse.json({ error: 'slug is required' }, { status: 400 });
  const res = await deleteToolOverride(body.slug);
  return NextResponse.json(res, { status: res.ok ? 200 : 500 });
}
