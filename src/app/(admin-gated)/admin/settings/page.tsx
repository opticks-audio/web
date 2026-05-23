import { supabaseAdmin } from "@/lib/supabase/admin";
import { getAdmin } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

type AdminEventRow = {
  id: string;
  admin_email: string;
  action: string;
  occurred_at: string;
};

type AdminUserRow = {
  email: string;
  role: string;
  created_at: string;
  revoked_at: string | null;
};

async function load() {
  const supa = supabaseAdmin();
  const [users, events] = await Promise.all([
    supa
      .from("admin_users")
      .select("email, role, created_at, revoked_at")
      .order("created_at", { ascending: true }),
    supa
      .from("admin_events")
      .select("id, admin_email, action, occurred_at")
      .order("occurred_at", { ascending: false })
      .limit(50),
  ]);
  return {
    users: (users.data ?? []) as AdminUserRow[],
    events: (events.data ?? []) as AdminEventRow[],
  };
}

export default async function SettingsPage() {
  const me = await getAdmin();
  const { users, events } = await load();

  return (
    <div className="mx-auto w-full max-w-4xl">
      <header>
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-[var(--foreground-muted)]">
          <span
            className="h-1.5 w-6 rounded-full"
            style={{
              background:
                "linear-gradient(90deg, var(--spectrum-violet), var(--spectrum-cyan))",
            }}
          />
          Workspace
        </div>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl tracking-tight text-[var(--foreground)]">
          Settings
        </h1>
        <p className="mt-2 text-sm text-[var(--foreground-muted)]">
          Allow-listed admins and the most recent privileged actions.
        </p>
      </header>

      <section className="mt-10">
        <h2 className="text-xs uppercase tracking-[0.22em] text-[var(--foreground-muted)]">
          Allow-listed admins
        </h2>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--background-elevated)]/40">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-xs uppercase tracking-[0.18em] text-[var(--foreground-muted)]">
                <Th>Email</Th>
                <Th>Role</Th>
                <Th>Status</Th>
                <Th>Added</Th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isMe = me?.email === u.email;
                return (
                  <tr
                    key={u.email}
                    className="border-b border-[var(--border)]/50 last:border-0"
                  >
                    <Td>
                      <div className="font-mono text-[var(--foreground)]">
                        {u.email}
                        {isMe && (
                          <span className="ml-2 rounded-full border border-[var(--border)] px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-[var(--foreground-muted)]">
                            you
                          </span>
                        )}
                      </div>
                    </Td>
                    <Td>
                      <span className="text-xs uppercase tracking-[0.14em] text-[var(--foreground)]">
                        {u.role}
                      </span>
                    </Td>
                    <Td>
                      {u.revoked_at ? (
                        <span className="text-xs text-[var(--foreground-subtle)] line-through">
                          revoked
                        </span>
                      ) : (
                        <span className="text-xs text-emerald-300">active</span>
                      )}
                    </Td>
                    <Td>
                      <span className="text-xs text-[var(--foreground-muted)]">
                        {new Date(u.created_at).toLocaleDateString()}
                      </span>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-[var(--foreground-subtle)]">
          To invite a teammate today, add their email to{" "}
          <code className="font-mono">public.admin_users</code> in Supabase. A
          dedicated invite UI ships in the next phase.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="text-xs uppercase tracking-[0.22em] text-[var(--foreground-muted)]">
          Recent admin events
        </h2>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--background-elevated)]/40">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-xs uppercase tracking-[0.18em] text-[var(--foreground-muted)]">
                <Th>When</Th>
                <Th>Admin</Th>
                <Th>Action</Th>
              </tr>
            </thead>
            <tbody>
              {events.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-5 py-12 text-center text-sm text-[var(--foreground-muted)]">
                    No admin activity logged yet.
                  </td>
                </tr>
              )}
              {events.map((e) => (
                <tr
                  key={e.id}
                  className="border-b border-[var(--border)]/50 last:border-0"
                >
                  <Td>
                    <span className="text-xs text-[var(--foreground-muted)]">
                      {new Date(e.occurred_at).toLocaleString()}
                    </span>
                  </Td>
                  <Td>
                    <span className="font-mono text-[var(--foreground)]">
                      {e.admin_email}
                    </span>
                  </Td>
                  <Td>
                    <span className="text-xs uppercase tracking-[0.14em] text-[var(--foreground)]">
                      {e.action}
                    </span>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-5 py-3 font-medium">{children}</th>;
}
function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-5 py-3 align-middle">{children}</td>;
}
