-- =====================================================================
-- Opticks Audio — Waitlist schema (Phase 1)
-- =====================================================================
-- This migration sets up the foundation for the marketing list and
-- product waitlist. It is intentionally GDPR/CAN-SPAM friendly:
--   * Double opt-in via confirmation token
--   * Per-row source tracking (which plugin / which page)
--   * Audit trail of state transitions (subscribed → confirmed → unsubscribed)
--   * Soft delete via `unsubscribed_at` rather than hard delete (legal)
-- =====================================================================

-- Required for gen_random_uuid() and crypt-like helpers in some setups.
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- subscribers
-- ---------------------------------------------------------------------
create table if not exists public.subscribers (
  id                uuid          primary key default gen_random_uuid(),
  email             citext        not null unique,
  status            text          not null default 'pending'
                                  check (status in ('pending','confirmed','unsubscribed','bounced','complained')),
  confirmation_token uuid         not null default gen_random_uuid() unique,
  source            text          not null default 'site_cta',
  -- Optional: which plugin the user expressed interest in.
  -- Free-text so we don't have a hard FK if plugin slugs evolve.
  interested_in     text[]        not null default '{}',
  -- Free-form attribution metadata (utm_source, referrer, etc.)
  metadata          jsonb         not null default '{}'::jsonb,
  ip_hash           text,
  user_agent        text,
  locale            text,
  subscribed_at     timestamptz   not null default now(),
  confirmed_at      timestamptz,
  unsubscribed_at   timestamptz,
  bounced_at        timestamptz,
  complained_at     timestamptz,
  last_email_sent_at timestamptz,
  email_sent_count  int           not null default 0,
  created_at        timestamptz   not null default now(),
  updated_at        timestamptz   not null default now()
);

-- Use citext so emails are stored case-insensitive unique
create extension if not exists "citext";

-- Indexes that matter at scale
create index if not exists subscribers_status_idx       on public.subscribers (status);
create index if not exists subscribers_subscribed_at_idx on public.subscribers (subscribed_at desc);
create index if not exists subscribers_source_idx       on public.subscribers (source);

-- ---------------------------------------------------------------------
-- subscriber_events (audit log)
-- ---------------------------------------------------------------------
create table if not exists public.subscriber_events (
  id            bigserial     primary key,
  subscriber_id uuid          not null references public.subscribers(id) on delete cascade,
  event_type    text          not null
                              check (event_type in (
                                'subscribed','confirmed','unsubscribed',
                                'email_sent','email_opened','email_clicked',
                                'bounced','complained'
                              )),
  payload       jsonb         not null default '{}'::jsonb,
  created_at    timestamptz   not null default now()
);

create index if not exists subscriber_events_subscriber_idx
  on public.subscriber_events (subscriber_id, created_at desc);

-- ---------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------
create or replace function public.tg_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists subscribers_set_updated_at on public.subscribers;
create trigger subscribers_set_updated_at
before update on public.subscribers
for each row execute function public.tg_set_updated_at();

-- ---------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------
-- The waitlist is INSERT-only from the public anon role.
-- All other operations go through the service_role from server code.
alter table public.subscribers       enable row level security;
alter table public.subscriber_events enable row level security;

-- Anon clients may NOT read the subscribers table directly.
-- All inserts go through our /api/waitlist/subscribe route which uses
-- the service_role key. We therefore do NOT grant insert to anon here;
-- the service_role bypasses RLS by design.

-- Optional: an explicit policy for clarity (deny-all to anon)
drop policy if exists "subscribers_no_anon_select" on public.subscribers;
create policy "subscribers_no_anon_select"
  on public.subscribers
  for select
  to anon
  using (false);

drop policy if exists "subscriber_events_no_anon_select" on public.subscriber_events;
create policy "subscriber_events_no_anon_select"
  on public.subscriber_events
  for select
  to anon
  using (false);
