'use client';

/**
 * Client-side helper: attaches the verified Supabase session token to Studio
 * API calls. The server derives the quota identity from THIS token — the
 * request body is never trusted for identity (2026-08-12 audit fix 1.3).
 * Anonymous users (no session) simply send no header and get the IP quota.
 */

import { supabase } from '@/lib/supabase';

export async function studioAuthHeaders(): Promise<Record<string, string>> {
  if (!supabase) return {};
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {};
  } catch {
    return {};
  }
}
