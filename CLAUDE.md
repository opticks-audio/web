@AGENTS.md

# Opticks Audio — Web (Next.js)

> Marketing site + commerce backbone for **Opticks Audio**. The DSP /
> plug-in monorepo lives at `../opticks-dsp/`. **Read
> `../opticks-dsp/CLAUDE.md` for the wider picture of the company**
> before touching this repo.

---

## Status snapshot (latest)

| Surface | State |
|---|---|
| Marketing site (`/`, `/plugins/[slug]`) | ✅ Live on `opticksaudio.com` |
| Waitlist (signup → confirm → welcome) | ✅ Live (Phase 1) |
| Signed downloads from R2 | ✅ Live (Phase 2A) |
| Admin dashboard `/admin` | ✅ Live (Phase 2B) — magic-link auth |
| Plug-in builds in R2 | ✅ v0.1.0 of all three (mac VST3) |
| `plugin_releases` catalog | ✅ All three marked `is_current` |
| Release publishing UI in `/admin` | ⏳ Phase 2C (next) |
| Broadcasts (mass email to confirmed subs) | ⏳ Phase 2D |
| Download click telemetry webhook | ⏳ Phase 2E |
| Stripe / Lemon Squeezy paid checkout | ⏳ Future |

Last reviewed: 2026-05-23. Latest commit on `main`: `7ccee9f`.

---

## Stack

- **Next.js 16** (App Router, Turbopack) · React 19 · TypeScript
- **Tailwind CSS v4**
- **React Three Fiber + drei** (3D prism scene in Hero)
- **motion** + **GSAP** for animations
- **Supabase** (Postgres + Auth) — single project `izdomyvnavdipkijdvdy`
- **Resend** for transactional email (React Email templates)
- **Cloudflare R2** for plug-in artefacts (S3-compatible)
- **Vercel** for hosting + edge proxy

---

## What this site sells

The **Opticks Collection** — three flagship plug-ins:

- **REFLEXION** — algorithmic reverb (light reflecting between surfaces)
- **REFRACTION** — tape-style spatial delay (light bending through a prism)
- **INFLEXION** — dynamics processor (curvature of motion)

Plug-in metadata is the single source of truth in `src/lib/plugins.ts` —
the home page collection grid and the dynamic `/plugins/[slug]` page
both read from it.

Plug-in **release** metadata (version + R2 platform availability) is the
source of truth in the Supabase `plugin_releases` table, NOT in code.
The site reads the row where `is_current = true` at request time.

---

## Running locally

```bash
cd /Users/ricardocordero/Downloads/opticks-audio
npm install
npm run dev          # http://localhost:3000
npm run build        # production build (TS + Next)
npx tsc --noEmit     # type check only
```

`.env.local` is gitignored. The canonical variable list lives in
`.env.example` (committed). Required for full operation:

```
NEXT_PUBLIC_SITE_URL
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
RESEND_API_KEY
RESEND_FROM_EMAIL          (default: hello@opticksaudio.com)
RESEND_FROM_NAME           (default: Opticks Audio)
WAITLIST_SECRET            (HMAC pepper for signed unsubscribe links)
R2_ACCOUNT_ID
R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY
R2_BUCKET                  (default: opticks-audio-releases)
R2_ENDPOINT
```

All of the above are also configured in Vercel's project settings
(Production + Preview + Development).

---

## Architecture map

### `src/app/`

- `(public)` routes — implicit, no route group folder needed for the
  marketing pages.
- `(admin-public)/admin/login` — magic-link sign-in surface.
- `(admin-public)/admin/auth/callback` — exchanges code/OTP for a
  Supabase session. Verifies `admin_users` membership; kills the
  session immediately if the email isn't allow-listed.
- `(admin-gated)/admin/*` — every protected admin page. Layout
  enforces `getAdmin()` server-side.
- `api/waitlist/{subscribe,confirm,unsubscribe}` — Phase 1.
- `api/downloads/request` — Phase 2A.
- `api/admin/subscribers/export` — Phase 2B (CSV export).

### `src/lib/`

- `env.ts` — zod-validated env access. Public env eager, server env
  lazy + cached.
- `plugins.ts` — static plug-in catalog (name, slug, copy, status).
- `r2.ts` — S3-compatible R2 client + `pluginObjectKey()` + presign
  helper. The HEAD-then-sign flow guarantees we never email a 404 link.
- `supabase/admin.ts` — service-role client. RLS bypass. Never expose
  to the browser.
- `supabase/server.ts` — anon-key client bound to request cookies.
  RLS still applies. Use this for any session-aware server code.
- `admin/auth.ts` — `getAdmin()` + `logAdminEvent()`.
- `waitlist/` — HMAC signing, rate limiter, email wrappers.

### `src/components/`

- `hero/PrismScene.tsx` — R3F prism. Brand centrepiece. Keep light:
  no heavy shaders, no per-frame allocations.
- `product/DownloadButtons.tsx` — beta plug-ins reveal the inline
  `DownloadsForm`; coming-soon plug-ins open `WaitlistModal`.
- `product/DownloadsForm.tsx` — posts to `/api/downloads/request`.
- `admin/AdminShell.tsx` + `AdminNav.tsx` + `SignOutButton.tsx` — the
  signed-in admin chrome.

### `src/proxy.ts`

