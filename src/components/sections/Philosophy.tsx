"use client";

import { motion } from "motion/react";
import { SectionDivider } from "./SectionDivider";

const tenets = [
  {
    title: "First principles",
    body: "We don't model existing hardware. We model the underlying physics — then translate it into sound.",
  },
  {
    title: "Studio-grade DSP",
    body: "Built in C++ with the same standards used by the industry's most respected developers. Zero compromise on quality.",
  },
  {
    title: "Tactile by design",
    body: "Every control responds with the immediacy of analog hardware. The interface is the instrument.",
  },
];

export function Philosophy() {
  return (
    <section id="about" className="relative py-32">
      <SectionDivider number="02" label="Our Philosophy" />

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.9 }}
            className="lg:col-span-7"
          >
            <h2 className="font-display text-[clamp(2.25rem,5vw,4.25rem)] leading-[1.05] tracking-[-0.02em]">
              In <span className="italic">Opticks</span>, Newton showed that
              white light is the sum of every color — bent and bound together.
            </h2>
            <p className="mt-8 max-w-2xl text-lg text-foreground-muted leading-relaxed">
              We believe sound works the same way. Every great mix is the sum
              of countless invisible decisions — and the right tools should
              make each one feel inevitable. At Opticks Audio, we build the
              prisms that let you see them.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.9, delay: 0.1 }}
            className="lg:col-span-5 space-y-8"
          >
            {tenets.map((t, i) => (
              <div key={t.title} className="flex gap-5">
                <span className="font-mono text-xs text-foreground-subtle pt-1.5">
                  0{i + 1}
                </span>
                <div className="flex-1 border-t border-border pt-4">
                  <h3 className="font-display text-xl text-foreground mb-2">
                    {t.title}
                  </h3>
                  <p className="text-sm text-foreground-muted leading-relaxed">
                    {t.body}
                  </p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
