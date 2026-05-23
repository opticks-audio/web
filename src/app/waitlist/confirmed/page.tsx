import type { Metadata } from "next";
import Link from "next/link";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Confirmed · Opticks Audio",
  description: "Your spot on the Opticks Audio waitlist is locked in.",
  robots: { index: false, follow: false },
};

type Status = "ok" | "already" | "invalid" | "error";

function copy(status: Status) {
  switch (status) {
    case "ok":
      return {
        eyebrow: "Confirmed",
        title: "You're in.",
        body: "Your email is locked in. We'll be in touch the moment the Opticks Collection ships — and you'll get launch-week pricing before anyone else.",
      };
    case "already":
      return {
        eyebrow: "Already in",
        title: "You're already on the list.",
        body: "Looks like this link was already used. No action needed — we'll email you when REFLEXION, REFRACTION and INFLEXION go live.",
      };
    case "invalid":
      return {
        eyebrow: "Link expired",
        title: "This link is no longer valid.",
        body: "Confirmation links work once and expire after a while. Head back home and join the waitlist again — we'll send a fresh confirmation email.",
      };
    case "error":
    default:
      return {
        eyebrow: "Something went wrong",
        title: "We couldn't confirm your email.",
        body: "Our system hiccupped. Try clicking the link again in a minute, or rejoin the waitlist from the home page.",
      };
  }
}

export default async function ConfirmedPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const status = (params.status ?? "ok") as Status;
  const c = copy(status);

  return (
    <main className="relative flex min-h-screen items-center justify-center px-6 py-24">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div
          className="absolute left-1/2 top-[-20%] h-[600px] w-[600px] -translate-x-1/2 rounded-full opacity-30 blur-[120px]"
          style={{
            background:
              "conic-gradient(from 0deg, #7c3aed, #2563eb, #06b6d4, #10b981, #eab308, #f97316, #ef4444, #7c3aed)",
          }}
        />
      </div>

      <div className="relative w-full max-w-xl text-center">
        <div className="mb-6 flex items-center justify-center gap-3">
          <span
            className="h-px w-12"
            style={{
              background:
                "linear-gradient(90deg, transparent, var(--spectrum-violet), var(--spectrum-cyan), transparent)",
            }}
          />
          <span className="text-xs uppercase tracking-[0.24em] text-[var(--foreground-muted)]">
            {c.eyebrow}
          </span>
          <span
            className="h-px w-12"
            style={{
              background:
                "linear-gradient(90deg, transparent, var(--spectrum-cyan), var(--spectrum-green), transparent)",
            }}
          />
        </div>

        <h1 className="font-[family-name:var(--font-display)] text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.05] tracking-tight">
          {c.title}
        </h1>

        <p className="mx-auto mt-6 max-w-md text-[15px] leading-relaxed text-[var(--foreground-muted)]">
          {c.body}
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-[var(--foreground)] px-6 py-3 text-sm font-medium text-[var(--background)] transition hover:bg-white"
          >
            Back to Opticks Audio
            <span aria-hidden>→</span>
          </Link>
          <Link
            href="/#collection"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--border-strong)] px-6 py-3 text-sm font-medium text-[var(--foreground)] transition hover:bg-white/5"
          >
            Explore the collection
          </Link>
        </div>
      </div>
    </main>
  );
}
