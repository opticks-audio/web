import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 40;

type Search = Promise<{ page?: string; q?: string }>;

type GrantRow = {
  id: string;
  subscriber_email: string;
  plugins: string[];
  source: string;
  version_pins: Record<string, string>;
  created_at: string;
  expires_at: string;
};

async function loadGrants(params: { page: number; q?: string }) {
  const supa = supabaseAdmin();
  const from = params.page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let q = supa
    .from("download_grants")
    .select(
      "id, subscriber_email, plugins, source, version_pins, created_at, expires_at",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (params.q && params.q.length > 0) {
    q = q.ilike("subscriber_email", `%${params.q}%`);
  }

  const { data, count, error } = await q;
  if (error) {
    console.error("[admin.downloads] load error", error);
    return { rows: [] as GrantRow[], count: 0 };
  }
  return { rows: (data ?? []) as GrantRow[], count: count ?? 0 };
}

export default async function DownloadsAuditPage({
  searchParams,
}: {
  searchParams: Search;
}) {
  const sp = await searchParams;
  const page = Math.max(0, parseInt(sp.page ?? "0", 10) || 0);
  const q = sp.q ?? "";

  const { rows, count } = await loadGrants({ page, q });
  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  return (
    <div className="mx-auto w-full max-w-6xl">
      <header>
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-[var(--foreground-muted)]">
          <span
            className="h-1.5 w-6 rounded-full"
            style={{
              background:
                "linear-gradient(90deg, var(--spectrum-violet), var(--spectrum-cyan))",
            }}
          />
          Audit
        </div>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl tracking-tight text-[var(--foreground)]">
          Downloads
        </h1>
        <p className="mt-2 text-sm text-[var(--foreground-muted)]">
          Every signed-URL grant issued by{" "}
          <code className="font-mono text-[var(--foreground)]">
            /api/downloads/request
          </code>
          . Sorted by most recent first.
        </p>
      </header>

      <form action="/admin/downloads" className="mt-8 flex gap-3">
        <input
          name="q"
          defaultValue={q}
          placeholder="Filter by subscriber email"
          className="flex-1 rounded-full border border-[var(--border-strong)] bg-[var(--background-elevated)] px-5 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-subtle)] outline-none focus:border-white/30"
        />
        <button
          type="submit"
          className="rounded-full bg-[var(--foreground)] px-5 py-2.5 text-sm font-medium text-[var(--background)] transition hover:bg-white"
        >
          Filter
        </button>
      </form>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--background-elevated)]/40">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-left text-xs uppercase tracking-[0.18em] text-[var(--foreground-muted)]">
              <Th>When</Th>
              <Th>Email</Th>
              <Th>Plug-ins</Th>
              <Th>Versions</Th>
              <Th>Source</Th>
              <Th>Expires</Th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-sm text-[var(--foreground-muted)]">
                  No download grants yet.
                </td>
              </tr>
            )}
            {rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-[var(--border)]/50 last:border-0 transition hover:bg-[var(--background-elevated)]/60"
              >
                <Td>
                  <div
                    className="text-xs text-[var(--foreground-muted)]"
                    title={row.created_at}
                  >
                    {formatRelative(row.created_at)}
                  </div>
                </Td>
                <Td>
                  <div className="font-mono text-[var(--foreground)]">
                    {row.subscriber_email}
                  </div>
                </Td>
                <Td>
                  <div className="flex flex-wrap gap-1">
                    {row.plugins.map((p) => (
                      <span
                        key={p}
                        className="rounded-full border border-[var(--border)] px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-[var(--foreground)]"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </Td>
                <Td>
                  <div className="flex flex-wrap gap-1 text-[11px] font-mono text-[var(--foreground-muted)]">
                    {Object.entries(row.version_pins ?? {}).map(([k, v]) => (
                      <span key={k}>
                        {k}@{v}
                      </span>
                    ))}
                  </div>
                </Td>
                <Td>
                  <span className="text-xs text-[var(--foreground-muted)]">
                    {row.source}
                  </span>
                </Td>
                <Td>
                  <span
                    className={`text-xs ${new Date(row.expires_at) < new Date() ? "text-[var(--foreground-subtle)] line-through" : "text-[var(--foreground-muted)]"}`}
                  >
                    {formatRelative(row.expires_at)}
                  </span>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <nav className="mt-6 flex items-center justify-between text-xs uppercase tracking-[0.18em] text-[var(--foreground-muted)]">
          <Link
            href={`?page=${Math.max(0, page - 1)}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
            aria-disabled={page === 0}
            className={`rounded-full border border-[var(--border)] px-3 py-1.5 transition ${page === 0 ? "pointer-events-none opacity-40" : "hover:border-white/30 hover:text-[var(--foreground)]"}`}
          >
            ← Previous
          </Link>
          <span>
            Page {page + 1} of {totalPages} ({count.toLocaleString()} grants)
          </span>
          <Link
            href={`?page=${Math.min(totalPages - 1, page + 1)}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
            aria-disabled={page >= totalPages - 1}
            className={`rounded-full border border-[var(--border)] px-3 py-1.5 transition ${page >= totalPages - 1 ? "pointer-events-none opacity-40" : "hover:border-white/30 hover:text-[var(--foreground)]"}`}
          >
            Next →
          </Link>
        </nav>
      )}
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-5 py-3 font-medium">{children}</th>;
}
function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-5 py-3 align-middle">{children}</td>;
}

function formatRelative(iso: string): string {
  const date = new Date(iso);
  const diffMs = date.getTime() - Date.now();
  const future = diffMs > 0;
  const abs = Math.abs(diffMs);
  const min = Math.floor(abs / 60_000);
  const suffix = future ? "from now" : "ago";
  if (min < 1) return "just now";
  if (min < 60) return `${min} min ${suffix}`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} h ${suffix}`;
  const days = Math.floor(hr / 24);
  if (days < 30) return `${days} d ${suffix}`;
  return date.toLocaleDateString();
}
