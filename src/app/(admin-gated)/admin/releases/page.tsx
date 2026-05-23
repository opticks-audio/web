import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type ReleaseRow = {
  id: string;
  slug: string;
  version: string;
  platforms: string[];
  release_notes: string | null;
  is_current: boolean;
  released_at: string;
};

async function loadReleases(): Promise<ReleaseRow[]> {
  const supa = supabaseAdmin();
  const { data, error } = await supa
    .from("plugin_releases")
    .select("id, slug, version, platforms, release_notes, is_current, released_at")
    .order("released_at", { ascending: false });
  if (error) return [];
  return (data ?? []) as ReleaseRow[];
}

export default async function ReleasesPage() {
  const releases = await loadReleases();

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
          Catalog
        </div>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl tracking-tight text-[var(--foreground)]">
          Releases
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--foreground-muted)]">
          Snapshot of <code className="font-mono">plugin_releases</code>. To
          publish a new version, upload the artefact to R2 first, then insert
          a row with{" "}
          <code className="font-mono">is_current = true</code> (publishing UI
          ships in the next phase).
        </p>
      </header>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--background-elevated)]/40">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-left text-xs uppercase tracking-[0.18em] text-[var(--foreground-muted)]">
              <Th>Plug-in</Th>
              <Th>Version</Th>
              <Th>Platforms</Th>
              <Th>Status</Th>
              <Th>Released</Th>
            </tr>
          </thead>
          <tbody>
            {releases.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-sm text-[var(--foreground-muted)]">
                  No releases yet.
                </td>
              </tr>
            )}
            {releases.map((r) => (
              <tr
                key={r.id}
                className="border-b border-[var(--border)]/50 last:border-0 transition hover:bg-[var(--background-elevated)]/60"
              >
                <Td>
                  <div className="uppercase tracking-[0.18em] text-[var(--foreground)]">
                    {r.slug}
                  </div>
                  {r.release_notes && (
                    <div className="mt-1 text-xs text-[var(--foreground-muted)]">
                      {r.release_notes}
                    </div>
                  )}
                </Td>
                <Td>
                  <span className="font-mono text-[var(--foreground)]">
                    v{r.version}
                  </span>
                </Td>
                <Td>
                  <div className="flex flex-wrap gap-1">
                    {r.platforms.map((p) => (
                      <span
                        key={p}
                        className="rounded-full border border-[var(--border)] px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-[var(--foreground-muted)]"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </Td>
                <Td>
                  {r.is_current ? (
                    <span className="inline-block rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-emerald-300">
                      Current
                    </span>
                  ) : (
                    <span className="inline-block rounded-full border border-zinc-500/20 bg-zinc-500/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-zinc-400">
                      Archived
                    </span>
                  )}
                </Td>
                <Td>
                  <span className="text-xs text-[var(--foreground-muted)]">
                    {new Date(r.released_at).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-5 py-3 font-medium">{children}</th>;
}
function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-5 py-3 align-middle">{children}</td>;
}
