import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { rateLimit, clientIp } from '@/lib/rateLimit';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(request: Request) {
  if (!rateLimit(`newsletter:${clientIp(request)}`, 5, 10 * 60_000)) {
    return NextResponse.json({ error: 'Too many attempts — please try again later.' }, { status: 429 });
  }
  try {
    const { email, source } = await request.json();
    if (typeof email !== 'string' || !EMAIL_RE.test(email) || email.length > 254) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }
    if (!supabase) {
      return NextResponse.json({ success: true, message: 'You are on the list! (Connect Supabase to persist subscribers.)' }, { status: 201 });
    }
    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert([{ email: email.toLowerCase(), source: String(source || 'homepage').slice(0, 40) }]);
    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ success: true, message: 'You are already subscribed — see you in the next issue!' }, { status: 200 });
      }
      return NextResponse.json({ error: 'Could not subscribe right now, please try again.' }, { status: 500 });
    }
    return NextResponse.json({ success: true, message: 'You are in! Welcome to the founding 500 🎉' }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
