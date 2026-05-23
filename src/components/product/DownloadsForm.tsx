"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

type PluginSlug = "reflexion" | "refraction" | "inflexion";

type FormState =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success" }
  | { kind: "error"; message: string };

type Props = {
  /** Which plug-in to request. If absent, requests the full collection. */
  plugin?: PluginSlug;
  /** Where this form is being rendered, for analytics. */
  source?: "plugin_page" | "home_cta";
  className?: string;
};

/**
 * The "Get my download links" form.
 *
 * Posts to /api/downloads/request. The endpoint silently no-ops if the
 * email isn't a confirmed subscriber (anti-enumeration), so the UI
 * always renders the same neutral success state. This is intentional.
 */
export function DownloadsForm({ plugin, source = "plugin_page", className }: Props) {
  const [state, setState] = React.useState<FormState>({ kind: "idle" });
  const [email, setEmail] = React.useState("");
  const [website, setWebsite] = React.useState(""); // honeypot

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state.kind === "submitting") return;
    setState({ kind: "submitting" });

    try {
      const res = await fetch("/api/downloads/request", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email,
          plugins: plugin ? [plugin] : [],
          source,
          website,
        }),
      });
      const json = (await res.json()) as
        | { ok: true; status: string }
        | { ok: false; code: string; message: string };

      if (!res.ok || !("ok" in json) || !json.ok) {
        const message =
          "ok" in json && !json.ok ? json.message : "Something went wrong.";
        setState({ kind: "error", message });
        return;
      }

      setState({ kind: "success" });
    } catch {
      setState({
        kind: "error",
        message: "Network error. Check your connection and try again.",
      });
    }
  };

  if (state.kind === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "rounded-2xl border border-[var(--border-strong)] bg-[var(--background-elevated)] p-5",
          className,
        )}
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
        <h3 className="font-[family-name:var(--font-display)] text-2xl text-[var(--foreground)]">
          Download links sent.
        </h3>
        <p className="mt-2 text-sm text-[var(--foreground-muted)]">
          If your email is confirmed on the waitlist, you&rsquo;ll receive a
          message with signed download links in the next minute. Links are
          valid for 24 hours.
        </p>
        <p className="mt-3 text-xs text-[var(--foreground-subtle)]">
          Don&rsquo;t see it? Check spam or write to{" "}
          <a
            href="mailto:beta@opticksaudio.com"
            className="underline-offset-4 hover:underline"
          >
            beta@opticksaudio.com
          </a>
          .
        </p>
      </motion.div>
    );
  }

  return (
    <form
      onSubmit={submit}
      noValidate
      className={cn("w-full", className)}
      aria-busy={state.kind === "submitting"}
    >
      {/* Honeypot */}
      <div
        aria-hidden="true"
        className="absolute left-[-9999px] top-auto h-0 w-0 overflow-hidden"
      >
        <label>
          Website
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </label>
      </div>

      <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-stretch">
        <label className="sr-only" htmlFor="downloads-email">
          Email address
        </label>
        <input
          id="downloads-email"
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          placeholder="The email you used to join the waitlist"
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
            "group relative inline-flex items-center justify-center gap-2",
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
              <span>Email me the links</span>
              <ArrowRight className="size-3.5 transition group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </div>

      <AnimatePresence>
        {state.kind === "error" && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            role="alert"
            className="mt-3 text-sm text-[var(--spectrum-red,#ef4444)]"
          >
            {state.message}
          </motion.p>
        )}
      </AnimatePresence>

      <p className="mt-3 text-xs text-[var(--foreground-subtle)]">
        Links are signed for your email and expire in 24 hours. Only confirmed
        waitlist members can request downloads.
      </p>
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
