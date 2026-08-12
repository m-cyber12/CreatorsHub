import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createHmac } from 'crypto';

/**
 * Payment-webhook security tests (2026-08-12 audit).
 *
 * The gateway callback used to confirm ANY order for ANY sender who knew or
 * guessed an order_number. These tests pin the hardened behaviour:
 *   1. a valid HMAC-SHA1 `verify_hash` is REQUIRED (fail-closed);
 *   2. wrong / missing keys never verify;
 *   3. the operations-lookup parser accepts Plisio's real response shapes and
 *      reports {found:false} — never throws — when the API errors out.
 */

process.env.PLISIO_API_KEY = 'testsecret_testsecret_testsecret';

// eslint-disable-next-line import/first
import { verifyPlisioCallback, lookupPlisioOperation } from '@/lib/plisio';

const SECRET = process.env.PLISIO_API_KEY!;

const fields: Record<string, string> = {
  order_number: 'ord_1786500000_abcde',
  status: 'completed',
  txn_id: '5f6a7b8c9d',
  source_amount: '4.99',
  currency: 'USDT_TRX',
};

const sortedJson = (obj: Record<string, string>) =>
  JSON.stringify(
    Object.keys(obj)
      .sort()
      .reduce<Record<string, string>>((acc, k) => {
        acc[k] = obj[k];
        return acc;
      }, {})
  );

describe('verifyPlisioCallback', () => {
  it('accepts a callback signed over the key-sorted JSON', () => {
    const body = { ...fields };
    const sig = createHmac('sha1', SECRET).update(sortedJson(body)).digest('hex');
    const raw = new URLSearchParams({ ...body, verify_hash: sig }).toString();
    expect(verifyPlisioCallback({ ...body, verify_hash: sig }, raw, sig)).toBe(true);
  });

  it('accepts a callback signed over the raw body (order preserved)', () => {
    const rawWithoutSig = new URLSearchParams(fields).toString();
    const sig = createHmac('sha1', SECRET).update(rawWithoutSig).digest('hex');
    const raw = `${rawWithoutSig}&verify_hash=${sig}`;
    expect(verifyPlisioCallback({ ...fields, verify_hash: sig }, raw, sig)).toBe(true);
  });

  it('rejects a forged callback (no access to the key)', () => {
    const attackerSig = createHmac('sha1', 'wrong-key').update(sortedJson(fields)).digest('hex');
    const raw = new URLSearchParams({ ...fields, verify_hash: attackerSig }).toString();
    expect(verifyPlisioCallback({ ...fields, verify_hash: attackerSig }, raw, attackerSig)).toBe(false);
  });

  it('rejects an empty / missing signature', () => {
    expect(verifyPlisioCallback(fields, '', '')).toBe(false);
    expect(verifyPlisioCallback(fields, 'order_number=x', 'not-a-hash')).toBe(false);
  });

  it('rejects when the body was tampered with after signing', () => {
    const sig = createHmac('sha1', SECRET).update(sortedJson(fields)).digest('hex');
    const tampered = { ...fields, source_amount: '0.01', verify_hash: sig };
    const raw = new URLSearchParams(tampered).toString();
    expect(verifyPlisioCallback(tampered, raw, sig)).toBe(false);
  });
});

describe('lookupPlisioOperation', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('finds a matching txn in a paged operations list', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({
          status: 'success',
          data: [
            { txn_id: 'abc', order_number: 'ord_other', status: 'completed' },
            {
              txn_id: '5f6a7b8c9d',
              order_number: 'ord_1786500000_abcde',
              status: 'completed',
              source_amount: '4.99',
            },
          ],
        }),
      })) as unknown as typeof fetch
    );
    const op = await lookupPlisioOperation({ txnId: '5f6a7b8c9d' });
    expect(op.found).toBe(true);
    expect(op.sourceAmount).toBeCloseTo(4.99);
  });

  it('returns found=false for a txn Plisio has never seen', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({ status: 'success', data: [] }),
      })) as unknown as typeof fetch
    );
    expect((await lookupPlisioOperation({ txnId: 'forged' })).found).toBe(false);
  });

  it('fails closed (found=false, no throw) when the gateway API errors', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: false, json: async () => ({}) })) as unknown as typeof fetch
    );
    expect((await lookupPlisioOperation({ orderNumber: 'ord_x' })).found).toBe(false);
  });

  it('fails closed when the network times out', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('timeout');
      }) as unknown as typeof fetch
    );
    expect((await lookupPlisioOperation({ txnId: 'x' })).found).toBe(false);
  });
});
