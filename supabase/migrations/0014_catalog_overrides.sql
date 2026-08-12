-- 0014_catalog_overrides.sql (2026-08-09)
-- Content overrides for the admin panel's catalog editor (v3.5).
--
-- Admin edits to tools and blog posts are stored as JSON blobs in the
-- existing site_settings table, so NO new tables are needed:
--   key = 'catalog_override:{slug}'  value = JSON Partial<Tool>
--   key = 'blog_override:{slug}'     value = JSON Partial<BlogPost>
-- A brand-new entity is marked with "isNew": true inside the blob.
--
-- The app merges these overrides at render time (src/lib/contentOverrides.ts)
-- with a 30s process cache, so an edit in /admin is live without a redeploy.
-- site_settings must keep the RLS from migration 0003: writes only via the
-- admin-authenticated API routes (service role).

COMMENT ON TABLE public.site_settings IS
  'Site settings + catalog/blog content overrides (content_*, i18n_*, catalog_override:{slug}, blog_override:{slug})';

CREATE INDEX IF NOT EXISTS site_settings_key_prefix_idx ON public.site_settings (key text_pattern_ops);
