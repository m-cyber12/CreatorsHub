-- 0018_announcement_rebrand.sql
-- The 0002 seed still serves pre-rebrand announcement copy ("mention
-- CreatorAI Hub on Twitter/X..."), and DB rows override the code defaults in
-- src/app/api/settings/route.ts — so visitors on a seeded database see the
-- dead brand in the announcement banner. Re-seed the three live keys to the
-- Noxifera copy (idempotent: safe to run on fresh and existing databases).

insert into public.site_settings (key, value, description) values
  ('announcement_title', 'Building an AI video tool? Get listed.', 'Announcement banner title'),
  ('announcement_desc', 'Submit your tool for review. If we test it hands-on, you get a full evidence-backed listing.', 'Announcement banner description'),
  ('announcement_enabled', 'false', 'Whether the announcement banner shows')
on conflict (key) do update set
  value = excluded.value,
  description = excluded.description,
  updated_at = now();
