import 'server-only';

/**
 * Deals / coupons manager (v3.5, 2026-08-10).
 *
 * Admin-managed deals are stored as a JSON array in `site_settings` under the
 * key `deals_list`. The /deals page renders active deals at the top, and the
 * admin panel has a Deals tab to add/edit/remove them — live without redeploy
 * (30s cache, invalidated on write).
 */

import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { revalidatePath } from 'next/cache';

export interface Deal {
  id: string;
  title: string;
  /** Optional catalog tool slug (link defaults to /go/{slug}). */
  toolSlug?: string;
  code?: string;
  discount?: string;
  url?: string;
  description?: string;
  enabled: boolean;
}

const KEY = 'deals_list';
const TTL_MS = 30_000;
let cache: { at: number; deals: Deal[] } | undefined;

function fresh() {
  return cache !== undefined && Date.now() - cache.at < TTL_MS;
}

export async function getDeals(): Promise<Deal[]> {
  if (fresh()) return cache!.deals;
  let deals: Deal[] = [];
  if (supabaseAdmin) {
    try {
      const { data } = await supabaseAdmin.from('site_settings').select('value').eq('key', KEY).maybeSingle();
      if (data?.value) {
        const parsed = JSON.parse(data.value);
        if (Array.isArray(parsed)) deals = parsed;
      }
    } catch {
      // DB unavailable — empty list
    }
  }
  cache = { at: Date.now(), deals };
  setTimeout(() => (cache = undefined), TTL_MS + 1000).unref?.();
  return deals;
}

/** Active (enabled) deals for rendering. */
export async function getActiveDeals(): Promise<Deal[]> {
  return (await getDeals()).filter((d) => d.enabled);
}

async function saveDeals(deals: Deal[]): Promise<{ ok: boolean; error?: string }> {
  if (!supabaseAdmin) {
    return { ok: false, error: 'SUPABASE_SERVICE_ROLE_KEY is not configured — cannot save deals.' };
  }
  const { error } = await supabaseAdmin
    .from('site_settings')
    .upsert({ key: KEY, value: JSON.stringify(deals) }, { onConflict: 'key' });
  if (error) return { ok: false, error: error.message };
  void supabaseAdmin
    .from('admin_audit_log')
    .insert([{ action: 'deals.update', entity: KEY, detail: { count: deals.length } }])
    .then(() => undefined, () => undefined);
  cache = undefined;
  try {
    revalidatePath('/deals');
  } catch {
    // build-time — fine
  }
  return { ok: true };
}

export async function addDeal(deal: Omit<Deal, 'id'>): Promise<{ ok: boolean; error?: string }> {
  const deals = await getDeals();
  deals.push({ ...deal, id: `deal_${Date.now()}` });
  return saveDeals(deals);
}

export async function updateDeal(id: string, patch: Partial<Deal>): Promise<{ ok: boolean; error?: string }> {
  const deals = await getDeals();
  const idx = deals.findIndex((d) => d.id === id);
  if (idx === -1) return { ok: false, error: 'Deal not found' };
  deals[idx] = { ...deals[idx], ...patch };
  return saveDeals(deals);
}

export async function deleteDeal(id: string): Promise<{ ok: boolean; error?: string }> {
  const deals = await getDeals();
  return saveDeals(deals.filter((d) => d.id !== id));
}
