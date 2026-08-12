import 'server-only';
import { revalidatePath } from 'next/cache';

/**
 * Content overrides — the "edit everything from the admin panel" layer
 * (v3.5, 2026-08-09).
 *
 * The static catalog (src/data/tools.ts) and blog (src/data/posts.ts) are the
 * DEFAULT source of truth. Admin edits are stored as JSON blobs in
 * `site_settings` under:
 *   - catalog_override:{slug}  → Partial<Tool>        (a new tool uses __isNew)
 *   - blog_override:{slug}     → Partial<BlogPost>    (a new post uses __isNew)
 *
 * Every catalog/blog page calls getEffectiveTools() / getEffectivePosts()
 * instead of importing ALL_TOOLS / BLOG_POSTS directly, so an edit saved in
 * /admin is live on the site within the cache TTL (30 s) — no redeploy, no
 * touching code. When Supabase is not configured everything degrades to the
 * committed defaults.
 *
 * Server-only: reads happen in Server Components; writes go through the
 * admin-authenticated API routes only.
 */

import { ALL_TOOLS, type Tool } from '@/data/tools';
import { BLOG_POSTS, type BlogPost } from '@/data/posts';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const CATALOG_PREFIX = 'catalog_override:';
const BLOG_PREFIX = 'blog_override:';
const TTL_MS = 30_000;

type ToolOverride = Partial<Tool> & { __isNew?: boolean };
type BlogOverride = Partial<BlogPost> & { __isNew?: boolean };

let toolCache: { at: number; map: Map<string, ToolOverride> } | undefined;
let blogCache: { at: number; map: Map<string, BlogOverride> } | undefined;

function fresh(cache?: { at: number }) {
  return cache !== undefined && Date.now() - cache.at < TTL_MS;
}

async function readBlobs(prefix: string): Promise<Record<string, unknown>> {
  const out: Record<string, unknown> = {};
  if (!supabaseAdmin) return out;
  try {
    const { data } = await supabaseAdmin
      .from('site_settings')
      .select('key, value')
      .like('key', `${prefix}%`);
    for (const row of data ?? []) {
      const slug = row.key.slice(prefix.length);
      if (!slug) continue;
      try {
        out[slug] = JSON.parse(row.value);
      } catch {
        // corrupt blob — ignore
      }
    }
  } catch {
    // DB unavailable — defaults only
  }
  return out;
}

/** All catalog override blobs, cached per process (TTL 30s). */
export async function getAllToolOverrides(): Promise<Map<string, ToolOverride>> {
  if (fresh(toolCache)) return toolCache!.map;
  const blobs = await readBlobs(CATALOG_PREFIX);
  const map = new Map<string, ToolOverride>();
  for (const [slug, blob] of Object.entries(blobs)) {
    if (blob && typeof blob === 'object') map.set(slug, blob as ToolOverride);
  }
  toolCache = { at: Date.now(), map };
  setTimeout(() => (toolCache = undefined), TTL_MS + 1000).unref?.();
  return map;
}

/** All blog override blobs, cached per process (TTL 30s). */
export async function getAllBlogOverrides(): Promise<Map<string, BlogOverride>> {
  if (fresh(blogCache)) return blogCache!.map;
  const blobs = await readBlobs(BLOG_PREFIX);
  const map = new Map<string, BlogOverride>();
  for (const [slug, blob] of Object.entries(blobs)) {
    if (blob && typeof blob === 'object') map.set(slug, blob as BlogOverride);
  }
  blogCache = { at: Date.now(), map };
  setTimeout(() => (blogCache = undefined), TTL_MS + 1000).unref?.();
  return map;
}

/** Invalidate caches (called by admin writes and the admin API). */
export function clearContentCache() {
  toolCache = undefined;
  blogCache = undefined;
}

/** One tool's override blob (admin GET). */
export async function getToolOverride(slug: string): Promise<ToolOverride | null> {
  return (await getAllToolOverrides()).get(slug) ?? null;
}

/** One blog post's override blob (admin GET). */
export async function getBlogOverride(slug: string): Promise<BlogOverride | null> {
  return (await getAllBlogOverrides()).get(slug) ?? null;
}

