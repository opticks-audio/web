"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { plugins } from "@/lib/plugins";
import { SectionDivider } from "./SectionDivider";

export function OpticksCollection() {
  return (
    <section id="opticks" className="relative py-32">
      <SectionDivider number="01" label="The Opticks Collection" />

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="font-display text-[clamp(2.5rem,6vw,5rem)] leading-[1.02] tracking-[-0.02em] max-w-4xl"
        >
          Three plugins. One <span className="italic text-spectrum">principle.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.9, delay: 0.1 }}
          className="mt-6 max-w-2xl text-lg text-foreground-muted leading-relaxed"
        >
          Each plugin in the collection translates a fundamental law of optics
          into a fundamental law of sound. Reflection. Refraction. Inflection.
        </motion.p>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-5">
          {plugins.map((p, idx) => (
            <motion.div
              key={p.slug}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                duration: 0.8,
                delay: idx * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <Link
                href={`/plugins/${p.slug}`}
                className="group relative block h-full overflow-hidden rounded-3xl border border-border bg-background-elevated/40 backdrop-blur-sm hover:border-border-strong transition-all duration-500"
              >
                {/* Accent glow */}
                <div
                  className="absolute -top-32 -right-32 size-72 rounded-full blur-3xl opacity-30 group-hover:opacity-60 transition-opacity duration-700"
                  style={{
                    background: `radial-gradient(circle, ${p.accentFrom}, transparent 70%)`,
                  }}
                />
                <div
                  className="absolute -bottom-32 -left-32 size-72 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-700"
                  style={{
                    background: `radial-gradient(circle, ${p.accentTo}, transparent 70%)`,
                  }}
                />

                <div className="relative p-8 pb-10 flex flex-col h-full min-h-[420px]">
                  {/* Top row */}
                  <div className="flex items-start justify-between mb-12">
                    <span className="text-xs font-mono uppercase tracking-[0.18em] text-foreground-subtle">
                      {p.category}
                    </span>
                    <ArrowUpRight className="size-4 text-foreground-subtle transition-all duration-300 group-hover:text-foreground group-hover:rotate-45" />
                  </div>

                  {/* Visual abstract */}
                  <div className="flex-1 flex items-center justify-center relative">
                    <PluginGlyph slug={p.slug} accentFrom={p.accentFrom} accentTo={p.accentTo} />
                  </div>

                  {/* Bottom */}
                  <div className="mt-8 space-y-3">
                    <h3 className="font-display text-3xl tracking-tight text-foreground">
                      {p.name}
                    </h3>
                    <p className="text-sm text-foreground-muted leading-relaxed">
                      {p.tagline}
                    </p>
                    <div className="pt-3 flex items-center gap-3 text-[10px] font-mono uppercase tracking-[0.18em] text-foreground-subtle">
                      <span>{p.spec}</span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PluginGlyph({
  slug,
  accentFrom,
  accentTo,
}: {
  slug: string;
  accentFrom: string;
  accentTo: string;
}) {
  const gradId = `grad-${slug}`;
  return (
    <svg
      width="160"
      height="160"
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="transition-transform duration-700 group-hover:scale-110"
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={accentFrom} />
          <stop offset="100%" stopColor={accentTo} />
        </linearGradient>
      </defs>
      {slug === "reflexion" && (
        <>
          {/* Concentric reflection arcs */}
          {[1, 2, 3, 4].map((i) => (
            <circle
              key={i}
              cx="80"
              cy="80"
              r={20 + i * 14}
              stroke={`url(#${gradId})`}
              strokeWidth={1.4 - i * 0.15}
              opacity={1 - i * 0.18}
              fill="none"
            />
          ))}
          <circle cx="80" cy="80" r="6" fill={`url(#${gradId})`} />
        </>
      )}
      {slug === "refraction" && (
        <>
          {/* Light through prism */}
          <path
            d="M55 30 L105 80 L55 130 Z"
            stroke={`url(#${gradId})`}
            strokeWidth="1.6"
            fill="none"
          />
          {/* Incoming ray */}
          <line x1="10" y1="80" x2="55" y2="80" stroke="#fff" strokeWidth="1.2" opacity="0.8" />
          {/* Spectrum rays out */}
          {[-3, -2, -1, 0, 1, 2, 3].map((d, i) => (
            <line
              key={i}
              x1="105"
              y1="80"
              x2="155"
              y2={80 + d * 8}
              stroke={`url(#${gradId})`}
              strokeWidth="1.2"
              opacity={0.85 - Math.abs(d) * 0.1}
            />
          ))}
        </>
      )}
      {slug === "inflexion" && (
        <>
          {/* Compression curve */}
          <path
            d="M20 140 Q 80 140, 80 80 T 140 20"
            stroke={`url(#${gradId})`}
            strokeWidth="1.8"
            fill="none"
          />
          {/* Axis */}
          <line x1="20" y1="140" x2="140" y2="140" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
          <line x1="20" y1="140" x2="20" y2="20" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
          {/* Inflection point */}
          <circle cx="80" cy="80" r="4" fill={`url(#${gradId})`} />
          <circle cx="80" cy="80" r="10" stroke={`url(#${gradId})`} strokeWidth="1" fill="none" opacity="0.5" />
        </>
      )}
    </svg>
  );
}
