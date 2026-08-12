import { NextResponse } from 'next/server';
import { isAdminAuthorized, requireCsrf } from '@/lib/adminAuth';
import { getDeals, addDeal, updateDeal, deleteDeal, type Deal } from '@/lib/deals';

export const dynamic = 'force-dynamic';

/** GET — all deals. */
export async function GET() {
  if (!(await isAdminAuthorized())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json({ deals: await getDeals() });
}

/** POST — add a deal. */
export async function POST(request: Request) {
  if (!(await isAdminAuthorized())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!(await requireCsrf(request))) {
    return NextResponse.json({ error: 'Invalid or missing CSRF token' }, { status: 403 });
  }
  const body = (await request.json()) as Partial<Deal>;
  if (!body.title?.trim()) return NextResponse.json({ error: 'title is required' }, { status: 400 });
  const res = await addDeal({
    title: String(body.title).slice(0, 200),
    toolSlug: body.toolSlug ? String(body.toolSlug).trim() : undefined,
    code: body.code ? String(body.code).slice(0, 80) : undefined,
    discount: body.discount ? String(body.discount).slice(0, 120) : undefined,
    url: body.url ? String(body.url).slice(0, 1000) : undefined,
    description: body.description ? String(body.description).slice(0, 2000) : undefined,
    enabled: body.enabled !== false,
  });
  return NextResponse.json(res, { status: res.ok ? 200 : 500 });
}

/** PUT — update a deal. */
export async function PUT(request: Request) {
  if (!(await isAdminAuthorized())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!(await requireCsrf(request))) {
    return NextResponse.json({ error: 'Invalid or missing CSRF token' }, { status: 403 });
  }
  const body = (await request.json()) as { id?: string; fields?: Partial<Deal> };
  if (!body.id) return NextResponse.json({ error: 'id is required' }, { status: 400 });
  const res = await updateDeal(body.id, body.fields ?? {});
  return NextResponse.json(res, { status: res.ok ? 200 : 500 });
}

/** DELETE — remove a deal. */
export async function DELETE(request: Request) {
  if (!(await isAdminAuthorized())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!(await requireCsrf(request))) {
    return NextResponse.json({ error: 'Invalid or missing CSRF token' }, { status: 403 });
  }
  const body = (await request.json()) as { id?: string };
  if (!body.id) return NextResponse.json({ error: 'id is required' }, { status: 400 });
  const res = await deleteDeal(body.id);
  return NextResponse.json(res, { status: res.ok ? 200 : 500 });
}
