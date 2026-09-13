import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { rateLimit, clientIp } from '@/lib/rateLimit';
import { validateQaReport } from '@/lib/qa';

export const dynamic = 'force-dynamic';

// POST /api/qa/report — { post_id, reason, detail? }. Reports feed the admin
// community queue (P4). Always returns success-shaped responses so reporters
// learn nothing about moderation state.
export async function POST(request: Request) {
  if (!rateLimit(`qareport:${clientIp(request)}`, 5, 10 * 60_000)) {
    return NextResponse.json({ error: 'Too many reports — please try again later.' }, { status: 429 });
  }

  try {
    const result = validateQaReport(await request.json());
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Reporting is temporarily unavailable.' }, { status: 503 });
    }

    const { error } = await supabaseAdmin.from('community_reports').insert([result.report]);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ success: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 });
  }
}
