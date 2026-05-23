import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * What a verified admin looks like on the server. Anything outside this
 * shape is a "not signed in" or "not authorised" result.
 */
export type Admin = {
  email: string;
  role: "owner" | "admin" | "viewer";
  userId: string;
};

/**
 * Resolve the currently signed-in admin, if any.
 *
 * Two checks must both pass:
 *   1. There's a valid Supabase Auth session in the request cookies.
 *   2. The session's email is present (and not revoked) in
 *      public.admin_users.
 *
 * Returns null in any other case. Callers (pages, route handlers,
 * middleware) decide how to react — typically by redirecting to
 * /admin/login.
 */
export async function getAdmin(): Promise<Admin | null> {
  const supa = await supabaseServer();
  const {
    data: { user },
  } = await supa.auth.getUser();

  if (!user || !user.email) return null;

  const email = user.email.toLowerCase();
  const admin = supabaseAdmin();

  const { data, error } = await admin
    .from("admin_users")
    .select("role, revoked_at")
    .eq("email", email)
    .maybeSingle();

  if (error || !data) return null;
  if (data.revoked_at !== null) return null;

  return {
    email,
    role: data.role as Admin["role"],
    userId: user.id,
  };
}

/**
 * Append-only audit log entry. Fire-and-forget — errors are swallowed
 * because failing to log should never block the action itself.
 */
export async function logAdminEvent(params: {
  adminEmail: string;
  action: string;
  payload?: Record<string, unknown>;
  ip?: string | null;
  userAgent?: string | null;
}): Promise<void> {
  try {
    const admin = supabaseAdmin();
    await admin.from("admin_events").insert({
      admin_email: params.adminEmail,
      action: params.action,
      payload: params.payload ?? {},
      ip_hash: params.ip ?? null,
      user_agent: params.userAgent ?? null,
    });
  } catch (err) {
    console.error("[admin.audit] failed", err);
  }
}
