-- 0021_news_v2_real_site.sql — make news a real editorial site
-- - news_enabled toggle (site_settings)
-- - news_comments table for real comments
-- - ensure news_items can be fully editorial (source fields optional)

-- 1) news_enabled toggle
insert into public.site_settings (key, value, description)
values ('news_enabled', 'true', 'When false, cron ingestion /api/news/refresh does nothing')
on conflict (key) do nothing;

-- 2) Make source fields optional for editorial news (they were NOT NULL with default '' already, but ensure)
alter table public.news_items alter column source drop not null;
alter table public.news_items alter column source_url drop not null;

-- 3) Comments table
create table if not exists public.news_comments (
  id uuid primary key default gen_random_uuid(),
  news_slug text not null references public.news_items(slug) on delete cascade,
  author_name text not null check (char_length(author_name) between 2 and 60),
  author_email text check (char_length(author_email) <= 120),
  body text not null check (char_length(body) between 3 and 2000),
  status text not null default 'approved' check (status in ('approved','pending','rejected')),
  created_at timestamptz not null default now()
);

create index if not exists news_comments_slug_idx on public.news_comments (news_slug, created_at desc);
create index if not exists news_comments_status_idx on public.news_comments (status);

alter table public.news_comments enable row level security;

drop policy if exists "Approved comments are publicly readable" on public.news_comments;
create policy "Approved comments are publicly readable"
  on public.news_comments for select
  to anon, authenticated
  using (status = 'approved');

drop policy if exists "Anyone can post comments" on public.news_comments;
create policy "Anyone can post comments"
  on public.news_comments for insert
  to anon, authenticated
  with check (true);

-- Service role bypasses RLS for admin moderation

-- 4) Helper: comment counts
create or replace function public.news_comment_counts()
returns table (news_slug text, count bigint)
language sql
security invoker
stable
as $$
  select news_slug, count(*) from public.news_comments where status='approved' group by news_slug;
$$;
