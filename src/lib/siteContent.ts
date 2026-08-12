/**
 * Editable site content — the "Preview / edit / save" layer behind the admin
 * panel's Site Content tab (v3.3, 2026-08-08).
 *
 * Certain high-visibility strings (homepage hero, AI Studio hero, …) are
 * stored in `site_settings` under `content_*` keys and OVERRIDE the default
 * copy from the message dictionaries. The admin panel edits them, saves via
 * the service-role client, and every page that reads getSiteContent() picks
 * up the change immediately — with the committed translation as the fallback
 * when no override exists.
 *
 * Server-only: reads happen in Server Components; writes go through the
 * admin-authenticated API route only.
 */

import 'server-only';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

/** All editable content keys and their defaults (English canonical copy). */
export interface SiteContent {
  /** Homepage hero */
  homeHeroTitle1: string;
  homeHeroTitleAccent: string;
  homeHeroSub: string;
  homeHeroCtaPlan: string;
  homeHeroCtaBrowse: string;
  homeFeaturedTitle: string;
  homeFeaturedSub: string;
  homeNewsletterTitle: string;
  homeNewsletterText: string;
  /** AI Studio hero */
  studioKicker: string;
  studioHeroTitle1: string;
  studioHeroTitle2: string;
  studioHeroText: string;
}

export const DEFAULT_CONTENT: SiteContent = {
  homeHeroTitle1: 'Choose an AI tool',
  homeHeroTitleAccent: 'without wasting another subscription.',
  homeHeroSub: 'Search by the job you need done — and we clearly separate price checks from tools we have actually benchmarked.',
  homeHeroCtaPlan: 'Plan my workflow',
  homeHeroCtaBrowse: 'Browse the catalog',
  homeFeaturedTitle: 'Tools to research next',
  homeFeaturedSub: 'Catalog listings, not editorial test results — yet.',
  homeNewsletterTitle: 'A quieter, more useful AI briefing.',
  homeNewsletterText:
    'Join the launch list for creator-relevant price changes, policy updates, and evidence releases. The newsletter is not live yet — no confirmation email will be sent until it is.',
  studioKicker: 'CreatorAI Hub / Native workspace · free launch access',
  studioHeroTitle1: 'Make the next',
  studioHeroTitle2: 'move yourself.',
  studioHeroText:
    'AI Studio is a separate workspace for practical creator utilities — briefs, prompts, calendars, and local media tasks. No tool rankings. No hidden uploads.',
};

const KEY_PREFIX = 'content_';
export type ContentKey = keyof SiteContent;

type AllRows = Record<string, string>;
let cache: AllRows | undefined;

/** Read ALL content rows from the DB once, cache per process (TTL 60s). */
async function loadOverrides(force = false): Promise<AllRows> {
  if (cache !== undefined && !force) return cache;
  cache = {};
  if (supabaseAdmin) {
    try {
      const { data } = await supabaseAdmin
        .from('site_settings')
        .select('key, value')
        .like('key', `${KEY_PREFIX}%`);
      for (const row of data ?? []) {
        cache[row.key] = row.value;
      }
    } catch {
      // DB unavailable — defaults only
    }
  }
  setTimeout(() => (cache = undefined), 60_000).unref?.();
  return cache;
}

/**
 * 2026-08-12 audit (i18n hero bug): admin-panel overrides are written in
 * English and previously won over the translated dictionaries on EVERY
 * locale — the /fa homepage rendered an English hero. Now:
 *  - English ('en') applies the legacy `content_<key>` overrides.
 *  - Other locales only apply a dedicated `content_<locale>_<key>` override
 *    (editable per-language later); otherwise the page's own translated
 *    dictionary strings render, because the caller short-circuits with ||.
 */
export async function getSiteContent(force = false, locale = 'en'): Promise<Partial<SiteContent>> {
  const rows = await loadOverrides(force);
  const result: Partial<SiteContent> = {};
  for (const shortKey of Object.keys(DEFAULT_CONTENT) as ContentKey[]) {
    const key =
      locale === 'en'
        ? `${KEY_PREFIX}${shortKey}`
        : `${KEY_PREFIX}${locale}_${shortKey}`;
    if (Object.prototype.hasOwnProperty.call(rows, key)) {
      result[shortKey] = rows[key];
    }
  }
  return result;
}

/** Single-key helper for pages that only need one override. */
export async function getContentKey(
  key: ContentKey,
  force = false,
  locale = 'en'
): Promise<string | undefined> {
  return (await getSiteContent(force, locale))[key];
}

/** Admin view helper: English-effective content with defaults merged in. */
export async function getAdminSiteContent(force = false): Promise<SiteContent> {
  const overrides = await getSiteContent(force, 'en');
  return { ...DEFAULT_CONTENT, ...overrides };
}

/** Persist overrides (admin only). Keys not present keep their old value. */
export async function saveSiteContent(patch: Partial<SiteContent>): Promise<{ ok: boolean; error?: string }> {
  if (!supabaseAdmin) {
    return { ok: false, error: 'SUPABASE_SERVICE_ROLE_KEY is not configured — cannot save content.' };
  }
  const rows = Object.entries(patch)
    .filter(([k]) => k in DEFAULT_CONTENT)
    .map(([k, v]) => ({ key: `${KEY_PREFIX}${k}`, value: String(v ?? '').slice(0, 5000) }));
  if (rows.length === 0) return { ok: true };

  const { error } = await supabaseAdmin.from('site_settings').upsert(rows, { onConflict: 'key' });
  if (error) return { ok: false, error: error.message };

  void supabaseAdmin
    .from('admin_audit_log')
    .insert([{ action: 'site_content.update', entity: 'site_settings', detail: { keys: rows.map((r) => r.key) } }])
    .then(
      () => undefined,
      () => undefined
    );

  cache = undefined; // invalidate
  return { ok: true };
}
