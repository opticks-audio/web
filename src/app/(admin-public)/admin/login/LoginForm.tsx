"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Mail } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";
import { cn } from "@/lib/utils";

type State =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "sent"; email: string }
  | { kind: "error"; message: string };

export function LoginForm({ next }: { next: string }) {
  const [state, setState] = React.useState<State>({ kind: "idle" });
  const [email, setEmail] = React.useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state.kind === "submitting") return;
    setState({ kind: "submitting" });

    try {
      const supa = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      );

      const redirectTo = `${window.location.origin}/admin/auth/callback?next=${encodeURIComponent(
        next,
      )}`;

      const { error } = await supa.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          emailRedirectTo: redirectTo,
          shouldCreateUser: true,
        },
      });

      if (error) {
        setState({ kind: "error", message: error.message });
        return;
      }
      setState({ kind: "sent", email: email.trim().toLowerCase() });
    } catch (err) {
      setState({
        kind: "error",
        message: err instanceof Error ? err.message : "Unexpected error.",
      });
    }
  };

  if (state.kind === "sent") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-[var(--border-strong)] bg-[var(--background-elevated)]/50 p-5"
      >
        <div className="mb-2 flex items-center gap-2">
          <span
            className="h-1.5 w-6 rounded-full"
            style={{
              background:
                "linear-gradient(90deg, var(--spectrum-violet), var(--spectrum-cyan))",
            }}
          />
          <span className="text-xs uppercase tracking-[0.18em] text-[var(--foreground-muted)]">
            Check your inbox
          </span>
        </div>
        <h2 className="font-[family-name:var(--font-display)] text-2xl text-[var(--foreground)]">
          Sign-in link sent.
        </h2>
        <p className="mt-2 text-sm text-[var(--foreground-muted)]">
          We&rsquo;ve emailed{" "}
          <strong className="text-[var(--foreground)]">{state.email}</strong> a
          one-time link. It expires in one hour. Open it on this device to land
          straight in the dashboard.
        </p>
        <button
          type="button"
          onClick={() => setState({ kind: "idle" })}
          className="mt-4 text-xs uppercase tracking-[0.18em] text-[var(--foreground-muted)] underline-offset-4 hover:text-[var(--foreground)] hover:underline"
        >
          Send to a different address
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={submit} className="w-full" noValidate>
      <label htmlFor="admin-email" className="sr-only">
        Email address
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          id="admin-email"
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          placeholder="you@opticksaudio.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={state.kind === "submitting"}
          className={cn(
            "flex-1 rounded-full border border-[var(--border-strong)]",
            "bg-[var(--background-elevated)] px-5 py-3.5",
            "text-[15px] text-[var(--foreground)] placeholder:text-[var(--foreground-subtle)]",
            "outline-none transition focus:border-white/30 focus:ring-2 focus:ring-white/10",
            "disabled:opacity-60",
          )}
        />
        <button
          type="submit"
          disabled={state.kind === "submitting" || !email}
          className={cn(
            "group inline-flex items-center justify-center gap-2",
            "rounded-full px-6 py-3.5 text-[15px] font-medium",
            "bg-[var(--foreground)] text-[var(--background)]",
            "transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60",
          )}
        >
          {state.kind === "submitting" ? (
            <>
              <Spinner />
              <span>Sending…</span>
            </>
          ) : (
            <>
              <Mail className="size-4" />
              <span>Send link</span>
              <ArrowRight className="size-3.5 transition group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </div>

      <AnimatePresence>
        {state.kind === "error" && (
          <motion.p
            role="alert"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-3 text-sm text-[var(--spectrum-red,#ef4444)]"
          >
            {state.message}
          </motion.p>
        )}
      </AnimatePresence>
    </form>
  );
}

function Spinner() {
  return (
    <span
      aria-hidden="true"
      className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-r-transparent"
    />
  );
}
