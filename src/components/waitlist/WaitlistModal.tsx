"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { WaitlistForm } from "./WaitlistForm";
import { cn } from "@/lib/utils";

type Plugin = "reflexion" | "refraction" | "inflexion";

type Props = {
  open: boolean;
  onClose: () => void;
  /** Plugin to pre-select in the form. */
  plugin?: Plugin;
  /** Override the heading. Defaults adapt to the plugin context. */
  title?: string;
  /** Override the body copy. */
  description?: string;
};

export function WaitlistModal({
  open,
  onClose,
  plugin,
  title,
  description,
}: Props) {
  const dialogRef = React.useRef<HTMLDivElement>(null);

  // Lock body scroll while open.
  React.useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Close on Escape.
  React.useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Move focus into the dialog on open.
  React.useEffect(() => {
    if (open && dialogRef.current) {
      const focusable = dialogRef.current.querySelector<HTMLElement>(
        'input, button, [tabindex]:not([tabindex="-1"])'
      );
      focusable?.focus();
    }
  }, [open]);

  const headline =
    title ??
    (plugin
      ? `Be first to download ${plugin.toUpperCase()}`
      : "Get early access");

  const copy =
    description ??
    (plugin
      ? `${plugin.toUpperCase()} ships soon. Join the waitlist for launch-week pricing and behind-the-scenes development notes from the DSP team.`
      : "Join the Opticks Audio waitlist. We'll email you the moment the collection drops, with early-bird pricing for the first 48 hours.");

  return (
    <AnimatePresence>
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="waitlist-modal-title"
          className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-8"
        >
          {/* Backdrop */}
          <motion.button
            type="button"
            aria-label="Close dialog"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 cursor-default bg-black/70 backdrop-blur-md"
          />

          {/* Panel */}
          <motion.div
            ref={dialogRef}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "relative w-full max-w-lg overflow-hidden rounded-3xl",
              "border border-[var(--border-strong)] bg-[var(--background-elevated)]",
              "shadow-[0_30px_120px_-20px_rgba(0,0,0,0.7)]"
            )}
          >
            {/* Top spectrum line */}
            <div
              aria-hidden="true"
              className="h-px w-full"
              style={{
                background:
                  "linear-gradient(90deg, transparent, var(--spectrum-violet), var(--spectrum-cyan), var(--spectrum-green), transparent)",
              }}
            />

            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full border border-[var(--border)] text-[var(--foreground-muted)] transition hover:border-white/20 hover:text-[var(--foreground)]"
            >
              <span aria-hidden="true">×</span>
            </button>

            <div className="p-7 sm:p-9">
              <p className="mb-2 text-xs uppercase tracking-[0.22em] text-[var(--foreground-subtle)]">
                Waitlist
              </p>
              <h2
                id="waitlist-modal-title"
                className="font-[family-name:var(--font-display)] text-3xl leading-tight text-[var(--foreground)] sm:text-4xl"
              >
                {headline}
              </h2>
              <p className="mt-3 text-[15px] leading-relaxed text-[var(--foreground-muted)]">
                {copy}
              </p>

              <div className="mt-6">
                <WaitlistForm
                  variant="stacked"
                  source="modal"
                  interestedIn={plugin ? [plugin] : undefined}
                  hidePluginPicker={Boolean(plugin)}
                  submitLabel={
                    plugin ? `Notify me about ${plugin.toUpperCase()}` : "Notify me"
                  }
                />
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
