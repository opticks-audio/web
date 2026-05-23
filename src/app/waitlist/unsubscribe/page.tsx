import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Unsubscribed · Opticks Audio",
  description: "You've been removed from the Opticks Audio waitlist.",
  robots: { index: false, follow: false },
};

type Status = "ok" | "invalid" | "error";

function copy(status: Status) {
  switch (status) {
    case "ok":
      return {
        eyebrow: "Unsubscribed",
        title: "You're off the list.",
        body: "Sorry to see you go. We won't email you again about the Opticks Collection. If this was a mistake, you can rejoin the waitlist any time from the home page.",
      };
    case "invalid":
      return {
        eyebrow: "Link expired",
        title: "This unsubscribe link is no longer valid.",
        body: "Our unsubscribe links expire after a year. Reach out to hello@opticksaudio.com and we'll handle it manually.",
      };
    case "error":
    default:
      return {
        eyebrow: "Something went wrong",
        title: "We couldn't process this unsubscribe.",
        body: "Try again in a minute, or email hello@opticksaudio.com and we'll take care of it.",
      };
  }
}

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const status = (params.status ?? "ok") as Status;
  const c = copy(status);

  return (
    <main className="relative flex min-h-screen items-center justify-center px-6 py-24">
      <div className="relative w-full max-w-xl text-center">
        <p className="mb-4 text-xs uppercase tracking-[0.24em] text-[var(--foreground-subtle)]">
          {c.eyebrow}
        </p>
        <h1 className="font-[family-name:var(--font-display)] text-[clamp(2.25rem,5vw,3.5rem)] leading-[1.1] tracking-tight">
          {c.title}
        </h1>
        <p className="mx-auto mt-5 max-w-md text-[15px] leading-relaxed text-[var(--foreground-muted)]">
          {c.body}
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--border-strong)] px-6 py-3 text-sm font-medium text-[var(--foreground)] transition hover:bg-white/5"
          >
            Back to Opticks Audio
          </Link>
          {status === "ok" && (
            <Link
              href="/#support"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--foreground)] px-6 py-3 text-sm font-medium text-[var(--background)] transition hover:bg-white"
            >
              Rejoin the waitlist
              <span aria-hidden>→</span>
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
