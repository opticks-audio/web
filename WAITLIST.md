# Waitlist & Email — Phase 1

This document describes the marketing/waitlist infrastructure that lives
inside the Opticks Audio web app. It is the foundation of the future
licensing, payments and download systems (Phase 2+).

## Architecture

```
Browser
   │  POST /api/waitlist/subscribe
   ▼
Next.js API route
   │  validate + rate limit + upsert
   ▼
Supabase (Postgres + RLS)
   │  status = 'pending'
   ▼
Resend
   │  sends "Confirm your email"
   ▼
User clicks confirmation link
   │  GET /api/waitlist/confirm?token=...
   ▼
Supabase  →  status = 'confirmed'
Resend    →  sends "Welcome to Opticks Audio"
```

## Files

```
src/
├── app/
│   ├── api/waitlist/
│   │   ├── subscribe/route.ts        # POST: create / re-issue confirmation
│   │   ├── confirm/route.ts          # GET : finalize double opt-in
│   │   └── unsubscribe/route.ts      # GET/POST: List-Unsubscribe support
│   └── waitlist/
│       ├── confirmed/page.tsx        # post-confirm landing
│       └── unsubscribe/page.tsx      # post-unsubscribe landing
├── components/
│   └── waitlist/
│       ├── WaitlistForm.tsx          # the reusable email + plugin form
│       └── WaitlistModal.tsx         # opens from "Notify me" buttons
├── emails/
│   ├── _shared.tsx                   # email layout + design tokens
│   ├── WaitlistConfirm.tsx           # double opt-in email
│   └── WaitlistWelcome.tsx           # post-confirm welcome
└── lib/
    ├── env.ts                        # typed env access (zod)
    ├── supabase/admin.ts             # server-only service-role client
    └── waitlist/
        ├── email.ts                  # Resend wrapper
        ├── signing.ts                # HMAC tokens (unsubscribe links)
        └── rate-limit.ts             # in-memory limiter

supabase/migrations/
└── 0001_waitlist.sql                 # schema (subscribers, events, RLS)
```

## Database schema

Run `supabase/migrations/0001_waitlist.sql` once against the project's
Postgres database. From the dashboard: SQL Editor → paste → Run.

Two tables are created:

- **`public.subscribers`** — one row per email. Tracks status
  (`pending → confirmed → unsubscribed`), the plugin(s) they care about,
  hashed IP for abuse defence, and basic attribution metadata.
- **`public.subscriber_events`** — append-only audit log of every state
  change (subscribed, confirmed, email_sent, etc.).

Row Level Security is enabled on both tables and there is **no public
read policy**. All access goes through the service-role key on the server.

## Environment variables

Copy `.env.example` → `.env.local` and fill in. The keys are validated at
runtime by `src/lib/env.ts` so a missing value fails fast with a clear
error message.

| Variable                          | Where to find it                            |
|-----------------------------------|---------------------------------------------|
| `NEXT_PUBLIC_SITE_URL`            | `http://localhost:3000` in dev, prod URL in prod |
| `NEXT_PUBLIC_SUPABASE_URL`        | Supabase → Settings → API Keys → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`   | Supabase → Settings → API Keys → Publishable key |
| `SUPABASE_SERVICE_ROLE_KEY`       | Supabase → Settings → API Keys → Secret keys (click reveal) |
| `RESEND_API_KEY`                  | https://resend.com/api-keys                 |
| `RESEND_FROM_EMAIL`               | An address on a verified Resend domain      |
| `RESEND_FROM_NAME`                | The friendly name shown in the inbox        |
| `WAITLIST_SECRET`                 | Generate with `openssl rand -hex 32`        |

## Production checklist before launch

- [ ] Verify `opticksaudio.com` in Resend (SPF, DKIM, DMARC records).
- [ ] Set DMARC policy to `p=quarantine` once everything is verified.
- [ ] In Cloudflare Pages, set all env vars (Production + Preview).
- [ ] Set `NEXT_PUBLIC_SITE_URL=https://opticksaudio.com` in production.
- [ ] Run the SQL migration on the Supabase project.
- [ ] Send yourself a test subscription and verify confirm + welcome arrive.
- [ ] Test the one-click unsubscribe from the welcome email.
- [ ] Confirm the honeypot (`website` field) is hidden in DevTools.

## Anti-abuse

- **Double opt-in.** Bots that scrape forms rarely click confirmation links.
- **Honeypot field.** A visually-hidden `website` input — bots fill it,
  humans don't.
- **In-memory rate limiter.** 5 subscriptions per IP per minute.
  Swap for Cloudflare Rate Limiting when Phase 2 lands.
- **Hashed IPs.** Stored as SHA-256(ip + secret) — useful for abuse
  analytics without storing PII.

## Future (Phase 2+)

- Stripe / Lemon Squeezy webhook → create `licenses` row.
- Add `auth.users` ↔ `subscribers.email` linkage.
- Cloudflare R2 signed-URL downloads gated by license check.
- Resend audience syncing for segmented broadcasts.
