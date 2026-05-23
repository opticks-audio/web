-- =====================================================================
-- Opticks Audio — Downloads infrastructure (Phase 2A)
-- =====================================================================
-- Adds:
--   * plugin_releases   — what versions are available in R2 right now.
--   * download_grants   — a single grant = one subscriber requested
--                         download links at a specific moment. Holds
--                         the audit trail: who, when, which IP, which
--                         versions, which signed URLs.
--   * download_events   — fine-grained log: each click on a signed URL
--                         (we count via webhook hits, not R2 itself).
--
-- Conservative design:
--   * No public read policies. All access via service-role on server.
--   * Foreign keys to subscribers.email (citext, already unique).
--   * Versions are stored as `text` (semver-ish) to allow `0.1.0-beta.2`.
-- =====================================================================

-- ---------------------------------------------------------------------
-- plugin_releases
-- One row per plug-in / version. `is_current` is the version we offer
-- new requesters by default. Soft-toggle so older versions stay
-- requestable for compatibility but aren't advertised.
-- ---------------------------------------------------------------------
create table if not exists public.plugin_releases (
  id              uuid          primary key default gen_random_uuid(),
  slug            text          not null check (slug in ('reflexion','refraction','inflexion')),
  version         text          not null,
  -- Platforms actually uploaded to R2 for this version. We store a
  -- bitfield-ish text[] so a row can declare "mac only" while we wait
  -- on Windows builds.
  platforms       text[]        not null default '{mac}',
  -- One sentence pulled into the download email body.
  release_notes   text,
  is_current      boolean       not null default false,
  released_at     timestamptz   not null default now(),
  created_at      timestamptz   not null default now(),
  unique (slug, version)
);

create index if not exists plugin_releases_current_idx
  on public.plugin_releases (slug)
  where is_current = true;

-- ---------------------------------------------------------------------
-- download_grants
-- A subscriber asked for download links. We pre-sign URLs, email them,
-- and store a record so we can correlate later clicks and re-issue
-- expired links without forcing a new email confirmation flow.
-- ---------------------------------------------------------------------
create table if not exists public.download_grants (
  id                uuid          primary key default gen_random_uuid(),
  subscriber_email  citext        not null references public.subscribers(email) on delete cascade,
  -- Which plug-ins this grant covers. Empty array = all three (a "full
  -- collection" grant). Allows future single-plugin grants.
  plugins           text[]        not null default '{reflexion,refraction,inflexion}',
  -- The version snapshot at the time of grant. Captured so re-sending
  -- the same grant later gives the same files, never a surprise update.
  version_pins      jsonb         not null default '{}'::jsonb,
  -- Source of the request, for analytics.
  source            text          not null default 'plugin_page'
                                  check (source in ('plugin_page','home_cta','admin_broadcast','manual')),
  ip_hash           text,
  user_agent        text,
  created_at        timestamptz   not null default now(),
  -- Convenience: when does the email's signed URLs go stale?
  expires_at        timestamptz   not null default now() + interval '24 hours'
);

create index if not exists download_grants_email_idx
  on public.download_grants (subscriber_email);

create index if not exists download_grants_created_idx
  on public.download_grants (created_at desc);

-- ---------------------------------------------------------------------
-- download_events
-- Each row = one observed download attempt. Populated by the
-- /api/downloads/track redirect endpoint that wraps the R2 signed URLs.
-- ---------------------------------------------------------------------
create table if not exists public.download_events (
  id              uuid          primary key default gen_random_uuid(),
  grant_id        uuid          references public.download_grants(id) on delete set null,
  subscriber_email citext       not null,
  slug            text          not null check (slug in ('reflexion','refraction','inflexion')),
  platform        text          not null check (platform in ('mac','windows')),
  version         text          not null,
  ip_hash         text,
  user_agent      text,
  result          text          not null default 'ok'
                                check (result in ('ok','expired','invalid','blocked')),
  occurred_at     timestamptz   not null default now()
);

create index if not exists download_events_email_idx
  on public.download_events (subscriber_email);

create index if not exists download_events_occurred_idx
  on public.download_events (occurred_at desc);

-- ---------------------------------------------------------------------
-- Seed: v0.1.0 of all three plug-ins, mac-only for now.
-- ---------------------------------------------------------------------
insert into public.plugin_releases (slug, version, platforms, release_notes, is_current)
values
  ('reflexion',  '0.1.0', '{mac}', 'First public beta. 8-channel modulated FDN, 3 room shapes, full tone-shaping stage.', true),
  ('refraction', '0.1.0', '{mac}', 'First public beta. Authentic tape model, wow + flutter, 3-head multi-tap with continuous ping-pong.', true),
  ('inflexion',  '0.1.0', '{mac}', 'First public beta. VCA / FET / OPTO topologies, dual peak+RMS detector, 2× oversampled transformer saturation.', true)
on conflict (slug, version) do update
  set platforms = excluded.platforms,
      release_notes = excluded.release_notes,
      is_current = excluded.is_current;

-- ---------------------------------------------------------------------
-- RLS — locked down. Nothing public.
-- ---------------------------------------------------------------------
alter table public.plugin_releases enable row level security;
alter table public.download_grants enable row level security;
alter table public.download_events enable row level security;
-- No policies = nobody but the service-role bypass can read or write.