function mergeTool(tool: Tool, o: ToolOverride): Tool {
  const next: Tool = { ...tool };
  const pick: (keyof Tool)[] = [
    'name', 'tagline', 'description', 'longDescription', 'pageIntro', 'bestFor',
    'url', 'logo', 'coverImage', 'previewVideoUrl', 'category', 'pricing', 'startingPrice', 'tags', 'metrics',
    'verificationLevel', 'isFeatured', 'isEditorsChoice', 'isNew',
    'pricingSourceUrl', 'pricingCheckedAt', 'descriptionSource',
    'affiliateUrl', 'affiliateProgram',
  ];
  for (const k of pick) {
    const v = (o as unknown as Record<string, unknown>)[k];
    if (v !== undefined && v !== null) (next as unknown as Record<string, unknown>)[k] = v;
  }
  if (typeof o.tags === 'string') next.tags = (o.tags as string).split(',').map((s) => s.trim()).filter(Boolean);
  return next;
}

/**
 * Effective tool list = static catalog + per-slug overrides + any NEW tools
 * created from the admin panel (override blobs with __isNew: true).
 */
export async function getEffectiveTools(): Promise<Tool[]> {
  const map = await getAllToolOverrides();
  if (map.size === 0) return ALL_TOOLS;

  const overridden = ALL_TOOLS.map((tool) => {
    const o = map.get(tool.slug);
    return o ? mergeTool(tool, o) : tool;
  });

  // Append new tools (defined only in the DB).
  for (const [slug, o] of map) {
    if (!o.__isNew) continue;
    if (ALL_TOOLS.some((t) => t.slug === slug)) continue;
    const base = o as Partial<Tool>;
    const next = mergeTool({} as Tool, base);
    next.id = base.id ?? slug;
    next.slug = slug;
    next.name = base.name ?? slug;
    next.category = (base.category ?? 'Video Generation') as Tool['category'];
    next.pricing = (base.pricing ?? 'Free') as Tool['pricing'];
    next.rating = base.rating ?? 0;
    next.reviewsCount = base.reviewsCount ?? 0;
    next.isFeatured = base.isFeatured ?? false;
    next.isEditorsChoice = base.isEditorsChoice ?? false;
    next.isTrending = false;
    next.isNew = base.isNew ?? true;
    next.hasFounderBadge = false;
    next.tags = base.tags ?? [];
    next.verificationLevel = (base.verificationLevel ?? 'listed-only') as Tool['verificationLevel'];
    overridden.push(next);
  }
  return overridden;
}

/** Effective single tool (static + override + new tools). */
export async function getEffectiveTool(slug: string): Promise<Tool | undefined> {
  const tools = await getEffectiveTools();
  return tools.find((t) => t.slug === slug);
}

function mergePost(post: BlogPost, o: BlogOverride): BlogPost {
  const next: BlogPost = { ...post };
  const pick: (keyof BlogPost)[] = ['title', 'excerpt', 'date', 'isoDate', 'readTime', 'category', 'coverImage', 'featuredToolSlug', 'content'];
  for (const k of pick) {
    const v = (o as unknown as Record<string, unknown>)[k];
    if (v !== undefined && v !== null) (next as unknown as Record<string, unknown>)[k] = v;
  }
  return next;
}

/** Effective blog list = static posts + overrides + NEW posts. */
export async function getEffectivePosts(): Promise<BlogPost[]> {
  const map = await getAllBlogOverrides();
  if (map.size === 0) return BLOG_POSTS;

  const overridden = BLOG_POSTS.map((post) => {
    const o = map.get(post.slug);
    return o ? mergePost(post, o) : post;
  });

  for (const [slug, o] of map) {
    if (!o.__isNew) continue;
    if (BLOG_POSTS.some((p) => p.slug === slug)) continue;
    const base = o as Partial<BlogPost>;
    overridden.push({
      slug,
      title: base.title ?? slug,
      excerpt: base.excerpt ?? '',
      date: base.date ?? new Date().toISOString().slice(0, 10),
      isoDate: base.isoDate ?? new Date().toISOString().slice(0, 10),
      readTime: base.readTime ?? '3 min read',
      category: base.category ?? 'Creator Tools',
      featuredToolSlug: base.featuredToolSlug ?? '',
      content: base.content ?? '',
      ...base,
    });
  }
  return overridden;
}

