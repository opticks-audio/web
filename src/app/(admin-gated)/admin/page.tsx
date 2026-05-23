import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type Metrics = {
  subscribersTotal: number;
  subscribersConfirmed: number;
  subscribersPending: number;
  subscribersUnsubscribed: number;
  downloadGrants24h: number;
  downloadGrantsTotal: number;
  downloadEvents24h: number;
  newSubscribers7d: number;
};

async function loadMetrics(): Promise<Metrics> {
  const supa = supabaseAdmin();

  // Run the counts in parallel — each one is a tiny aggregate query.
  const [
    total,
    confirmed,
    pending,
    unsub,
    grants24,
    grantsTotal,
    events24,
    new7d,
  ] = await Promise.all([
    supa.from("subscribers").select("id", { count: "exact", head: true }),
    supa
      .from("subscribers")
      .select("id", { count: "exact", head: true })
      .eq("status", "confirmed"),
    supa
      .from("subscribers")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    supa
      .from("subscribers")
      .select("id", { count: "exact", head: true })
      .eq("status", "unsubscribed"),
    supa
      .from("download_grants")
      .select("id", { count: "exact", head: true })
      .gte("created_at", new Date(Date.now() - 86_400_000).toISOString()),
    supa.from("download_grants").select("id", { count: "exact", head: true }),
    supa
      .from("download_events")
      .select("id", { count: "exact", head: true })
      .gte("occurred_at", new Date(Date.now() - 86_400_000).toISOString()),
    supa
      .from("subscribers")
      .select("id", { count: "exact", head: true })
      .gte("created_at", new Date(Date.now() - 7 * 86_400_000).toISOString()),
  ]);

  return {
    subscribersTotal: total.count ?? 0,
    subscribersConfirmed: confirmed.count ?? 0,
    subscribersPending: pending.count ?? 0,
    subscribersUnsubscribed: unsub.count ?? 0,
    downloadGrants24h: grants24.count ?? 0,
    downloadGrantsTotal: grantsTotal.count ?? 0,
    downloadEvents24h: events24.count ?? 0,
    newSubscribers7d: new7d.count ?? 0,
  };
}

export default async function AdminOverviewPage() {
  const m = await loadMetrics();

  const conversionRate =
    m.subscribersTotal > 0
      ? Math.round((m.subscribersConfirmed / m.subscribersTotal) * 100)
      : 0;

  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader
        title="Overview"
        subtitle="Live metrics across the waitlist, downloads, and recent activity."
      />

      <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="Subscribers"
          value={m.subscribersTotal.toLocaleString()}
          hint={`${m.subscribersConfirmed} confirmed · ${m.subscribersPending} pending`}
          accent="violet"
        />
        <Stat
          label="Confirmation rate"
          value={`${conversionRate}%`}
          hint="Confirmed / total."
          accent="cyan"
        />
        <Stat
          label="New (7 days)"
          value={m.newSubscribers7d.toLocaleString()}
          hint="Sign-ups in the last week."
        />
        <Stat
          label="Unsubscribed"
          value={m.subscribersUnsubscribed.toLocaleString()}
          hint="All-time opt-outs."
        />
      </section>

      <section className="mt-10">
        <SectionTitle>Downloads</SectionTitle>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Stat
            label="Grants · 24h"
            value={m.downloadGrants24h.toLocaleString()}
            hint="Email-link requests sent today."
          />
          <Stat
            label="Grants · all time"
            value={m.downloadGrantsTotal.toLocaleString()}
            hint="Cumulative requests served."
          />
          <Stat
            label="Click events · 24h"
            value={m.downloadEvents24h.toLocaleString()}
            hint="Signed URLs actually opened."
          />
        </div>
      </section>

      <section className="mt-10 rounded-2xl border border-[var(--border)] bg-[var(--background-elevated)]/40 p-6">
        <SectionTitle>Quick actions</SectionTitle>
        <ul className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          <ActionLink
            href="/admin/subscribers"
            title="Manage subscribers"
            description="Search, export, or revoke any waitlist entry."
          />
          <ActionLink
            href="/admin/downloads"
            title="Audit downloads"
            description="See every grant and click, with IP hash + UA."
          />
          <ActionLink
            href="/admin/releases"
            title="Publish a release"
            description="Promote a new plug-in version to current."
          />
          <ActionLink
            href="/admin/settings"
            title="Admin settings"
            description="Invite teammates, rotate keys, view audit log."
          />
        </ul>
      </section>
    </div>
  );
}

function PageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <header>
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-[var(--foreground-muted)]">
        <span
          className="h-1.5 w-6 rounded-full"
          style={{
            background:
              "linear-gradient(90deg, var(--spectrum-violet), var(--spectrum-cyan))",
          }}
        />
        Dashboard
      </div>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl tracking-tight text-[var(--foreground)]">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-2 max-w-2xl text-sm text-[var(--foreground-muted)]">
          {subtitle}
        </p>
      )}
    </header>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs uppercase tracking-[0.22em] text-[var(--foreground-muted)]">
      {children}
    </h2>
  );
}

function Stat({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: "violet" | "cyan";
}) {
  const accentStyle =
    accent === "violet"
      ? "linear-gradient(90deg, var(--spectrum-violet), var(--spectrum-blue, #4a8df0))"
      : accent === "cyan"
        ? "linear-gradient(90deg, var(--spectrum-cyan), var(--spectrum-green, #4ade80))"
        : undefined;

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--background-elevated)]/40 p-5">
      {accentStyle && (
        <span
          aria-hidden="true"
          className="mb-3 inline-block h-1 w-8 rounded-full"
          style={{ background: accentStyle }}
        />
      )}
      <div className="text-xs uppercase tracking-[0.18em] text-[var(--foreground-muted)]">
        {label}
      </div>
      <div className="mt-2 font-[family-name:var(--font-display)] text-3xl tracking-tight text-[var(--foreground)]">
        {value}
      </div>
      {hint && (
        <div className="mt-1 text-xs text-[var(--foreground-subtle)]">
          {hint}
        </div>
      )}
    </div>
  );
}

function ActionLink({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <li>
      <a
        href={href}
        className="block rounded-xl border border-[var(--border)] bg-[var(--background)]/40 p-4 transition hover:border-white/20 hover:bg-[var(--background-elevated)]/60"
      >
        <div className="font-medium text-[var(--foreground)]">{title}</div>
        <div className="mt-1 text-xs text-[var(--foreground-muted)]">
          {description}
        </div>
      </a>
    </li>
  );
}
