import Link from "next/link";
import type { Admin } from "@/lib/admin/auth";
import { AdminNav } from "./AdminNav";
import { SignOutButton } from "./SignOutButton";

/**
 * Shell that wraps every gated admin page.
 *
 * Editorial intent:
 *   - Single sidebar nav (no top bar). Keeps focus on the data.
 *   - Header strip on the right shows the admin email + sign-out, so
 *     there's never doubt about which session you're driving.
 *   - The page itself controls its own padding and max-width to let
 *     wide data tables breathe.
 */
export function AdminShell({
  admin,
  children,
}: {
  admin: Admin;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden w-60 shrink-0 border-r border-[var(--border)] bg-[var(--background-elevated)]/40 px-4 py-8 md:flex md:flex-col">
          <Link
            href="/admin"
            className="mb-10 inline-flex items-center gap-2 px-2 text-xs uppercase tracking-[0.22em] text-[var(--foreground-muted)] transition hover:text-[var(--foreground)]"
          >
            <span
              className="h-1.5 w-6 rounded-full"
              style={{
                background:
                  "linear-gradient(90deg, var(--spectrum-violet), var(--spectrum-cyan))",
              }}
            />
            Opticks Admin
          </Link>

          <AdminNav />

          <div className="mt-auto rounded-2xl border border-[var(--border)] bg-[var(--background-elevated)]/40 p-3 text-xs">
            <div className="mb-1 uppercase tracking-[0.18em] text-[var(--foreground-subtle)]">
              Signed in
            </div>
            <div className="truncate font-mono text-[var(--foreground)]">
              {admin.email}
            </div>
            <div className="mt-1 text-[var(--foreground-muted)]">
              Role · <span className="uppercase">{admin.role}</span>
            </div>
            <SignOutButton />
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 px-6 py-10 md:px-10 md:py-12">{children}</main>
      </div>
    </div>
  );
}
