import 'server-only';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { supabase } from '@/lib/supabase';

let cached: { enabled: boolean; ts: number } | null = null;
const CACHE_TTL = 60_000; // 1 min

/** Default: news enabled */
const DEFAULT_ENABLED = true;

/**
 * Check if news ingestion is enabled.
 * Reads from site_settings key `news_enabled` (true/false string).
 * Cached 60s per process, fallback to true if DB unavailable.
 */
export async function isNewsEnabled(): Promise<boolean> {
  const now = Date.now();
  if (cached && now - cached.ts < CACHE_TTL) return cached.enabled;

  try {
    const client = supabaseAdmin || supabase;
    if (!client) {
      cached = { enabled: DEFAULT_ENABLED, ts: now };
      return DEFAULT_ENABLED;
    }
    const { data, error } = await client
      .from('site_settings')
      .select('value')
      .eq('key', 'news_enabled')
      .single();
    if (error || !data) {
      cached = { enabled: DEFAULT_ENABLED, ts: now };
      return DEFAULT_ENABLED;
    }
    const val = String(data.value).toLowerCase();
    const enabled = val === 'true' || val === '1' || val === 'enabled';
    cached = { enabled, ts: now };
    return enabled;
  } catch {
    cached = { enabled: DEFAULT_ENABLED, ts: Date.now() };
    return DEFAULT_ENABLED;
  }
}

export async function setNewsEnabled(enabled: boolean): Promise<{ ok: boolean; error?: string }> {
  if (!supabaseAdmin) {
    return { ok: false, error: 'SUPABASE_SERVICE_ROLE_KEY not configured' };
  }
  const { error } = await supabaseAdmin
    .from('site_settings')
    .upsert({ key: 'news_enabled', value: String(enabled) }, { onConflict: 'key' });
  if (error) return { ok: false, error: error.message };
  cached = { enabled, ts: Date.now() };
  return { ok: true };
}

export function clearNewsEnabledCache() {
  cached = null;
}
