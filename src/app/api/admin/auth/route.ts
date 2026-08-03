import { NextResponse } from 'next/server';
import { rateLimit, clientIp } from '@/lib/rateLimit';

export async function POST(request: Request) {
  if (!rateLimit(`adminauth:${clientIp(request)}`, 5, 15 * 60_000)) {
    return NextResponse.json({ error: 'Too many attempts. Try again in 15 minutes.' }, { status: 429 });
  }
  try {
    const { password } = await request.json();
    const expected = process.env.ADMIN_PASSWORD;
    const sessionToken = process.env.ADMIN_SESSION_TOKEN || expected || '';

    if (!expected) {
      return NextResponse.json(
        { error: 'ADMIN_PASSWORD is not configured on the server. Set it in Vercel → Settings → Environment Variables.' },
        { status: 503 }
      );
    }

    if (typeof password === 'string' && password === expected) {
      const response = NextResponse.json({ success: true }, { status: 200 });
      response.cookies.set('creatorai_admin_session', sessionToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 8,
        path: '/',
      });
      return response;
    }
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