Next.js 16 edge proxy (formerly `middleware.ts`). Two jobs:
1. Refresh Supabase cookies via `@supabase/ssr` so server components
   always see a fresh session.
2. Redirect unauthenticated `/admin/*` requests to `/admin/login`,
   except `/admin/login` itself and `/admin/auth/*` (those are public
   so the magic-link flow can land).

### `supabase/migrations/`

Run in this order against the Supabase project:

1. `0001_waitlist.sql` — `subscribers`, `subscriber_events`, indexes.
2. `0002_downloads.sql` — `plugin_releases`, `download_grants`,
   `download_events`. Seeds v0.1.0 rows for all three plug-ins.
3. `0003_admin.sql` — `admin_users`, `admin_events`. Bootstrap inserts
   the first owner — **edit the email at the bottom before running**.

### `scripts/`

- `package-release.sh` — bundles the installed VST3 (and AU when
  present) into per-plug-in `.zip` archives plus a README. Usage:
  `bash scripts/package-release.sh 0.1.0` → output in
  `~/Downloads/opticks-releases/v0.1.0/`.

---

## Operating the system

### Release a new plug-in version

```bash
# 1. Compile your plug-ins in opticks-dsp (Xcode / CMake).
#    The installer should drop them into ~/Library/Audio/Plug-Ins/VST3/.

# 2. Package them.
cd ~/Downloads/opticks-audio
bash scripts/package-release.sh 0.2.0

# 3. Upload the resulting .zip files to R2 under the layout:
#      opticks-audio-releases/<slug>/v<version>/<Name>-mac-v<version>.zip
#    Cloudflare dashboard → R2 → opticks-audio-releases.

# 4. In Supabase SQL editor, switch the current release:
update plugin_releases set is_current = false where slug = 'reflexion';
insert into plugin_releases (slug, version, platforms, release_notes, is_current)
values ('reflexion', '0.2.0', '{mac}', 'Notes...', true)
on conflict (slug, version) do update
  set is_current = true, release_notes = excluded.release_notes;
```

(Step 4 becomes a `/admin/releases/new` form in Phase 2C.)

### Invite another admin

```sql
insert into public.admin_users (email, role)
values ('teammate@example.com', 'admin');
```

They go to `/admin/login`, request a link, and they're in.

### Revoke an admin

```sql
update public.admin_users
   set revoked_at = now()
 where email = 'former-teammate@example.com';
```

(Soft-delete; keeps the audit trail intact.)

### Export the subscriber list

`/admin/subscribers` → **Export CSV** button (top right). Audit-logged
to `admin_events`.

---

## Conventions

- All brand references use **"Opticks Audio"** (never `nexgen` — that
  name is fully deprecated).
- The 3D prism scene in `src/components/hero/PrismScene.tsx` is the
  centrepiece of the brand identity. Keep it performant; do not add
  heavy shaders.
- `/plugins/[slug]` is rendered statically via `generateStaticParams()`.
  Don't break that.
- All `/api/*` routes use `runtime = "nodejs"` and
  `dynamic = "force-dynamic"`. We do not need Edge for any of them and
  the AWS SDK / Resend SDK are happier on Node.
- Comments document **why**, never **what**. The code is already there
  to say what.
- No emojis in code or commit messages (the user dislikes them).
- Never add password-based auth. Magic links only.

---

## Security posture

- **Anti-enumeration**: `/api/downloads/request` and `/api/waitlist/*`
  return identical neutral responses whether or not the supplied email
  is on file. We never leak list membership.
- **Rate limiting**: 3 download requests / minute / IP, 5 subscribe
  requests / minute / IP. IPs are stored hashed (`hashIp()` via
  `WAITLIST_SECRET`).
- **Honeypot field**: `website` form field is invisible; bots fill it
  and get a silent success.
- **Signed URLs**: every R2 download URL is presigned with a 24h TTL
  and bound to a specific `<slug>/v<version>/<file>.zip` key. They are
  never persisted in the DB — only the `download_grants` audit row is.
- **Admin double-gate**: edge proxy enforces "must be signed in";
  layout enforces "must be in `admin_users`". An attacker who steals a
  Supabase session for a non-admin email still cannot reach the
  dashboard.
- **Service-role isolation**: the service-role key only ever runs
  server-side. `supabase/admin.ts` is the single import surface.
- **RLS locked down**: all custom tables have RLS enabled with zero
  policies — the only path in is via service-role.

---

## Known follow-ups

### Commercial positioning
- **First**: ship the premium skeuomorphic UI for all three plug-ins
  in `../opticks-dsp/` (Session 002 — see its `NEXT_SESSION.md`).
- **Then**: come back and execute `UPGRADE_PLAN.md` Phase A
  (screenshots, pricing, editorial scarcity) using the new screenshots
  as the centrepiece.
- See `UPGRADE_PLAN.md` for the full sequencing rationale + Phase B/C.

### Engineering follow-ups
- Phase 2C: `/admin/releases/new` form (upload .zip → R2 →
  `plugin_releases` row → set as current — all in one click).
- Phase 2D: `/admin/broadcasts` for mass email to confirmed
  subscribers, with React Email templates and Resend.
- Phase 2E: `/api/downloads/track` redirect that wraps each signed R2
  URL so we can record click events in `download_events`.
- Bot mitigation upgrade: Turnstile on `/api/waitlist/subscribe`.
- Move long-running CSV exports behind a streaming RPC once
  `subscribers` crosses ~50k rows.
