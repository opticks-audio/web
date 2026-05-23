"use client";

import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function CTA() {
  return (
    <section id="support" className="relative py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden rounded-[2.5rem] border border-border bg-background-elevated/60 backdrop-blur-xl"
        >
          {/* Spectrum glow */}
          <div className="absolute inset-0 opacity-40 pointer-events-none">
            <div className="absolute -top-40 left-1/2 -translate-x-1/2 size-[600px] rounded-full blur-[100px] spectrum-sweep"
              style={{
                background:
                  "conic-gradient(from 0deg, #7c3aed, #4f46e5, #2563eb, #06b6d4, #10b981, #eab308, #f97316, #ef4444, #7c3aed)",
              }}
            />
          </div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent_0%,var(--background-elevated)_85%)] pointer-events-none" />

          <div className="relative px-8 md:px-16 py-20 text-center">
            <p className="text-xs font-mono uppercase tracking-[0.22em] text-foreground-muted mb-6">
              Be first
            </p>
            <h2 className="font-display text-[clamp(2.25rem,5vw,4.5rem)] leading-[1.05] tracking-[-0.02em] max-w-3xl mx-auto">
              The collection drops <span className="italic text-spectrum">soon.</span>
              <br /> Be the first to hear it.
            </h2>
            <p className="mt-6 max-w-xl mx-auto text-foreground-muted">
              Get early access, exclusive demos, and launch pricing when
              REFLEXION, REFRACTION and INFLEXION go live.
            </p>

            <form
              onSubmit={(e) => e.preventDefault()}
              className="mt-10 max-w-md mx-auto flex flex-col sm:flex-row gap-3"
            >
              <input
                type="email"
                required
                placeholder="you@studio.com"
                className="flex-1 rounded-full bg-background border border-border-strong px-5 py-3 text-sm placeholder:text-foreground-subtle focus:outline-none focus:border-foreground transition-colors"
              />
              <button
                type="submit"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-foreground text-background px-6 py-3 text-sm font-medium hover:bg-foreground/90 transition-all"
              >
                Notify me
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </button>
            </form>

            <p className="mt-6 text-xs text-foreground-subtle">
              No spam. Unsubscribe anytime.{" "}
              <Link href="/#about" className="underline underline-offset-4 hover:text-foreground-muted">
                Learn more
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
