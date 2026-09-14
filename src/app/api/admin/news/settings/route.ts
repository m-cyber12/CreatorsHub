import { NextResponse } from 'next/server';
import { isAdminAuthorized, requireCsrf } from '@/lib/adminAuth';
import { isNewsEnabled, setNewsEnabled } from '@/lib/newsSettings';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!(await isAdminAuthorized())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const enabled = await isNewsEnabled();
  return NextResponse.json({ enabled }, { status: 200 });
}

async function handleToggle(request: Request) {
  if (!(await isAdminAuthorized())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!(await requireCsrf(request))) {
    return NextResponse.json({ error: 'Invalid or missing CSRF token' }, { status: 403 });
  }
  try {
    const { enabled } = await request.json();
    if (typeof enabled !== 'boolean') {
      return NextResponse.json({ error: 'enabled boolean required' }, { status: 400 });
    }
    const res = await setNewsEnabled(enabled);
    if (!res.ok) return NextResponse.json({ error: res.error }, { status: 500 });
    return NextResponse.json({ success: true, enabled }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Bad request' }, { status: 400 });
  }
}

export async function POST(request: Request) {
  return handleToggle(request);
}

export async function PUT(request: Request) {
  return handleToggle(request);
}
