-- =====================================================================
-- Opticks Audio — Admin dashboard (Phase 2B)
-- =====================================================================
-- Authorisation model:
--   * Auth = Supabase Auth (magic links, no passwords).
--   * Authorisation = membership in `public.admin_users`, keyed by the
--     authenticated user's email (citext).
--   * Server reads admin_users via the service role (RLS bypass) and
--     verifies the session's email is present before serving any
--     /admin/* page or API.
--
-- We deliberately keep the auth table separate from `auth.users`:
--   - Promoting a teammate is a one-line INSERT, no need to manually
--     wire roles into the auth schema.
--   - Sessions remain managed by Supabase Auth as usual.
--   - If we ever need finer-grained roles (owner, editor, viewer) we
--     just add a `role` column here without touching Supabase internals.
-- =====================================================================

-- ---------------------------------------------------------------------
-- admin_users
-- ---------------------------------------------------------------------
create table if not exists public.admin_users (
  id            uuid          primary key default gen_random_uuid(),
  email         citext        not null unique,
  -- Role kept simple for now. `owner` is the bootstrap account, others
  -- can be invited later. The dashboard only checks `revoked_at is null`.
  role          text          not null default 'owner'
                              check (role in ('owner','admin','viewer')),
  invited_by    uuid          references public.admin_users(id) on delete set null,
  created_at    timestamptz   not null default now(),
  -- Soft revoke instead of delete so we keep the audit trail of who
  -- did what under an old session.
  revoked_at    timestamptz
);

create index if not exists admin_users_email_idx
  on public.admin_users (email)
  where revoked_at is null;

-- ---------------------------------------------------------------------
-- admin_events
-- Append-only audit log of consequential admin actions (sign-in, view
-- subscriber list, send broadcast, etc.). Read-only from the dashboard;
-- used to spot abuse and to debug "who pushed the button?".
-- ---------------------------------------------------------------------
create table if not exists public.admin_events (
  id            uuid          primary key default gen_random_uuid(),
  admin_email   citext        not null,
  action        text          not null,
  payload       jsonb         not null default '{}'::jsonb,
  ip_hash       text,
  user_agent    text,
  occurred_at   timestamptz   not null default now()
);

create index if not exists admin_events_email_idx
  on public.admin_events (admin_email);

create index if not exists admin_events_occurred_idx
  on public.admin_events (occurred_at desc);

-- ---------------------------------------------------------------------
-- RLS — locked down. The dashboard talks via service-role only.
-- ---------------------------------------------------------------------
alter table public.admin_users  enable row level security;
alter table public.admin_events enable row level security;

-- ---------------------------------------------------------------------
-- Bootstrap: replace the email below with YOUR address, then re-run.
-- We use an idempotent upsert so this migration is safe to apply twice.
-- ---------------------------------------------------------------------
insert into public.admin_users (email, role)
values ('hello@opticksaudio.com', 'owner')
on conflict (email) do nothing;
