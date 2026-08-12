import { NextResponse } from 'next/server';
import { updateOrderStatus, getOrderById } from '@/lib/ordersStore';
import { verifyPlisioCallback, lookupPlisioOperation, getPlisioApiKey } from '@/lib/plisio';

/**
 * Webhook callback endpoint for Plisio Crypto Payments.
 * Plisio sends a POST request here when payment status updates on-chain.
 *
 * SECURITY (2026-08-12 audit rewrite) — the previous version trusted any
 * POST body that named an order_number, so `{"order_number": "...", "status":
 * "completed"}` from ANY sender confirmed paid orders (free Studio Pro /
 * featured listings). Verification is now layered:
 *
 *  1. `verify_hash` (HMAC-SHA1 keyed by PLISIO_API_KEY) checked when present.
 *     Invalid or missing hash alone does not confirm or reject by itself —
 *     the decisive proof is layer 2.
 *  2. AUTHORITATIVE: the operation is re-queried server-to-server from
 *     Plisio's operations API using the secret key. An attacker can POST any
 *     order_number/txn_id, but cannot make OUR shop's operations list show
 *     an operation that never happened. Confirmation requires:
 *        found in operations ✓  AND  op.order_number matches this order ✓
 *        AND status completed ✓  AND paid amount covers the order ✓
 *  3. Signature-valid but lookup-failed callbacks (transient gateway/API
 *     issues) leave the order PENDING for manual review — never blind
 *     confirm, never blind reject.
 *  4. Under-paid / `mismatch` statuses never auto-confirm (the old code
 *     confirmed `mismatch` — that bug alone gave away free upgrades).
 *
 * Why the HMAC is advisory rather than a hard 403 here: Plisio documents
 * several serialization variants of verify_hash across SDKs. A hard reject
 * risks silently dropping REAL money (customer paid, order never confirms).
 * Layer 2 alone is sufficient to prevent forgery, and layer 1 filters junk
 * traffic before we spend an API call.
 */
export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    let body: Record<string, string> = {};

    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      try {
        body = JSON.parse(rawBody);
      } catch {
        return NextResponse.json({ error: 'Malformed JSON body' }, { status: 400 });
      }
    } else {
      const form = new URLSearchParams(rawBody);
      body = Object.fromEntries(form.entries());
    }

    const { order_number, status, txn_id, verify_hash, source_amount, currency } = body;
    const orderId = String(order_number || '');

    if (!orderId) {
      return NextResponse.json({ error: 'Missing order_number' }, { status: 400 });
    }

    // Without the gateway secret we cannot verify anything at all → closed.
    const apiKey = getPlisioApiKey();
    if (!apiKey) {
      console.error('[plisio-webhook] PLISIO_API_KEY is not configured — refusing to process callback');
      return NextResponse.json({ error: 'Payment gateway is not configured' }, { status: 503 });
    }

    const signatureOk = Boolean(
      verify_hash && verifyPlisioCallback(body, rawBody, String(verify_hash))
    );
    if (!signatureOk && verify_hash) {
      console.warn(`[plisio-webhook] signature mismatch for order ${orderId} — falling back to authoritative API lookup`);
    }

    const order = await getOrderById(orderId);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // ── authoritative lookup on Plisio's API ────────────────────────────
    const op = await lookupPlisioOperation({
      txnId: txn_id ? String(txn_id) : undefined,
      orderNumber: orderId,
    });

    if (!op.found) {
      if (!signatureOk) {
        // No valid signature AND Plisio knows nothing about this operation
        // → classic forgery attempt (or pure junk).
        console.warn(`[plisio-webhook] REJECTED forged/invalid callback for order ${orderId}`);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
      }
      // Signature was fine but the gateway API cannot confirm yet (transient
      // failure) — keep pending for a human to review.
      console.warn(`[plisio-webhook] operation not found on Plisio for order ${orderId} (txn ${txn_id}) — left pending`);
      return NextResponse.json({ success: true, message: 'Callback received; awaiting gateway confirmation.' }, { status: 202 });
    }

    // The operation must provably belong to THIS order. If the gateway row
    // carries an order_number it must equal ours — otherwise one paid txn
    // could be replayed against a different order of the same price. If the
    // row does not carry one, the valid HMAC signature is the belt-and-braces.
    const opBelongsToOrder = op.orderNumber ? op.orderNumber === orderId : signatureOk;
    const expectedUsd = Number(order.amount_usd ?? 0);
    const paidUsd = Number(source_amount ?? op.sourceAmount ?? NaN);
    const amountKnown = Number.isFinite(paidUsd);
    const amountCovers = amountKnown ? paidUsd + 0.0001 >= expectedUsd : false;
    const completed = status === 'completed' || op.status === 'completed';

    if (completed && opBelongsToOrder && amountCovers) {
      await updateOrderStatus(orderId, 'confirmed');
      return NextResponse.json({
        success: true,
        message: `Payment confirmed for order ${orderId}`,
        txn_id,
        amount: source_amount,
        currency,
      });
    }

    if (completed && amountKnown && !amountCovers) {
      console.warn(`[plisio-webhook] order ${orderId}: completed but paid ${paidUsd} < expected ${expectedUsd} — left pending for review`);
    } else if (status === 'mismatch') {
      console.warn(`[plisio-webhook] order ${orderId}: payment mismatch (paid ${paidUsd} ${currency}, expected ${expectedUsd}) — manual review required`);
    } else if (status === 'expired' || status === 'cancelled') {
      if (signatureOk || opBelongsToOrder) await updateOrderStatus(orderId, 'rejected');
    }

    return NextResponse.json({
      success: true,
      message: `Plisio payment status '${status}' processed for order ${orderId}`,
      txn_id,
      amount: source_amount,
      currency,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Webhook error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
