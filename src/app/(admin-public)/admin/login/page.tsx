import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Admin · Opticks Audio",
  robots: { index: false, follow: false },
};

type Search = Promise<{ error?: string; next?: string }>;

const ERROR_MESSAGES: Record<string, string> = {
  unauthorized:
    "This email isn't authorised to access the admin area. Contact the workspace owner.",
  exchange_failed:
    "That sign-in link has expired or already been used. Request a new one below.",
  missing_code:
    "The sign-in link looks incomplete. Request a new one below.",
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Search;
}) {
  const { error, next } = await searchParams;
  const errorMessage = error ? ERROR_MESSAGES[error] ?? null : null;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--background)] text-[var(--foreground)]">
      {/* Ambient prism glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 0%, rgba(120, 90, 220, 0.18), transparent 70%), radial-gradient(40% 35% at 20% 100%, rgba(40, 160, 220, 0.12), transparent 70%)",
        }}
      />

      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-16">
        <Link
          href="/"
          className="mb-10 inline-flex w-fit items-center gap-2 text-xs uppercase tracking-[0.22em] text-[var(--foreground-muted)] transition hover:text-[var(--foreground)]"
        >
          <span
            className="h-1.5 w-6 rounded-full"
            style={{
              background:
                "linear-gradient(90deg, var(--spectrum-violet), var(--spectrum-cyan))",
            }}
          />
          Opticks Audio
        </Link>

        <h1 className="font-[family-name:var(--font-display)] text-4xl leading-tight tracking-tight text-[var(--foreground)]">
          Admin.
        </h1>
        <p className="mt-3 text-sm text-[var(--foreground-muted)]">
          Sign in to manage subscribers, releases, and broadcasts. We&rsquo;ll
          email you a one-time link — no passwords.
        </p>

        {errorMessage && (
          <div
            role="alert"
            className="mt-6 rounded-2xl border border-[var(--border-strong)] bg-[var(--background-elevated)]/50 p-4 text-sm text-[var(--foreground)]"
          >
            <div className="mb-1 text-xs uppercase tracking-[0.18em] text-[var(--foreground-muted)]">
              Sign-in failed
            </div>
            {errorMessage}
          </div>
        )}

        <div className="mt-8">
          <LoginForm next={next ?? "/admin"} />
        </div>

        <p className="mt-10 text-xs text-[var(--foreground-subtle)]">
          By signing in you agree to the responsible use of subscriber data.
          Every admin action is audit-logged.
        </p>
      </div>
    </main>
  );
}
