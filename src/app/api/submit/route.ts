import { NextResponse } from 'next/server';
import { rateLimit, clientIp } from '@/lib/rateLimit';
import { CATEGORIES } from '@/data/tools';
import { createSubmission } from '@/lib/submissionsStore';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const URL_RE = /^https?:\/\/[^\s]+\.[^\s]{2,}$/i;

export async function POST(request: Request) {
  if (!rateLimit(`submit:${clientIp(request)}`, 10, 60_000)) {
    return NextResponse.json(
      { error: 'Too many submissions — please try again in a few minutes.' },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { name, url, tagline, category, pricing, founderEmail, willAddBadge } = body;

    // validation
    if (!name || typeof name !== 'string' || name.trim().length < 2 || name.length > 60) {
      return NextResponse.json({ error: 'Tool name must be 2-60 characters.' }, { status: 400 });
    }
    if (!url || typeof url !== 'string' || !URL_RE.test(url)) {
      return NextResponse.json({ error: 'Please provide a valid http(s) URL.' }, { status: 400 });
    }
    if (!tagline || typeof tagline !== 'string' || tagline.trim().length < 5 || tagline.length > 90) {
      return NextResponse.json({ error: 'Tagline must be 5-90 characters.' }, { status: 400 });
    }
    if (!founderEmail || typeof founderEmail !== 'string' || !EMAIL_RE.test(founderEmail)) {
      return NextResponse.json({ error: 'Please provide a valid contact email.' }, { status: 400 });
    }
    const safeCategory = (CATEGORIES as readonly string[]).includes(category)
      ? category
      : 'Video Editing & VFX';
    const safePricing = ['Free', 'Freemium', 'Paid', 'Free Trial'].includes(pricing)
      ? pricing
      : 'Freemium';

    const submission = await createSubmission({
      tool_name: name.trim(),
      website_url: url.trim(),
      tagline: tagline.trim(),
      category: safeCategory,
      pricing: safePricing,
      founder_email: founderEmail.trim().toLowerCase(),
      will_add_badge: !!willAddBadge,
      status: 'pending',
    });

    return NextResponse.json(
      { success: true, message: 'Tool submitted successfully!', data: submission },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 });
  }
}
