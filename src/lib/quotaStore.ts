import 'server-only';

/**
 * Daily AI-generation quotas — server truth.
 *
 * 2026-08-12 audit rewrite:
 *  - The in-memory Map reset on every serverless cold start, so the daily
 *    limit was effectively unenforced.
 *  - The old store trusted an `email` field taken straight from the request
 *    body: anyone could mint a fresh 3-run quota per made-up address.
 *
 * Behaviour now:
 *  - The identifier is ALWAYS server-chosen by the caller (verified session
 *    email or requester IP) — this module never sees client-supplied
 *    identity unverified.
 *  - When Supabase is configured, counters live in the ai_usage_daily table
 *    (migration 0017) and survive cold starts / multiple instances.
 *  - Local development without Supabase falls back to the in-memory map.
 */

import { supabaseAdmin } from '@/lib/supabaseAdmin';

export interface QuotaInfo {
  limit: number;
  used: number;
  remaining: number;
  limitReached: boolean;
}

const FREE_DAILY_LIMIT = 3;
const PRO_DAILY_LIMIT = 50;

declare global {
  // eslint-disable-next-line no-var
  var __AI_STUDIO_QUOTAS: Record<string, { count: number; date: string }> | undefined;
}

if (!globalThis.__AI_STUDIO_QUOTAS) {
  globalThis.__AI_STUDIO_QUOTAS = {};
}

const memoryQuotas = globalThis.__AI_STUDIO_QUOTAS;

export function todayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

function toInfo(limit: number, used: number): QuotaInfo {
  const remaining = Math.max(0, limit - used);
  return { limit, used, remaining, limitReached: remaining <= 0 };
}

/* --------------------------- memory fallback --------------------------- */

function memoryGet(identifier: string, isPro: boolean): QuotaInfo {
  const limit = isPro ? PRO_DAILY_LIMIT : FREE_DAILY_LIMIT;
  const current = memoryQuotas[identifier];
  if (!current || current.date !== todayDateString()) return toInfo(limit, 0);
  return toInfo(limit, current.count);
}

function memoryConsume(identifier: string, isPro: boolean): QuotaInfo {
  const limit = isPro ? PRO_DAILY_LIMIT : FREE_DAILY_LIMIT;
  const today = todayDateString();
  const current = memoryQuotas[identifier];
  if (!current || current.date !== today) {
    memoryQuotas[identifier] = { count: 1, date: today };
    return toInfo(limit, 1);
  }
  if (current.count >= limit) return toInfo(limit, current.count);
  current.count += 1;
  return toInfo(limit, current.count);
}

/* --------------------------- Supabase backend --------------------------- */

async function dbGet(identifier: string, isPro: boolean): Promise<QuotaInfo> {
  const limit = isPro ? PRO_DAILY_LIMIT : FREE_DAILY_LIMIT;
  const { data, error } = await supabaseAdmin!
    .from('ai_usage_daily')
    .select('used')
    .eq('identifier', identifier)
    .eq('day', todayDateString())
    .maybeSingle();
  if (error) throw error;
  return toInfo(limit, data?.used ?? 0);
}

async function dbConsume(identifier: string, isPro: boolean): Promise<QuotaInfo> {
  const limit = isPro ? PRO_DAILY_LIMIT : FREE_DAILY_LIMIT;
  const today = todayDateString();

  const { data, error } = await supabaseAdmin!
    .from('ai_usage_daily')
    .select('used')
    .eq('identifier', identifier)
    .eq('day', today)
    .maybeSingle();
  if (error) throw error;

  const used = data?.used ?? 0;
  if (used >= limit) return toInfo(limit, used);

  const { error: upsertError } = await supabaseAdmin!
    .from('ai_usage_daily')
    .upsert({ identifier, day: today, used: used + 1 }, { onConflict: 'identifier,day' });
  if (upsertError) throw upsertError;

  return toInfo(limit, used + 1);
}

async function withFallback<T>(db: () => Promise<T>, memory: () => T): Promise<T> {
  if (!supabaseAdmin) return memory();
  try {
    return await db();
  } catch (err) {
    // Never let quota persistence take the endpoint down; degrade to memory.
    console.warn('[quotaStore] Supabase quota backend failed, using memory fallback:', err);
    return memory();
  }
}

/* ------------------------------- public API ------------------------------- */

export async function getDailyQuota(identifier: string, isPro = false): Promise<QuotaInfo> {
  const id = identifier.trim().toLowerCase();
  return withFallback(() => dbGet(id, isPro), () => memoryGet(id, isPro));
}

export async function consumeDailyQuota(identifier: string, isPro = false): Promise<QuotaInfo> {
  const id = identifier.trim().toLowerCase();
  return withFallback(() => dbConsume(id, isPro), () => memoryConsume(id, isPro));
}
