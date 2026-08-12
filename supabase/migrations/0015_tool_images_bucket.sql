-- 0015_tool_images_bucket.sql (2026-08-09)
-- Creates the PUBLIC storage bucket used by the admin panel's image uploader
-- (POST /api/admin/tools/upload → src/app/api/admin/tools/upload/route.ts).
--
-- HOW TO APPLY (one of):
--   1) Supabase dashboard → SQL Editor → paste this → Run
--   2) supabase storage buckets create tool-images --public
--   3) Dashboard → Storage → New bucket → name: tool-images → Public: ON
--
-- Why public: getPublicUrl() must return a directly-viewable image URL for
-- logos/covers shown to visitors. Uploads themselves go through the
-- service_role key (admin-only, RLS-bypassing), so no extra storage policies
-- are needed and anonymous users can never write to the bucket.

insert into storage.buckets (id, name, public)
values ('tool-images', 'tool-images', true)
on conflict (id) do nothing;
