import { NextResponse, type NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { logAdminEvent } from "@/lib/admin/auth";
import { hashIp } from "@/lib/waitlist/signing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Magic-link landing page.
 *
 * Supabase emails this endpoint with one of two URL shapes depending on
 * the flow that was used:
 *   1. PKCE flow:   ?code=...
 *   2. OTP/Signup:  ?token_hash=...&type=magiclink|signup|email
 *
 * The first time an email touches Supabase Auth it gets the signup-
 * style "Confirm your email" template (token_hash + type=signup). All
 * subsequent magic-link requests get the PKCE flow with `code`. We
 * handle both transparently so the user never sees a difference.
 *
 * After the session is established we:
 *   - Verify the email is present (and not revoked) in admin_users.
 *   - If it isn't, kill the session immediately and bounce to login
 *     with `error=unauthorized` so unauthorised people can't sit on a
 *     valid cookie. The same error code is returned in every failure
 *     path so we don't leak admin_users membership.
 */
export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const tokenType = url.searchParams.get("type");
  const next = url.searchParams.get("next") ?? "/admin";

  const loginUrl = url.clone();
  loginUrl.pathname = "/admin/login";
  loginUrl.search = "";

  if (!code && !tokenHash) {
    loginUrl.searchParams.set("error", "missing_code");
    return NextResponse.redirect(loginUrl);
  }

  const supa = await supabaseServer();

  let email: string | null = null;
  if (code) {
    const { data, error } = await supa.auth.exchangeCodeForSession(code);
    if (error || !data.user?.email) {
      loginUrl.searchParams.set("error", "exchange_failed");
      return NextResponse.redirect(loginUrl);
    }
    email = data.user.email.toLowerCase();
  } else if (tokenHash) {
    // OTP / signup confirmation flow. `type` arrives lowercased from
    // Supabase: "magiclink" | "signup" | "email" | "recovery".
    const type =
      (tokenType as "magiclink" | "signup" | "email" | "recovery" | null) ??
      "magiclink";
    const { data, error } = await supa.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });
    if (error || !data.user?.email) {
      loginUrl.searchParams.set("error", "exchange_failed");
      return NextResponse.redirect(loginUrl);
    }
    email = data.user.email.toLowerCase();
  }

  if (!email) {
    loginUrl.searchParams.set("error", "exchange_failed");
    return NextResponse.redirect(loginUrl);
  }

  // Verify admin membership. Service-role bypass — we already trust
  // the email because Supabase Auth just verified the magic link.
  const adminDb = supabaseAdmin();
  const { data: row } = await adminDb
    .from("admin_users")
    .select("role, revoked_at")
    .eq("email", email)
    .maybeSingle();

  if (!row || row.revoked_at !== null) {
    // Drop the freshly-created session immediately so an unauthorised
    // email can't sit around with valid cookies.
    await supa.auth.signOut();
    loginUrl.searchParams.set("error", "unauthorized");
    return NextResponse.redirect(loginUrl);
  }

  const fwd = req.headers.get("x-forwarded-for") ?? "";
  const ip = fwd.split(",")[0]?.trim() || null;
  await logAdminEvent({
    adminEmail: email,
    action: "sign_in",
    payload: { method: "magic_link" },
    ip: ip ? hashIp(ip) : null,
    userAgent: req.headers.get("user-agent"),
  });

  const dest = url.clone();
  dest.pathname = next.startsWith("/admin") ? next : "/admin";
  dest.search = "";
  return NextResponse.redirect(dest);
}
