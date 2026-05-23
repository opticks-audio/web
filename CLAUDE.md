@AGENTS.md

# Opticks Audio — Web (Next.js)

> Marketing site for **Opticks Audio**. The DSP / plug-in monorepo lives at
> `../opticks-dsp/`. **Read `../opticks-dsp/CLAUDE.md` for the bigger
> picture of the company** before touching this repo.

## Stack

- Next.js 16 (App Router) · React 19 · TypeScript
- Tailwind CSS v4
- React Three Fiber + drei (3D prism scene in Hero)
- motion + GSAP for animations

## What this site sells

The **Opticks Collection** — three flagship plug-ins:

- **REFLEXION** — algorithmic reverb (light reflecting between surfaces)
- **REFRACTION** — tape-style spatial delay (light bending through a prism)
- **INFLEXION** — dynamics processor (curvature of motion)

Plug-in metadata is the single source of truth in `src/lib/plugins.ts` —
the home page collection grid and the dynamic `/plugins/[slug]` page both
read from it.

## Running locally

```bash
cd /Users/ricardocordero/Downloads/opticks-audio
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

## Conventions

- All brand references use **"Opticks Audio"** (never `nexgen` — that name
  is fully deprecated). The migration from `nexgen-web` to `opticks-audio`
  was completed in Session 001 of the DSP project (see
  `../opticks-dsp/SESSION_LOG.md`).
- The 3D prism scene in `src/components/hero/PrismScene.tsx` is the
  centrepiece of the brand identity. Keep it performant; do not add heavy
  shaders.
- The plug-in detail page (`src/app/plugins/[slug]/page.tsx`) is rendered
  statically via `generateStaticParams()`. Don't break that.

## Waitlist (Phase 1) — current state

The full waitlist infrastructure is **built and compiles**, but is NOT
live yet because two external dependencies are pending. See
`WAITLIST.md` for the architecture deep-dive.

### What is done
- Supabase project created (`izdomyvnavdipkijdvdy`). URL + publishable
  key + secret key are in `.env.local` (gitignored).
- Database migration written: `supabase/migrations/0001_waitlist.sql`.
- API routes: `/api/waitlist/subscribe`, `/api/waitlist/confirm`,
  `/api/waitlist/unsubscribe`.
- UI: `WaitlistForm`, `WaitlistModal`, wired into CTA section and
  `DownloadButtons` (clicking a disabled download opens the modal).
- Email templates with React Email + Resend wrapper.
- Landing pages: `/waitlist/confirmed`, `/waitlist/unsubscribe`.

### ⚠️ BLOCKERS — pending user action

These two steps must happen before the waitlist works end-to-end:

1. **Run the SQL migration in Supabase.**
   - Open https://supabase.com/dashboard/project/izdomyvnavdipkijdvdy/sql/new
   - Paste contents of `supabase/migrations/0001_waitlist.sql`
   - Click "Run". Expect "Success. No rows returned."

2. **Resend — needs paid plan OR separate account.**
   - User's Resend account (`keechupp28`) already uses its 1 free
     domain for another project (`amazing.mx`).
   - To add `opticksaudio.com`, user must EITHER:
     - **Upgrade Resend to Pro ($20/mo)** — allows 10 domains, OR
     - **Create a second Resend account** with a different email
       (e.g. via `tuemail+opticks@gmail.com` gmail trick) and verify
       `opticksaudio.com` there.
   - Once verified, create an API key scoped to `opticksaudio.com`
     ("Sending access" permission only) and paste it into
     `RESEND_API_KEY` in `.env.local`.
   - Cloudflare Email Routing should be set up at the same time so
     `hello@opticksaudio.com` and `beta@opticksaudio.com` forward to
     the user's personal inbox. ⚠️ Combine SPF records into a single
     line (`v=spf1 include:amazonses.com include:_spf.mx.cloudflare.net ~all`)
     to avoid breaking Resend deliverability.

### Files to look at when resuming
- `WAITLIST.md` — full architecture + production checklist.
- `.env.local` — has Supabase credentials filled in, Resend pending.
- `.env.example` — committed template for the same vars.
- `supabase/migrations/0001_waitlist.sql` — schema to run.

### Phase 2 (not started)
- Stripe / Lemon Squeezy checkout → license generation
- Cloudflare R2 signed-URL downloads
- License-key activation API (machine_id + max 3 activations)
- See WAITLIST.md "Future" section
