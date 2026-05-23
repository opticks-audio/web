# Admin dashboard — Phase 2B

A private control surface at **`/admin`** for managing the audience
and watching the download pipeline. Passwordless: every sign-in is a
Supabase magic link, every signed-in admin is double-checked against
an explicit `admin_users` allow-list.

---

## Who can sign in

Two checks must both succeed before any `/admin/*` page (other than
`/admin/login` and the auth callback) renders:

1. The request carries a valid Supabase Auth session cookie.
2. The session's email exists in `public.admin_users` and is not
   revoked (`revoked_at IS NULL`).

If either fails the user is bounced to `/admin/login` and any partial
session is signed out so an unauthorised email can never sit on a
valid cookie. We deliberately surface the **same** error code in every
failure path — we don't leak whether the email is on the allow-list.

---

## Surfaces

| Route | What it shows |
|---|---|
| `/admin/login` | Magic-link sign-in form |
| `/admin/auth/callback` | Exchanges OTP / PKCE code, gates, redirects |
| `/admin` | Live metrics: subscribers by status, conversion rate, new sign-ups (7d), download grants (24h / total), click events (24h) |
| `/admin/subscribers` | Paginated table with search + status filter + CSV export |
| `/admin/downloads` | Audit log of every `download_grants` row |
| `/admin/releases` | Read-only catalog snapshot of `plugin_releases` |
| `/admin/settings` | Allow-listed admins + last 50 `admin_events` |

CSV export is served by `/api/admin/subscribers/export` (auth-gated,
audit-logged, RFC-4180-style quoting, up to 50 000 rows).

---

## Bootstrap

Inviting the first owner is the bottom of `0003_admin.sql`:

```sql
insert into public.admin_users (email, role)
values ('YOUR_EMAIL@example.com', 'owner')
on conflict (email) do nothing;
```

**Replace the email before running the migration.** The placeholder
`hello@opticksaudio.com` is intentionally non-functional.

After that, inviting more admins is one statement (see CLAUDE.md →
"Invite another admin").

---

## Email + Supabase Auth configuration

Supabase Dashboard → **Authentication → URL Configuration**:

- **Site URL** → `https://opticksaudio.com`
- **Redirect URLs** → add both:
  - `https://opticksaudio.com/admin/auth/callback`
  - `http://localhost:3000/admin/auth/callback`

Magic links expire after **5 minutes**. The login page already
surfaces a friendly "your link expired" message when Supabase returns
`otp_expired`.

The first email a brand-new address ever receives is the signup
confirmation template (`token_hash + type=signup`). Every subsequent
login uses the PKCE flow (`code`). The callback handler in
`src/app/(admin-public)/admin/auth/callback/route.ts` accepts both
shapes transparently.

---

## Audit log

Every consequential admin action writes a row to `admin_events`:

| action | written by |
|---|---|
| `sign_in` | `/admin/auth/callback` after a successful exchange |
| `subscribers_export` | `/api/admin/subscribers/export` |

`/admin/settings` shows the most recent 50. The table is append-only;
deletion is not supported by design.

---

## Threat model summary

- **Stolen Supabase session for an outside email** → blocked by the
  layout-side `getAdmin()` check.
- **Replay of an old magic link** → Supabase invalidates the token on
  first use; expired tokens get an `otp_expired` error that the
  login page renders nicely.
- **CSRF on a destructive admin action** → no destructive endpoints
  exist today. When they ship (Phase 2C onwards) they will be POST
  routes that verify the Supabase session AND a per-form CSRF token.
- **Service-role key exposure** → only ever imported via
  `src/lib/supabase/admin.ts`, which has no client entry point. No
  bundle includes it.
- **Inspection by a curious anonymous user** → `/admin/*` is excluded
  from the sitemap and `<meta name="robots" content="noindex">` is
  set on every admin page.
