import { NextResponse } from 'next/server';
import { isAdminAuthorized, requireCsrf } from '@/lib/adminAuth';
import { runNewsIngest } from '@/lib/newsIngest';
import { autoTranslateNews } from '@/lib/i18n/translateContent';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

/**
 * v2.8 admin upgrade: run the ingestion pipeline right now from the panel
 * (no waiting for the hourly cron, no needing the CRON_SECRET). Session-based
 * admin auth only.
 */
export async function POST(request: Request) {
  if (!(await isAdminAuthorized())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!(await requireCsrf(request))) {
    return NextResponse.json({ error: 'Invalid or missing CSRF token' }, { status: 403 });
  }
  const result = await runNewsIngest();

  // v3.3: the admin "Ingest now" button translates freshly ingested items
  // into all locales right away, exactly like the hourly cron does
  // (/api/news/refresh). Bounded + best-effort; the on-demand translator on
  // the article page and the daily cron catch anything left over.
  let autoTranslatedFields = 0;
  if (result.insertedNew > 0 && result.items) {
    try {
      autoTranslatedFields = await autoTranslateNews(result.items);
    } catch {
      // Never let translation failures break the ingest response.
    }
  }

  return NextResponse.json({
    ...result,
    autoTranslatedFields,
    refreshedAt: new Date().toISOString(),
  });
}
