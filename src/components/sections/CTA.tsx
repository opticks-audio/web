"use client";

import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";

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
              Beta access
            </p>
            <h2 className="font-display text-[clamp(2.25rem,5vw,4.5rem)] leading-[1.05] tracking-[-0.02em] max-w-3xl mx-auto">
              The collection ships <span className="italic text-spectrum">soon.</span>
              <br /> Be the first to hear it.
            </h2>
            <p className="mt-6 max-w-xl mx-auto text-foreground-muted">
              REFLEXION, REFRACTION and INFLEXION are in private beta. Write us
              if you produce, mix or master at a level where this matters —
              we&rsquo;ll send a build and launch pricing when the collection goes live.
            </p>

            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <a
                href="mailto:beta@opticksaudio.com?subject=Opticks%20Collection%20%E2%80%94%20beta%20access&body=I'd%20like%20to%20join%20the%20private%20beta%20for%20the%20Opticks%20Collection.%0A%0AI%20produce%2Fmix%2Fmaster%3A%20%5Bbrief%20context%5D%0ADAW%3A%20%5BAbleton%2FLogic%2FPro%20Tools%2F%E2%80%A6%5D%0AInterested%20in%3A%20%5BREFLEXION%2FREFRACTION%2FINFLEXION%5D%0A"
                className="group inline-flex items-center gap-2 rounded-full bg-foreground text-background px-6 py-3 text-sm font-medium hover:bg-foreground/90 transition-all duration-200"
              >
                Request beta access
                <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
              </a>
              <a
                href="mailto:hello@opticksaudio.com?subject=Opticks%20Audio"
                className="inline-flex items-center gap-2 rounded-full border border-border-strong px-6 py-3 text-sm font-medium text-foreground hover:bg-background-elevated transition-all duration-200"
              >
                hello@opticksaudio.com
              </a>
            </div>

            <p className="mt-8 text-xs font-mono uppercase tracking-[0.18em] text-foreground-subtle">
              A public waitlist opens at launch.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
