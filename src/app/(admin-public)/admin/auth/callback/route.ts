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
 * Supabase's email contains a URL like:
 *   https://opticksaudio.com/admin/auth/callback?code=...&next=/admin
 *
 * We exchange the code for a session, then:
 *   - If the verified email IS in admin_users, redirect to ?next.
 *   - If NOT, sign them straight back out and redirect to /admin/login
 *     with an `error=unauthorized` flag so the UI can render a clean
 *     "your address is not authorised" message. Crucially, we DON'T
 *     leak whether the email exists in admin_users — the same error
 *     code is returned in every failure path.
 */
export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/admin";

  const loginUrl = url.clone();
  loginUrl.pathname = "/admin/login";
  loginUrl.search = "";

  if (!code) {
    loginUrl.searchParams.set("error", "missing_code");
    return NextResponse.redirect(loginUrl);
  }

  const supa = await supabaseServer();
  const { data, error } = await supa.auth.exchangeCodeForSession(code);
  if (error || !data.user?.email) {
    loginUrl.searchParams.set("error", "exchange_failed");
    return NextResponse.redirect(loginUrl);
  }

  const email = data.user.email.toLowerCase();

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