/** Effective single blog post. */
export async function getEffectivePost(slug: string): Promise<BlogPost | undefined> {
  const posts = await getEffectivePosts();
  return posts.find((p) => p.slug === slug);
}

/* ─────────────────────────── admin writes ─────────────────────────── */

async function upsertBlob(key: string, blob: unknown): Promise<{ ok: boolean; error?: string }> {
  if (!supabaseAdmin) {
    return { ok: false, error: 'SUPABASE_SERVICE_ROLE_KEY is not configured — cannot save.' };
  }
  const { error } = await supabaseAdmin
    .from('site_settings')
    .upsert({ key, value: JSON.stringify(blob) }, { onConflict: 'key' });
  if (error) return { ok: false, error: error.message };
  void supabaseAdmin
    .from('admin_audit_log')
    .insert([{ action: 'content_override.update', entity: key, detail: {} }])
    .then(() => undefined, () => undefined);
  clearContentCache();
  // v3.5: purge the ISR cache so the change is live site-wide immediately
  // (no 30s wait, no redeploy).
  try {
    revalidatePath('/', 'layout');
  } catch {
    // build-time call — fine to ignore
  }
  return { ok: true };
}

async function deleteBlob(key: string): Promise<{ ok: boolean; error?: string }> {
  if (!supabaseAdmin) {
    return { ok: false, error: 'SUPABASE_SERVICE_ROLE_KEY is not configured — cannot delete.' };
  }
  const { error } = await supabaseAdmin.from('site_settings').delete().eq('key', key);
  if (error) return { ok: false, error: error.message };
  void supabaseAdmin
    .from('admin_audit_log')
    .insert([{ action: 'content_override.delete', entity: key, detail: {} }])
    .then(() => undefined, () => undefined);
  clearContentCache();
  try {
    revalidatePath('/', 'layout');
  } catch {
    // build-time call — fine to ignore
  }
  return { ok: true };
}

/** Merge `fields` into an existing override (or create one) for a tool. */
export async function saveToolOverride(
  slug: string,
  fields: Record<string, unknown>
): Promise<{ ok: boolean; error?: string }> {
  const existing = (await getToolOverride(slug)) ?? {};
  const { __isNew, ...rest } = existing;
  const merged = { ...rest, ...fields };
  return upsertBlob(`${CATALOG_PREFIX}${slug}`, merged);
}

/** Create a brand-new tool from the admin panel. */
export async function addToolOverride(tool: Partial<Tool> & { slug: string }): Promise<{ ok: boolean; error?: string }> {
  if (!tool.slug?.trim()) return { ok: false, error: 'slug is required' };
  if (ALL_TOOLS.some((t) => t.slug === tool.slug)) {
    return { ok: false, error: `A tool with slug "${tool.slug}" already exists in the catalog.` };
  }
  return upsertBlob(`${CATALOG_PREFIX}${tool.slug}`, { ...tool, __isNew: true });
}

/** Remove overrides for a tool (existing → back to defaults; new → deleted). */
export async function deleteToolOverride(slug: string): Promise<{ ok: boolean; error?: string }> {
  return deleteBlob(`${CATALOG_PREFIX}${slug}`);
}

/** Merge `fields` into an existing override (or create one) for a post. */
export async function saveBlogOverride(
  slug: string,
  fields: Record<string, unknown>
): Promise<{ ok: boolean; error?: string }> {
  const existing = (await getBlogOverride(slug)) ?? {};
  const { __isNew, ...rest } = existing;
  const merged = { ...rest, ...fields };
  return upsertBlob(`${BLOG_PREFIX}${slug}`, merged);
}

/** Create a brand-new blog post from the admin panel. */
export async function addBlogOverride(post: Partial<BlogPost> & { slug: string }): Promise<{ ok: boolean; error?: string }> {
  if (!post.slug?.trim()) return { ok: false, error: 'slug is required' };
  if (BLOG_POSTS.some((p) => p.slug === post.slug)) {
    return { ok: false, error: `A post with slug "${post.slug}" already exists.` };
  }
  return upsertBlob(`${BLOG_PREFIX}${post.slug}`, { ...post, __isNew: true });
}

/** Remove overrides for a post (existing → back to defaults; new → deleted). */
export async function deleteBlogOverride(slug: string): Promise<{ ok: boolean; error?: string }> {
  return deleteBlob(`${BLOG_PREFIX}${slug}`);
}
