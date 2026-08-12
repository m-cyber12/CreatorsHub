/**
 * Plisio Crypto Payment Gateway Client for CreatorAI Hub
 * Documentation: https://plisio.net/documentation
 *
 * SECURITY NOTES (2026-08-12 audit):
 *  - The previous version carried a hard-coded fallback API key committed to
 *    the public repo. That is a live credential leak: anyone could create or
 *    inspect invoices for the shop. The key MUST be rotated in the Plisio
 *    dashboard, and the new key only ever lives in environment variables.
 *    No fallback here anymore — without PLISIO_API_KEY the checkout API
 *    fails closed instead of silently using a leaked key.
 *  - Callback (webhook) verification now lives in verifyPlisioCallback()
 *    below and is enforced by the plisio-webhook route.
 */

import { createHmac, timingSafeEqual } from 'crypto';

export interface PlisioInvoiceRequest {
  orderName: string;
  orderNumber: string;
  amountUsd: number;
  currency?: string; // e.g. 'USDT_TRX', 'USDT_TON', 'TON', 'BTC'
  email: string;
  callbackUrl: string;
  successUrl: string;
  failUrl: string;
}

export interface PlisioInvoiceResponse {
  status: 'success' | 'error';
  data?: {
    txn_id: string;
    invoice_url: string;
    invoice_total_sum: string;
    currency: string;
    wallet_hash: string;
    qr_code: string;
    status: string;
  };
  message?: string;
}

export function getPlisioApiKey(): string | null {
  const key = process.env.PLISIO_API_KEY?.trim();
  return key || null;
}

export async function createPlisioInvoice(req: PlisioInvoiceRequest): Promise<PlisioInvoiceResponse> {
  const apiKey = getPlisioApiKey();
  if (!apiKey) {
    return { status: 'error', message: 'PLISIO_API_KEY is not configured on the server.' };
  }

  const params = new URLSearchParams({
    api_key: apiKey,
    order_name: req.orderName,
    order_number: req.orderNumber,
    source_amount: req.amountUsd.toString(),
    source_currency: 'USD',
    currency: req.currency || 'USDT_TRX',
    email: req.email,
    callback_url: req.callbackUrl,
    success_url: req.successUrl,
    fail_url: req.failUrl,
  });

  try {
    const res = await fetch(`https://api.plisio.net/api/v1/invoices/new?${params.toString()}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(15_000),
    });

    const data = await res.json();
    return data as PlisioInvoiceResponse;
  } catch (err: unknown) {
    return {
      status: 'error',
      message: err instanceof Error ? err.message : 'Failed to connect to Plisio API',
    };
  }
}

/* ------------------------------------------------------------------ */
/* Callback verification                                              */
/* ------------------------------------------------------------------ */

/**
 * Plisio signs every callback with `verify_hash` = HMAC-SHA1 keyed by your
 * SECRET_KEY over the serialized POST fields (excluding verify_hash itself).
 * The exact serialization differs across Plisio examples (raw query-string
 * order vs. key-sorted JSON), so we accept any of the documented candidate
 * serializations — an attacker cannot produce ANY of them without the key.
 *
 * Defence in depth: even when the hash matches, the webhook route then
 * re-queries the Plisio operations API server-to-server before confirming
 * an order (see lookupPlisioOperation), so a guessed or replayed hash for a
 * non-existent transaction still fails.
 */
export function verifyPlisioCallback(
  fields: Record<string, string>,
  rawBody: string,
  providedHash: string
): boolean {
  const apiKey = getPlisioApiKey();
  if (!apiKey || !providedHash) return false;

  const rest: Record<string, string> = { ...fields };
  delete rest.verify_hash;

  const sortedJson = JSON.stringify(
    Object.keys(rest)
      .sort()
      .reduce<Record<string, string>>((acc, k) => {
        acc[k] = rest[k];
        return acc;
      }, {})
  );

  // Raw body with the verify_hash field stripped out (order preserved).
  const rawWithoutHash = rawBody
    .split('&')
    .filter((pair) => !pair.startsWith('verify_hash='))
    .join('&');

  const candidates = [sortedJson, rawWithoutHash];
  for (const candidate of candidates) {
    const digest = createHmac('sha1', apiKey).update(candidate).digest('hex');
    const a = Buffer.from(digest, 'utf8');
    const b = Buffer.from(String(providedHash).trim(), 'utf8');
    if (a.length === b.length && timingSafeEqual(a, b)) return true;
  }
  return false;
}

export interface PlisioOperationInfo {
  found: boolean;
  status?: string;
  /** Amount paid in the source currency of the invoice (USD when source_currency=USD). */
  sourceAmount?: number;
  currency?: string;
  /**
   * The order_number recorded on OUR invoice at the gateway — the route
   * requires this to equal the callback's order_number before confirming,
   * so one paid transaction can never confirm two different orders.
   */
  orderNumber?: string;
}

/**
 * Authoritative server-to-server confirmation: asks Plisio whether an
 * invoice/transaction for this order really exists and what its state is.
 * A forged webhook can invent any order_number/txn_id — it cannot make
 * Plisio's own API confirm an operation that never happened.
 */
export async function lookupPlisioOperation(params: {
  txnId?: string;
  orderNumber?: string;
}): Promise<PlisioOperationInfo> {
  const apiKey = getPlisioApiKey();
  if (!apiKey) return { found: false };
  if (!params.txnId && !params.orderNumber) return { found: false };

  try {
    const query = new URLSearchParams({ api_key: apiKey, page_size: '50' });
    const res = await fetch(`https://api.plisio.net/api/v1/operations?${query.toString()}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return { found: false };
    const payload = (await res.json()) as {
      status?: string;
      data?: Array<Record<string, unknown>> | { operations?: Array<Record<string, unknown>> };
    };
    const rows = Array.isArray(payload.data)
      ? payload.data
      : Array.isArray(payload.data?.operations)
        ? payload.data!.operations!
        : [];

    for (const row of rows) {
      const txnId = String(row.txn_id ?? '');
      const orderNumber = String(row.order_number ?? '');
      const txnMatch = params.txnId && txnId === params.txnId;
      const orderMatch = params.orderNumber && orderNumber === params.orderNumber;
      if (txnMatch || orderMatch) {
        return {
          found: true,
          status: String(row.status ?? ''),
          sourceAmount: Number(row.source_amount ?? row.amount ?? NaN),
          currency: String(row.source_currency ?? row.currency ?? ''),
          orderNumber: orderNumber || undefined,
        };
      }
    }
    return { found: false };
  } catch {
    return { found: false };
  }
}
