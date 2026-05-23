import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/admin/auth";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata: Metadata = {
  title: "Admin · Opticks Audio",
  robots: { index: false, follow: false },
};

/**
 * Gated admin layout — wraps every protected /admin/* page.
 *
 * Login + magic-link-callback routes live under the (admin-public)
 * route group instead, so they bypass this layout entirely and the
 * sign-in surface stays clean.
 *
 * Two gates protect what lives below:
 *   1. Middleware (src/middleware.ts) redirects unauthenticated
 *      requests to /admin/login.
 *   2. getAdmin() additionally enforces admin_users membership so an
 *      authenticated user whose email isn't allow-listed is bounced.
 */
export default async function AdminGatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getAdmin();
  if (!admin) {
    redirect("/admin/login?error=unauthorized");
  }
  return <AdminShell admin={admin}>{children}</AdminShell>;
}
