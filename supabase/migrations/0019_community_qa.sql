-- ════════════════════════════════════════════════════════════════════════
--  0019 — COMMUNITY Q&A (scoped)
--  Questions, answers, tips and showcases attached ONLY to catalog entities:
--  tools, outcomes, workflows. Deliberately not a forum: no threads outside
--  an entity, no follows, no DMs. Mirrors the reviews moderation model —
--  new posts are `pending` until approved in the admin community queue.
-- ════════════════════════════════════════════════════════════════════════
-- Run after 0018.

begin;

-- ── community_posts ────────────────────────────────────────────────
create table if not exists public.community_posts (
  id             bigserial primary key,
  entity_type    text        not null check (entity_type in ('tool', 'outcome', 'workflow')),
  entity_slug    text        not null,
  kind           text        not null check (kind in ('question', 'answer', 'tip', 'showcase')),
  -- Answers only: the question they answer (same entity, enforced in app code).
  parent_id      bigint      references public.community_posts (id) on delete cascade,
  -- Questions, tips and showcases carry a title; answers use the parent's.
  title          text,
  body           text        not null,
  author_name    text        not null default 'Anonymous Creator',
  helpful_count  int         not null default 0,
  status         text        not null default 'pending' check (status in ('pending', 'approved', 'removed')),
  created_at     timestamptz not null default now(),
  constraint answers_have_parent check (
    (kind = 'answer' and parent_id is not null) or
    (kind <> 'answer' and parent_id is null)
  )
);
create index if not exists community_posts_entity_idx
  on public.community_posts (entity_type, entity_slug, status, created_at desc);
create index if not exists community_posts_parent_idx
  on public.community_posts (parent_id) where parent_id is not null;
create index if not exists community_posts_pending_idx
  on public.community_posts (status, created_at desc) where status = 'pending';

alter table public.community_posts enable row level security;
-- Public read: approved posts only. Writes go through the API (service role),
-- exactly like reviews after 0003 locked down open inserts.
drop policy if exists "community posts are readable by everyone" on public.community_posts;
create policy "community posts are readable by everyone"
  on public.community_posts for select using (status = 'approved');

-- ── community_reports ──────────────────────────────────────────────
create table if not exists public.community_reports (
  id           bigserial primary key,
  post_id      bigint      not null references public.community_posts (id) on delete cascade,
  reason       text        not null check (reason in ('spam', 'abuse', 'misinformation', 'other')),
  detail       text,
  created_at   timestamptz not null default now()
);
create index if not exists community_reports_post_idx on public.community_reports (post_id, created_at desc);

alter table public.community_reports enable row level security;
-- Server-side only (API writes, admin reads). No public policy.

-- ── helpful counter RPC (called from the API) ───────────────────────
create or replace function public.increment_post_helpful(post_id bigint)
returns void language sql security definer as $$
  update public.community_posts set helpful_count = helpful_count + 1 where id = post_id and status = 'approved';
$$;

commit;
