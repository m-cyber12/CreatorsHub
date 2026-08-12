import { NextResponse } from 'next/server';
import { rateLimit, clientIp } from '@/lib/rateLimit';
import { PAYMENT_CONFIG } from '@/config/payments';
import { createOrder } from '@/lib/ordersStore';
import { createSubmission } from '@/lib/submissionsStore';
import { createPlisioInvoice } from '@/lib/plisio';
import { SITE_URL } from '@/config/site';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(request: Request) {
  if (!rateLimit(`checkout_order:${clientIp(request)}`, 25, 60_000)) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a minute.' },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const {
      name = 'Submission Order',
      url = 'https://creatorsaicenter.vercel.app',
      tagline = '',
      category = 'AI Studio Membership',
      pricing = 'Paid',
      founderEmail,
      plan = 'free',
      cryptoCurrency = 'USDT-TRC20',
    } = body;

    if (!founderEmail || typeof founderEmail !== 'string' || !EMAIL_RE.test(founderEmail)) {
      return NextResponse.json({ error: 'Valid email address is required.' }, { status: 400 });
    }

    let planName = 'Standard Listing';
    let planId = 'free';
    let amountUsd = 0;
    let isFeatured = false;
    let featuredUntil: string | null = null;

    if (plan === 'studio-monthly') {
      planId = 'studio-monthly';
      planName = 'Studio Pro Monthly';
      amountUsd = PAYMENT_CONFIG.studioPlans.monthly.priceUsd;
    } else if (plan === 'studio-yearly') {
      planId = 'studio-yearly';
      planName = 'Studio Pro Annual';
      amountUsd = PAYMENT_CONFIG.studioPlans.yearly.priceUsd;
    } else if (plan === 'featured') {
      planId = 'featured';
      planName = PAYMENT_CONFIG.plans.featured.name;
      amountUsd = PAYMENT_CONFIG.plans.featured.priceUsd;
      isFeatured = true;
      featuredUntil = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(); // 6 Months
    } else if (plan === 'fast-track' || plan === 'fastTrack') {
      planId = 'fast-track';
      planName = PAYMENT_CONFIG.plans.fastTrack.name;
      amountUsd = PAYMENT_CONFIG.plans.fastTrack.priceUsd;
    } else {
      planId = 'free';
      planName = PAYMENT_CONFIG.plans.free.name;
      amountUsd = 0;
    }

    const isFree = amountUsd === 0;
    const isTrc20 = cryptoCurrency === 'USDT-TRC20';
    const isTon = cryptoCurrency.includes('TON');
    const walletAddress = isTrc20
      ? PAYMENT_CONFIG.trc20WalletAddress
      : PAYMENT_CONFIG.tonWalletAddress;

    // Deep link for Tonkeeper
    const tonkeeperDeepLink = isTon
      ? `ton://transfer/${walletAddress}?text=Order-${name.trim().slice(0, 12)}`
      : '';

    const order = await createOrder({
      tool_name: name.trim(),
      website_url: url.trim(),
      tagline: tagline.trim() || planName,
      category,
      pricing,
      founder_email: founderEmail.trim().toLowerCase(),
      plan: planId,
      amount_usd: amountUsd,
      crypto_currency: cryptoCurrency,
      wallet_address: walletAddress,
      status: isFree ? 'confirmed' : 'pending',
      is_featured: isFeatured,
      featured_until: featuredUntil,
    });

    // Generate Plisio invoice if paid plan
    let plisioInvoiceUrl: string | null = null;
    if (!isFree) {
      let plisioCurrency = 'USDT_TRX';
      if (cryptoCurrency === 'USDT-TON') plisioCurrency = 'USDT_TON';
      else if (cryptoCurrency === 'TON') plisioCurrency = 'TON';
      else if (cryptoCurrency === 'USDT-TRC20') plisioCurrency = 'USDT_TRX';

      const plisioRes = await createPlisioInvoice({
        orderName: `${planName} - ${name.trim()}`,
        orderNumber: order.id,
        amountUsd,
        currency: plisioCurrency,
        email: founderEmail.trim().toLowerCase(),
        callbackUrl: `${SITE_URL}/api/checkout/plisio-webhook`,
        successUrl: `${SITE_URL}/account?success=true`,
        failUrl: `${SITE_URL}/account?canceled=true`,
      });

      if (plisioRes.status === 'success' && plisioRes.data?.invoice_url) {
        plisioInvoiceUrl = plisioRes.data.invoice_url;
      }
    }

    // Register submission if tool submission
    if (!planId.startsWith('studio-')) {
      await createSubmission({
        tool_name: name.trim(),
        website_url: url.trim(),
        tagline: tagline.trim(),
        category,
        pricing,
        founder_email: founderEmail.trim().toLowerCase(),
        will_add_badge: true,
        status: isFree ? 'pending' : 'pending_payment',
      });
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        toolName: name.trim(),
        plan: planId,
        planName,
        amountUsd,
        cryptoCurrency,
        walletAddress,
        tonkeeperDeepLink,
        plisioInvoiceUrl,
        status: order.status,
        isFree,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Invalid request payload';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
