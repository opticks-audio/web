import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;
const STATUSES = ["all", "pending", "confirmed", "unsubscribed", "bounced", "complained"] as const;

type Search = Promise<{
  q?: string;
  status?: string;
  page?: string;
}>;

type SubscriberRow = {
  id: string;
  email: string;
  status: string;
  source: string;
  interested_in: string[];
  created_at: string;
  confirmed_at: string | null;
  unsubscribed_at: string | null;
};

async function loadSubscribers(params: {
  q?: string;
  status?: string;
  page: number;
}) {
  const supa = supabaseAdmin();
  const from = params.page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supa
    .from("subscribers")
    .select(
      "id, email, status, source, interested_in, created_at, confirmed_at, unsubscribed_at",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (params.status && params.status !== "all") {
    query = query.eq("status", params.status);
  }
  if (params.q && params.q.length > 0) {
    query = query.ilike("email", `%${params.q}%`);
  }

  const { data, count, error } = await query;
  if (error) {
    console.error("[admin.subscribers] load error", error);
    return { rows: [] as SubscriberRow[], count: 0 };
  }
  return { rows: (data ?? []) as SubscriberRow[], count: count ?? 0 };
}

export default async function SubscribersPage({
  searchParams,
}: {
  searchParams: Search;
}) {
  const sp = await searchParams;
  const page = Math.max(0, parseInt(sp.page ?? "0", 10) || 0);
  const status = sp.status ?? "all";
  const q = sp.q ?? "";

  const { rows, count } = await loadSubscribers({ q, status, page });
  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  return (
    <div className="mx-auto w-full max-w-6xl">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-[var(--foreground-muted)]">
            <span
              className="h-1.5 w-6 rounded-full"
              style={{
                background:
                  "linear-gradient(90deg, var(--spectrum-violet), var(--spectrum-cyan))",
              }}
            />
            Audience
          </div>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl tracking-tight text-[var(--foreground)]">
            Subscribers
          </h1>
          <p className="mt-2 text-sm text-[var(--foreground-muted)]">
            {count.toLocaleString()} {count === 1 ? "person" : "people"} on the
            waitlist. Filter, search, or export to CSV.
          </p>
        </div>
        <a
          href={`/api/admin/subscribers/export${status !== "all" ? `?status=${status}` : ""}`}
          className="inline-flex items-center gap-2 rounded-full border border-[var(--border-strong)] bg-[var(--background-elevated)] px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-[var(--foreground)] transition hover:border-white/30 hover:bg-white/5"
        >
          Export CSV
        </a>
      </header>

      <form
        action="/admin/subscribers"
        className="mt-8 flex flex-col gap-3 sm:flex-row"
      >
        <input
          name="q"
          defaultValue={q}
          placeholder="Search by email"
          className="flex-1 rounded-full border border-[var(--border-strong)] bg-[var(--background-elevated)] px-5 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-subtle)] outline-none focus:border-white/30"
        />
        <select
          name="status"
          defaultValue={status}
          className="rounded-full border border-[var(--border-strong)] bg-[var(--background-elevated)] px-5 py-2.5 text-sm text-[var(--foreground)] outline-none focus:border-white/30"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s === "all" ? "All statuses" : s}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-full bg-[var(--foreground)] px-5 py-2.5 text-sm font-medium text-[var(--background)] transition hover:bg-white"
        >
          Apply
        </button>
      </form>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--background-elevated)]/40">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-left text-xs uppercase tracking-[0.18em] text-[var(--foreground-muted)]">
              <Th>Email</Th>
              <Th>Status</Th>
              <Th>Source</Th>
              <Th>Interests</Th>
              <Th>Joined</Th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-sm text-[var(--foreground-muted)]">
                  No subscribers match these filters.
                </td>
              </tr>
            )}
            {rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-[var(--border)]/50 last:border-0 transition hover:bg-[var(--background-elevated)]/60"
              >
                <Td>
                  <div className="font-mono text-[var(--foreground)]">
                    {row.email}
                  </div>
                </Td>
                <Td>
                  <StatusPill status={row.status} />
                </Td>
                <Td>
                  <span className="text-xs text-[var(--foreground-muted)]">
                    {row.source}
                  </span>
                </Td>
                <Td>
                  {row.interested_in.length === 0 ? (
                    <span className="text-xs text-[var(--foreground-subtle)]">
                      —
                    </span>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {row.interested_in.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-[var(--border)] px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-[var(--foreground-muted)]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </Td>
                <Td>
                  <span
                    className="text-xs text-[var(--foreground-muted)]"
                    title={row.created_at}
                  >
                    {formatRelative(row.created_at)}
                  </span>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={totalPages} q={q} status={status} />
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-5 py-3 font-medium">{children}</th>;
}
function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-5 py-3 align-middle">{children}</td>;
}

function StatusPill({ status }: { status: string }) {
  const colours: Record<string, string> = {
    confirmed: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    pending: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    unsubscribed: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
    bounced: "bg-rose-500/15 text-rose-300 border-rose-500/30",
    complained: "bg-rose-500/15 text-rose-300 border-rose-500/30",
  };
  const cls = colours[status] ?? "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
  return (
    <span
      className={`inline-block rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] ${cls}`}
    >
      {status}
    </span>
  );
}

function Pagination({
  page,
  totalPages,
  q,
  status,
}: {
  page: number;
  totalPages: number;
  q: string;
  status: string;
}) {
  if (totalPages <= 1) return null;
  const make = (p: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (status && status !== "all") params.set("status", status);
    params.set("page", String(p));
    return `?${params.toString()}`;
  };
  return (
    <nav className="mt-6 flex items-center justify-between text-xs uppercase tracking-[0.18em] text-[var(--foreground-muted)]">
      <Link
        href={make(Math.max(0, page - 1))}
        aria-disabled={page === 0}
        className={`rounded-full border border-[var(--border)] px-3 py-1.5 transition ${page === 0 ? "pointer-events-none opacity-40" : "hover:border-white/30 hover:text-[var(--foreground)]"}`}
      >
        ← Previous
      </Link>
      <span>
        Page {page + 1} of {totalPages}
      </span>
      <Link
        href={make(Math.min(totalPages - 1, page + 1))}
        aria-disabled={page >= totalPages - 1}
        className={`rounded-full border border-[var(--border)] px-3 py-1.5 transition ${page >= totalPages - 1 ? "pointer-events-none opacity-40" : "hover:border-white/30 hover:text-[var(--foreground)]"}`}
      >
        Next →
      </Link>
    </nav>
  );
}

function formatRelative(iso: string): string {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const min = Math.floor(diffMs / 60_000);
  if (min < 1) return "just now";
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} h ago`;
  const days = Math.floor(hr / 24);
  if (days < 7) return `${days} d ago`;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
