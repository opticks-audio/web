"use client";

import dynamic from "next/dynamic";
import { motion } from "motion/react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

// Load WebGL scene client-side only for perf
const PrismScene = dynamic(
  () => import("./PrismScene").then((m) => m.PrismScene),
  { ssr: false },
);

export function Hero() {
  return (
    <section className="relative isolate min-h-screen flex items-center overflow-hidden">
      {/* Background prism scene */}
      <div className="absolute inset-0 -z-10">
        <PrismScene />
      </div>

      {/* Radial vignette + soft spectrum glow */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,var(--background)_75%)]" />
        <div
          className="absolute inset-x-0 bottom-0 h-1/3 opacity-30 spectrum-sweep"
          style={{
            background:
              "linear-gradient(180deg, transparent 0%, rgba(124,58,237,0.18) 40%, rgba(6,182,212,0.18) 70%, transparent 100%)",
          }}
        />
      </div>

      {/* Grain overlay */}
      <div className="absolute inset-0 -z-10 grain pointer-events-none" />

      {/* Content */}
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8 w-full pt-24 pb-20">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-background-elevated/60 backdrop-blur px-3.5 py-1.5 text-xs text-foreground-muted mb-8"
          >
            <span className="inline-block size-1.5 rounded-full bg-spectrum-cyan glow-pulse" />
            <span className="font-mono tracking-wide uppercase">
              The Opticks Collection
            </span>
            <span className="text-foreground-subtle">·</span>
            <span>Coming Soon</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-[clamp(3rem,9vw,7.5rem)] leading-[0.95] tracking-[-0.02em] text-foreground"
          >
            Where physics
            <br />
            <span className="italic text-spectrum">becomes</span> sound.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 max-w-xl text-lg md:text-xl text-foreground-muted leading-relaxed"
          >
            Professional audio plugins built from first principles. Inspired
            by Newton&rsquo;s study of light — designed for producers who
            shape sound like geometry.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <Link
              href="/#opticks"
              className="group inline-flex items-center gap-2 rounded-full bg-foreground text-background px-6 py-3 text-sm font-medium hover:bg-foreground/90 transition-all duration-200"
            >
              Discover the Collection
              <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link
              href="/#about"
              className="inline-flex items-center gap-2 rounded-full border border-border-strong px-6 py-3 text-sm font-medium text-foreground hover:bg-background-elevated transition-all duration-200"
            >
              Our Philosophy
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.7 }}
            className="mt-16 flex items-center gap-6 text-xs font-mono uppercase tracking-[0.18em] text-foreground-subtle"
          >
            <span>VST3</span>
            <span className="size-1 rounded-full bg-foreground-subtle" />
            <span>AU</span>
            <span className="size-1 rounded-full bg-foreground-subtle" />
            <span>AAX</span>
            <span className="size-1 rounded-full bg-foreground-subtle" />
            <span>Mac · Windows</span>
          </motion.div>
        </div>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-foreground-subtle text-xs font-mono tracking-[0.2em] uppercase">
        Scroll
      </div>
    </section>
  );
}
