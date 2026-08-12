import { NextResponse } from 'next/server';
import { rateLimit, clientIp } from '@/lib/rateLimit';
import { updateOrderTx } from '@/lib/ordersStore';

export async function POST(request: Request) {
  if (!rateLimit(`checkout_verify:${clientIp(request)}`, 20, 60_000)) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a minute.' },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { orderId, txHash } = body;

    if (!orderId || typeof orderId !== 'string') {
      return NextResponse.json({ error: 'Order ID is required.' }, { status: 400 });
    }
    if (!txHash || typeof txHash !== 'string' || txHash.trim().length < 6) {
      return NextResponse.json(
        { error: 'Please enter a valid Transaction Hash / ID (TXID).' },
        { status: 400 }
      );
    }

    const cleanTx = txHash.trim();
    const updated = await updateOrderTx(orderId, cleanTx);

    return NextResponse.json({
      success: true,
      message: 'Payment verification submitted successfully! Our team will confirm within 2 hours.',
      order: updated,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Invalid request payload';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
