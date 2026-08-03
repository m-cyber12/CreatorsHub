import { NextResponse } from 'next/server';
import { rateLimit, clientIp } from '@/lib/rateLimit';

// Server-side admin authentication.
// Set ADMIN_PASSWORD in Vercel env vars (NOT NEXT_PUBLIC_* — it must stay server-only).
export async function POST(request: Request) {
  if (!rateLimit(`adminauth:${clientIp(request)}`, 5, 15 * 60_000)) {
    return NextResponse.json({ error: 'Too many attempts. Try again in 15 minutes.' }, { status: 429 });
  }
  try {
    const { password } = await request.json();
    const expected = process.env.ADMIN_PASSWORD;
    if (!expected) {
      return NextResponse.json(
        { error: 'ADMIN_PASSWORD is not configured on the server. Set it in Vercel → Settings → Environment Variables.' },
        { status: 503 }
      );
    }
    if (typeof password === 'string' && password === expected) {
      return NextResponse.json({ success: true }, { status: 200 });
    }
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
