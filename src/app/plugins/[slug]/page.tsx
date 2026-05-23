import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { plugins, getPlugin } from "@/lib/plugins";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { DownloadButtons } from "@/components/product/DownloadButtons";
import { PluginScreenshot } from "@/components/product/PluginScreenshot";

type Params = { slug: string };

export function generateStaticParams() {
  return plugins.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const plugin = getPlugin(slug);
  if (!plugin) return {};
  return {
    title: `${plugin.name} — ${plugin.category}`,
    description: plugin.description,
    openGraph: {
      title: `${plugin.name} — ${plugin.category}`,
      description: plugin.description,
      images: [plugin.screenshot],
    },
  };
}

export default async function PluginPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const plugin = getPlugin(slug);
  if (!plugin) notFound();

  return (
    <>
      <Navbar />
      <main className="flex-1 pt-32">
        {/* ─── Hero ─────────────────────────────────────────────────── */}
        <section className="relative isolate overflow-hidden pb-20">
          {/* Accent glows */}
          <div
            className="absolute -top-40 right-0 size-[600px] rounded-full blur-[120px] opacity-30 pointer-events-none"
            style={{
              background: `radial-gradient(circle, ${plugin.accentFrom}, transparent 70%)`,
            }}
          />
          <div
            className="absolute -bottom-40 left-0 size-[500px] rounded-full blur-[120px] opacity-20 pointer-events-none"
            style={{
              background: `radial-gradient(circle, ${plugin.accentTo}, transparent 70%)`,
            }}
          />

          <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
            <Link
              href="/#collection"
              className="inline-flex items-center gap-2 text-sm text-foreground-muted hover:text-foreground transition-colors mb-10"
            >
              <ArrowLeft className="size-4" />
              The Opticks Collection
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
              <div className="lg:col-span-6">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-xs font-mono uppercase tracking-[0.22em] text-foreground-subtle">
                    {plugin.category}
                  </span>
                  <span className="text-foreground-subtle">·</span>
                  <span className="text-xs font-mono uppercase tracking-[0.22em] text-foreground-muted">
                    v{plugin.version}
                  </span>
                  {plugin.status === "beta" && (
                    <>
                      <span className="text-foreground-subtle">·</span>
                      <span
                        className="text-[10px] font-mono uppercase tracking-[0.22em] px-2 py-0.5 rounded-full border"
                        style={{
                          borderColor: plugin.accentFrom,
                          color: plugin.accentFrom,
                        }}
                      >
                        Beta
                      </span>
                    </>
                  )}
                </div>

                <h1 className="font-display text-[clamp(3.5rem,8vw,7rem)] leading-[0.95] tracking-[-0.025em]">
                  {plugin.name}
                </h1>

                <p className="mt-6 font-display italic text-2xl md:text-3xl text-foreground-muted">
                  {plugin.tagline}
                </p>

                <p className="mt-10 max-w-2xl text-lg text-foreground-muted leading-relaxed">
                  {plugin.longDescription}
                </p>

                <div className="mt-10">
                  <DownloadButtons plugin={plugin} />
                </div>
              </div>

              <div className="lg:col-span-6">
                <PluginScreenshot
                  src={plugin.screenshot}
                  alt={`${plugin.name} plug-in interface`}
                  accentFrom={plugin.accentFrom}
                  accentTo={plugin.accentTo}
                  width={1024}
                  height={640}
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* ─── Features grid ───────────────────────────────────────── */}
        <section className="relative py-24 border-t border-border">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="flex items-end justify-between flex-wrap gap-6 mb-16">
              <div>
                <p className="text-xs font-mono uppercase tracking-[0.22em] text-foreground-subtle mb-4">
                  Inside the engine
                </p>
                <h2 className="font-display text-[clamp(2rem,4.5vw,3.5rem)] leading-[1.05] tracking-[-0.02em] max-w-3xl">
                  Architecture that competes with the giants.
                </h2>
              </div>
              <p className="text-sm text-foreground-muted max-w-md leading-relaxed">
                Built from the equation up. Every filter, every modulator,
                every line of signal flow is ours — no off-the-shelf reverbs
                hidden behind a new face.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              {plugin.features.map((f, i) => (
                <div key={f.title} className="flex gap-5">
                  <span className="font-mono text-xs text-foreground-subtle pt-1.5 w-6 shrink-0">
                    0{i + 1}
                  </span>
                  <div className="flex-1 border-t border-border pt-4">
                    <h3 className="font-display text-xl text-foreground mb-2">
                      {f.title}
                    </h3>
                    <p className="text-sm text-foreground-muted leading-relaxed">
                      {f.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Specs strip ─────────────────────────────────────────── */}
        <section className="relative py-20 border-t border-border bg-background-elevated/30">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div>
                <h3 className="text-xs font-mono uppercase tracking-[0.18em] text-foreground-subtle mb-4">
                  Plug-in formats
                </h3>
                <div className="flex flex-wrap gap-2">
                  {plugin.formats.map((f) => (
                    <span
                      key={f}
                      className="rounded-full border border-border-strong px-3 py-1 text-xs font-mono"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-mono uppercase tracking-[0.18em] text-foreground-subtle mb-4">
                  Tested DAWs
                </h3>
                <ul className="space-y-2 text-sm text-foreground-muted">
                  {plugin.daws.map((d) => (
                    <li key={d} className="flex items-center gap-2">
                      <span
                        className="size-1.5 rounded-full"
                        style={{
                          background: `linear-gradient(90deg, ${plugin.accentFrom}, ${plugin.accentTo})`,
                        }}
                      />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-xs font-mono uppercase tracking-[0.18em] text-foreground-subtle mb-4">
                  System Requirements
                </h3>
                <ul className="space-y-2 text-xs font-mono text-foreground-muted leading-relaxed">
                  <li>{plugin.systemRequirements.mac}</li>
                  <li>{plugin.systemRequirements.windows}</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Concept ─────────────────────────────────────────────── */}
        <section className="relative py-24 border-t border-border">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
            <p className="text-xs font-mono uppercase tracking-[0.22em] text-foreground-subtle mb-6">
              The Concept
            </p>
            <h2 className="font-display text-[clamp(2rem,4.5vw,3.75rem)] leading-[1.05] tracking-[-0.02em] max-w-4xl mx-auto">
              <span className="italic">{plugin.physics}</span>, translated into sound.
            </h2>
            <p className="mt-6 max-w-2xl mx-auto text-lg text-foreground-muted leading-relaxed">
              {plugin.description}
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
