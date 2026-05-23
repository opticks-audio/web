"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";

type Plugin = "reflexion" | "refraction" | "inflexion";
type Source = "site_cta" | "plugin_page" | "hero" | "footer" | "modal";

type Variant = "inline" | "stacked";

type Props = {
  /** Layout style. inline = horizontal pill on desktop. */
  variant?: Variant;
  /** Where this form is being rendered, for analytics. */
  source?: Source;
  /** Optional plugin slug to pre-select. */
  interestedIn?: Plugin[];
  /** Hide the plugin checkboxes (e.g. when context is implicit). */
  hidePluginPicker?: boolean;
  /** Override the submit button label. */
  submitLabel?: string;
  /** Optional callback after a successful submission. */
  onSuccess?: () => void;
  className?: string;
};

type FormState =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success"; status: "pending" | "confirmed" }
  | { kind: "error"; message: string };

const PLUGIN_OPTIONS: { value: Plugin; label: string }[] = [
  { value: "reflexion", label: "REFLEXION" },
  { value: "refraction", label: "REFRACTION" },
  { value: "inflexion", label: "INFLEXION" },
];

export function WaitlistForm({
  variant = "inline",
  source = "site_cta",
  interestedIn,
  hidePluginPicker = false,
  submitLabel = "Notify me",
  onSuccess,
  className,
}: Props) {
  const [state, setState] = React.useState<FormState>({ kind: "idle" });
  const [email, setEmail] = React.useState("");
  const [picked, setPicked] = React.useState<Plugin[]>(interestedIn ?? []);
  // Honeypot — bots fill every field they see. Real humans don't.
  const [website, setWebsite] = React.useState("");

  React.useEffect(() => {
    if (interestedIn && interestedIn.length > 0) setPicked(interestedIn);
  }, [interestedIn]);

  const togglePlugin = (slug: Plugin) => {
    setPicked((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state.kind === "submitting") return;
    setState({ kind: "submitting" });

    try {
      const res = await fetch("/api/waitlist/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email,
          source,
          interestedIn: picked,
          locale:
            typeof navigator !== "undefined" ? navigator.language : undefined,
          website,
          metadata: {
            referrer:
              typeof document !== "undefined" ? document.referrer : undefined,
            path:
              typeof window !== "undefined"
                ? window.location.pathname
                : undefined,
          },
        }),
      });

      const json = (await res.json()) as
        | { ok: true; status: "pending" | "confirmed" }
        | { ok: false; code: string; message: string };

      if (!res.ok || !("ok" in json) || !json.ok) {
        const message =
          "ok" in json && !json.ok ? json.message : "Something went wrong.";
        setState({ kind: "error", message });
        return;
      }

      setState({ kind: "success", status: json.status });
      onSuccess?.();
    } catch {
      setState({
        kind: "error",
        message: "Network error. Check your connection and try again.",
      });
    }
  };

  if (state.kind === "success") {
    return (
      <SuccessPanel
        variant={variant}
        confirmed={state.status === "confirmed"}
        className={className}
      />
    );
  }

  const isStacked = variant === "stacked";

  return (
    <form
      onSubmit={submit}
      noValidate
      className={cn("w-full", className)}
      aria-busy={state.kind === "submitting"}
    >
      {/* Honeypot field — visually hidden, off-screen, no tab stop. */}
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

      <div
        className={cn(
          "flex w-full gap-2",
          isStacked ? "flex-col" : "flex-col sm:flex-row sm:items-stretch"
        )}
      >
        <label className="sr-only" htmlFor="waitlist-email">
          Email address
        </label>
        <input
          id="waitlist-email"
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          placeholder="you@studio.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={state.kind === "submitting"}
          className={cn(
            "flex-1 rounded-full border border-[var(--border-strong)]",
            "bg-[var(--background-elevated)] px-5 py-3.5",
            "text-[15px] text-[var(--foreground)] placeholder:text-[var(--foreground-subtle)]",
            "outline-none transition focus:border-white/30 focus:ring-2 focus:ring-white/10",
            "disabled:opacity-60"
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
            isStacked && "w-full"
          )}
        >
          {state.kind === "submitting" ? (
            <>
              <Spinner />
              <span>Sending…</span>
            </>
          ) : (
            <>
              <span>{submitLabel}</span>
              <span aria-hidden="true" className="transition group-hover:translate-x-0.5">
                →
              </span>
            </>
          )}
        </button>
      </div>

      {!hidePluginPicker && (
        <fieldset className="mt-4">
          <legend className="mb-2 text-xs uppercase tracking-[0.18em] text-[var(--foreground-subtle)]">
            I&apos;m most interested in
          </legend>
          <div className="flex flex-wrap gap-2">
            {PLUGIN_OPTIONS.map((opt) => {
              const active = picked.includes(opt.value);
              return (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => togglePlugin(opt.value)}
                  aria-pressed={active}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 text-xs font-medium tracking-wide transition",
                    active
                      ? "border-white/40 bg-white/10 text-[var(--foreground)]"
                      : "border-[var(--border)] text-[var(--foreground-muted)] hover:border-white/20 hover:text-[var(--foreground)]"
                  )}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

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
        We&apos;ll send one email to confirm. Unsubscribe anytime.
      </p>
    </form>
  );
}

function SuccessPanel({
  variant,
  confirmed,
  className,
}: {
  variant: Variant;
  confirmed: boolean;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-2xl border border-[var(--border-strong)] bg-[var(--background-elevated)] p-5",
        variant === "stacked" ? "w-full" : "max-w-xl",
        className
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
          {confirmed ? "Already in" : "Almost there"}
        </span>
      </div>
      <h3 className="font-[family-name:var(--font-display)] text-2xl text-[var(--foreground)]">
        {confirmed ? "You're already on the list." : "Check your inbox."}
      </h3>
      <p className="mt-2 text-sm text-[var(--foreground-muted)]">
        {confirmed
          ? "We've got you. We'll be in touch the moment the Opticks Collection ships."
          : "We just sent you a one-click confirmation link. Tap it to lock in early-access pricing."}
      </p>
    </motion.div>
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
