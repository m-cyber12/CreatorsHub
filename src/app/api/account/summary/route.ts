import { NextResponse } from 'next/server';
import { getAllOrders } from '@/lib/ordersStore';
import { getAllSubmissions } from '@/lib/submissionsStore';
import { getEffectiveTools } from '@/lib/contentOverrides';
import { getDailyQuota } from '@/lib/quotaStore';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { SITE_URL } from '@/config/site';

export const dynamic = 'force-dynamic';

/**
 * Account summary — AUTHENTICATED ONLY (2026-08-12 audit).
 *
 * Before: any caller could pass ?email=someone@else.com and read that
 * person's orders, submissions and founder claims — a personal-data leak.
 * Now the email comes exclusively from a verified Supabase session token;
 * there is no query-string identity at all.
 */
export async function GET(request: Request) {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '').trim();
  if (!token || !supabaseAdmin) {
    return NextResponse.json({ error: 'Sign in is required.' }, { status: 401 });
  }

  let email = '';
  let userId = '';
  try {
    const { data } = await supabaseAdmin.auth.getUser(token);
    if (!data.user?.email) {
      return NextResponse.json({ error: 'Sign in is required.' }, { status: 401 });
    }
    email = data.user.email.toLowerCase();
    userId = data.user.id;
  } catch {
    return NextResponse.json({ error: 'Session could not be verified.' }, { status: 401 });
  }

  const allOrders = await getAllOrders();
  const allSubmissions = await getAllSubmissions();
  const effectiveTools = await getEffectiveTools();

  const userOrders = allOrders.filter((o) => o.founder_email.toLowerCase() === email);
  const userSubmissions = allSubmissions.filter((s) => s.founder_email.toLowerCase() === email);

  const activeStudioOrder = userOrders.find(
    (o) => (o.plan === 'studio-monthly' || o.plan === 'studio-yearly') && o.status === 'confirmed'
  );

  const isStudioPro = Boolean(activeStudioOrder);
  const quota = await getDailyQuota(`user:${userId}`, isStudioPro);

  const claimedTools = effectiveTools.filter(
    (t) =>
      userSubmissions.some((s) => s.tool_name.toLowerCase() === t.name.toLowerCase()) ||
      userOrders.some((o) => o.tool_name.toLowerCase() === t.name.toLowerCase())
  );

  return NextResponse.json({
    email,
    isStudioPro,
    studioPlan: activeStudioOrder ? activeStudioOrder.plan : 'free',
    dailyQuota: {
      limit: quota.limit,
      used: quota.used,
      remaining: quota.remaining,
    },
    orders: userOrders,
    submissions: userSubmissions,
    claimedTools: claimedTools.map((t) => ({
      name: t.name,
      slug: t.slug,
      category: t.category,
      verificationLevel: t.verificationLevel,
      isFeatured: t.isFeatured,
      hasFounderBadge: t.hasFounderBadge,
      badgeSnippet: `<a href="${SITE_URL}/tool/${t.slug}" target="_blank" rel="noopener">\n  <img src="${SITE_URL}/badge/${t.slug}.svg" alt="Featured on CreatorAI Hub" />\n</a>`,
    })),
  });
}
