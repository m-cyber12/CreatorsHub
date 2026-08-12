import { NextResponse } from 'next/server';
import { isAdminAuthorized, requireCsrf } from '@/lib/adminAuth';
import { syncAll, writeSnapshots } from '@/lib/i18n/translateContent';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

/**
 * Admin "Translate now" (v3.5): runs the same incremental translation sync as
 * the daily cron, capped so the serverless window is respected. Used from the
 * Translation tab — no CRON_SECRET or GitHub action needed.
 */
export async function POST(request: Request) {
  if (!(await isAdminAuthorized())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!(await requireCsrf(request))) {
    return NextResponse.json({ error: 'Invalid or missing CSRF token' }, { status: 403 });
  }
  try {
    const body = await request.json().catch(() => ({}));
    const limit = Math.min(parseInt(String(body?.limit ?? '10'), 10) || 10, 40);
    const stats = await syncAll({ maxPerLocale: limit });
    return NextResponse.json({ ...stats, ranAt: new Date().toISOString() });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Translation failed', ranAt: new Date().toISOString() },
      { status: 500 }
    );
  }
}
