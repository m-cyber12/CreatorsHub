import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { rateLimit, clientIp } from '@/lib/rateLimit';
import { validateBeaconEvent } from '@/lib/analyticsEvents';

export const dynamic = 'force-dynamic';

/**
 * POST /api/beacon — first-party product-event mirror (P4).
 *
 * Every client track() call lands here as well as in Vercel Analytics.
 * No identifiers are accepted or stored (see validateBeaconEvent), so this
 * needs no consent banner — same standard as /api/search-log.
 *
 * Always resolves successfully from the client's perspective; `stored`
 * tells the truth about persistence for debugging.
 */
export async function POST(request: Request) {
  if (!rateLimit(`beacon:${clientIp(request)}`, 120, 60_000)) {
    return NextResponse.json({ ok: false, stored: false, error: 'Rate limit exceeded.' }, { status: 429 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, stored: false, error: 'Invalid payload.' }, { status: 400 });
  }

  const result = validateBeaconEvent(payload);
  if (!result.ok) {
    return NextResponse.json({ ok: false, stored: false, error: result.error }, { status: 400 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ ok: true, stored: false }, { status: 200 });
  }

  try {
    const { error } = await supabaseAdmin.from('analytics_events').insert([
      {
        event: result.event.event,
        path: result.event.path,
        props: result.event.props,
      },
    ]);
    if (error) {
      console.error('[beacon] insert failed:', error.message);
      return NextResponse.json({ ok: true, stored: false }, { status: 200 });
    }
    return NextResponse.json({ ok: true, stored: true }, { status: 200 });
  } catch (err) {
    console.error('[beacon] insert threw:', err);
    return NextResponse.json({ ok: true, stored: false }, { status: 200 });
  }
}
