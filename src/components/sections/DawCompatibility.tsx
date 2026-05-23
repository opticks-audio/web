"use client";

import { motion } from "motion/react";
import { SectionDivider } from "./SectionDivider";

const daws = [
  "Ableton Live",
  "Logic Pro",
  "Pro Tools",
  "FL Studio",
  "Cubase",
  "Studio One",
  "Reaper",
  "Bitwig",
];

const formats = ["VST3", "AU", "AAX"];

export function DawCompatibility() {
  return (
    <section className="relative py-32">
      <SectionDivider number="03" label="Compatibility" />

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.9 }}
          className="font-display text-[clamp(2.25rem,5vw,4.25rem)] leading-[1.05] tracking-[-0.02em] max-w-3xl"
        >
          Built for every <span className="italic text-spectrum">serious</span> studio.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.9, delay: 0.1 }}
          className="mt-6 max-w-2xl text-lg text-foreground-muted"
        >
          Native plugins in every major format. No wrappers. No bridges.
        </motion.p>

        <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-px bg-border rounded-2xl overflow-hidden border border-border">
          {daws.map((daw) => (
            <div
              key={daw}
              className="bg-background-elevated/40 backdrop-blur-sm px-6 py-8 flex items-center justify-center text-sm text-foreground-muted hover:text-foreground hover:bg-background-elevated transition-all duration-300"
            >
              {daw}
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <span className="text-xs font-mono uppercase tracking-[0.2em] text-foreground-subtle mr-2">
            Formats
          </span>
          {formats.map((f) => (
            <span
              key={f}
              className="rounded-full border border-border-strong px-3.5 py-1.5 text-xs font-mono text-foreground-muted"
            >
              {f}
            </span>
          ))}
          <span className="text-foreground-subtle">·</span>
          <span className="rounded-full border border-border-strong px-3.5 py-1.5 text-xs font-mono text-foreground-muted">
            macOS · Apple Silicon
          </span>
          <span className="rounded-full border border-border-strong px-3.5 py-1.5 text-xs font-mono text-foreground-muted">
            Windows 64-bit
          </span>
        </div>
      </div>
    </section>
  );
}
