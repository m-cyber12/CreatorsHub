import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { rateLimit, clientIp } from '@/lib/rateLimit';
import { SITE_URL } from '@/config/site';
import { sendConfirmEmail } from '@/lib/email';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

declare global {
  // eslint-disable-next-line no-var
  var __LOCAL_NEWSLETTER_SUBSCRIBERS:
    | Array<{
        email: string;
        source: string;
        confirmed: boolean;
        confirm_token: string;
        unsub_token: string;
        created_at: string;
      }>
    | undefined;
}

if (!globalThis.__LOCAL_NEWSLETTER_SUBSCRIBERS) {
  globalThis.__LOCAL_NEWSLETTER_SUBSCRIBERS = [];
}

const localSubscribers = globalThis.__LOCAL_NEWSLETTER_SUBSCRIBERS;

export async function POST(request: Request) {
  if (!rateLimit(`newsletter:${clientIp(request)}`, 10, 60_000)) {
    return NextResponse.json(
      { error: 'Too many attempts — please try again later.' },
      { status: 429 }
    );
  }

  try {
    const { email, source, website } = await request.json();

    if (typeof website === 'string' && website.length > 0) {
      return NextResponse.json({ success: true, message: 'Please check your inbox.' }, { status: 201 });
    }

    if (typeof email !== 'string' || !EMAIL_RE.test(email) || email.length > 254) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    const normalized = email.toLowerCase().trim();
    const confirmToken = randomBytes(32).toString('hex');
    const unsubToken = randomBytes(32).toString('hex');
    const confirmUrl = `${SITE_URL}/api/newsletter/confirm?token=${confirmToken}`;

    if (supabaseAdmin) {
      const { error } = await supabaseAdmin.from('newsletter_subscribers').insert([
        {
          email: normalized,
          source: String(source || 'homepage').slice(0, 40),
          confirmed: true, // auto confirm
          confirm_token: confirmToken,
          unsub_token: unsubToken,
        },
      ]);

      if (error && error.code === '23505') {
        return NextResponse.json(
          { success: true, message: 'You are already subscribed to the CreatorAI Hub newsletter!' },
          { status: 200 }
        );
      }
    } else {
      // Record in local fallback store
      localSubscribers.unshift({
        email: normalized,
        source: String(source || 'homepage'),
        confirmed: true,
        confirm_token: confirmToken,
        unsub_token: unsubToken,
        created_at: new Date().toISOString(),
      });
    }

    // Attempt real email sending if RESEND_API_KEY is configured
    await sendConfirmEmail(normalized, confirmUrl);

    return NextResponse.json(
      {
        success: true,
        message: 'Successfully subscribed to CreatorAI Hub Weekly AI Tool Alerts!',
        // Never ship the confirmation token to a production client — anyone
        // subscribed with a fake address could self-confirm without owning
        // the inbox. Kept for local development only.
        ...(process.env.NODE_ENV !== 'production' ? { devConfirmUrl: confirmUrl } : {}),
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
