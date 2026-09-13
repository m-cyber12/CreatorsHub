-- ════════════════════════════════════════════════════════════════════════
--  0020 — FIRST-PARTY ANALYTICS EVENTS
--  Minimal product-event store backing the admin activity dashboard (P4).
--  Same PII rule as search_log: slugs/counts/enums only — no IPs, no user
--  ids, no free text beyond short enum-like prop values (enforced in app
--  code by validateBeaconEvent). No new vendor, no cookie banner needed.
-- ════════════════════════════════════════════════════════════════════════
-- Run after 0019_community_qa.sql.

begin;

create table if not exists public.analytics_events (
  id           bigserial primary key,
  event        text        not null,
  path         text,
  props        jsonb       not null default '{}'::jsonb,
  created_at   timestamptz not null default now()
);
create index if not exists analytics_events_event_idx on public.analytics_events (event, created_at desc);
create index if not exists analytics_events_created_idx on public.analytics_events (created_at desc);

alter table public.analytics_events enable row level security;
-- Server-side only (beacon writes, admin reads). No public policy.

-- Daily counts per event for the last 30 days — the dashboard's main query.
create or replace view public.analytics_daily as
select
  event,
  (created_at at time zone 'UTC')::date as day,
  count(*) as total
from public.analytics_events
where created_at > now() - interval '30 days'
group by event, (created_at at time zone 'UTC')::date
order by day desc, total desc;

commit;
