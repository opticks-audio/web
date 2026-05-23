"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Download, Bell } from "lucide-react";
import type { Plugin } from "@/lib/plugins";
import { WaitlistModal } from "@/components/waitlist/WaitlistModal";
import { DownloadsForm } from "@/components/product/DownloadsForm";

type OS = "mac" | "windows" | "unknown";

function detectOS(): OS {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("mac")) return "mac";
  if (ua.includes("win")) return "windows";
  return "unknown";
}

export function DownloadButtons({ plugin }: { plugin: Plugin }) {
  const [os, setOs] = useState<OS>("unknown");
  // Two distinct entry points:
  //   - modalOpen        → waitlist signup for "coming-soon" plug-ins.
  //   - downloadFormOpen → "send me my links" form for "beta" plug-ins.
  // The form is rendered inline (not in a modal) because it represents
  // product delivery to a confirmed customer, not a capture moment.
  const [modalOpen, setModalOpen] = useState(false);
  const [downloadFormOpen, setDownloadFormOpen] = useState(false);

  useEffect(() => {
    setOs(detectOS());
  }, []);

  const isAvailable = plugin.status === "available";
  const isBeta = plugin.status === "beta";
  const macReady = isAvailable && Boolean(plugin.downloads.mac);
  const winReady = isAvailable && Boolean(plugin.downloads.windows);

  // Click behaviour on an unavailable platform button:
  //   - beta        → reveal the inline downloads form (existing
  //                   subscribers can fetch a fresh signed URL).
  //   - coming-soon → fall back to the waitlist capture modal.
  const handleUnavailableClick = () => {
    if (isBeta) {
      setDownloadFormOpen(true);
      // Defer the scroll so the form has time to mount.
      requestAnimationFrame(() => {
        document
          .getElementById("downloads-inline")
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    } else {
      setModalOpen(true);
    }
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <DownloadButton
            os="mac"
            label="Download for Mac"
            sublabel={plugin.systemRequirements.mac}
            highlighted={os === "mac"}
            available={macReady}
            href={plugin.downloads.mac}
            isBeta={isBeta}
            onUnavailableClick={handleUnavailableClick}
          />
          <DownloadButton
            os="windows"
            label="Download for Windows"
            sublabel={plugin.systemRequirements.windows}
            highlighted={os === "windows"}
            available={winReady}
            href={plugin.downloads.windows}
            isBeta={isBeta}
            onUnavailableClick={handleUnavailableClick}
          />
        </div>

        {!isAvailable && (
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="font-mono uppercase tracking-[0.18em] text-foreground-subtle">
              {isBeta ? "Beta program · v" : "Coming soon · v"}
              {plugin.version}
            </span>
            {isBeta ? (
              <button
                type="button"
                onClick={() => {
                  setDownloadFormOpen(true);
                  requestAnimationFrame(() => {
                    document
                      .getElementById("downloads-inline")
                      ?.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                      });
                  });
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-border-strong px-3 py-1.5 text-xs font-medium text-foreground transition hover:border-white/30 hover:bg-white/5"
              >
                <Download className="size-3.5" />
                Get my download links
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-full border border-border-strong px-3 py-1.5 text-xs font-medium text-foreground transition hover:border-white/30 hover:bg-white/5"
              >
                <Bell className="size-3.5" />
                Notify me at launch
              </button>
            )}
            {isBeta && (
              <a
                href="mailto:beta@opticksaudio.com?subject=Beta program"
                className="text-foreground-muted underline-offset-4 hover:text-foreground hover:underline"
              >
                Request beta access →
              </a>
            )}
          </div>
        )}

        {/* Inline downloads form — only mounted on demand for beta plug-ins. */}
        <AnimatePresence initial={false}>
          {isBeta && downloadFormOpen && (
            <motion.div
              id="downloads-inline"
              initial={{ opacity: 0, y: 6, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -6, height: 0 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="mt-5 rounded-2xl border border-border-strong bg-background-elevated/40 p-5">
                <div className="mb-3 flex items-center gap-2">
                  <span
                    className="h-1.5 w-6 rounded-full"
                    style={{
                      background:
                        "linear-gradient(90deg, var(--spectrum-violet), var(--spectrum-cyan))",
                    }}
                  />
                  <span className="text-xs uppercase tracking-[0.18em] text-foreground-muted">
                    Beta delivery
                  </span>
                </div>
                <h3 className="font-[family-name:var(--font-display)] text-xl text-foreground">
                  Get your download links by email.
                </h3>
                <p className="mt-1 mb-4 text-sm text-foreground-muted">
                  Enter the email you used to join the waitlist. We&rsquo;ll
                  send signed links for the latest {plugin.name} build —
                  Mac &amp; Windows where available.
                </p>
                <DownloadsForm plugin={plugin.slug} source="plugin_page" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <WaitlistModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        plugin={plugin.slug}
      />
    </>
  );
}

function DownloadButton({
  os,
  label,
  sublabel,
  highlighted,
  available,
  href,
  isBeta,
  onUnavailableClick,
}: {
  os: OS;
  label: string;
  sublabel: string;
  highlighted: boolean;
  available: boolean;
  href?: string;
  isBeta: boolean;
  onUnavailableClick: () => void;
}) {
  const base =
    "group flex-1 flex items-center gap-4 rounded-2xl border px-5 py-4 transition-all duration-300 text-left";

  if (!available) {
    // For beta plug-ins, the platform button doubles as a download
    // request trigger — show the Download glyph to signal that intent.
    // For coming-soon plug-ins it's a notify-me action, hence the bell.
    const TrailingIcon = isBeta ? Download : Bell;
    return (
      <button
        type="button"
        onClick={onUnavailableClick}
        className={`${base} border-border bg-background-elevated/30 text-foreground-muted hover:border-white/20 hover:bg-background-elevated/60 hover:text-foreground`}
      >
        <OSIcon os={os} />
        <div className="flex-1">
          <div className="text-sm font-medium">{label}</div>
          <div className="text-xs font-mono opacity-70">{sublabel}</div>
        </div>
        <TrailingIcon className="size-4 opacity-60 transition group-hover:opacity-100" />
      </button>
    );
  }

  return (
    <a
      href={href}
      className={`${base} ${
        highlighted
          ? "border-foreground bg-foreground text-background hover:bg-foreground/90"
          : "border-border-strong bg-background-elevated/40 text-foreground hover:bg-background-elevated"
      }`}
    >
      <OSIcon os={os} />
      <div className="flex-1">
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs font-mono opacity-70">{sublabel}</div>
      </div>
      <Download className="size-4 transition-transform group-hover:translate-y-0.5" />
    </a>
  );
}

function OSIcon({ os }: { os: OS }) {
  if (os === "mac") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.12 0-.23-.02-.3-.03-.01-.06-.04-.22-.04-.39 0-1.15.572-2.27 1.206-2.98.804-.94 2.142-1.64 3.248-1.68.03.13.05.28.05.43zm4.565 15.71c-.03.07-.463 1.58-1.518 3.12-.945 1.34-1.94 2.71-3.43 2.71-1.517 0-1.9-.88-3.63-.88-1.698 0-2.302.91-3.67.91-1.377 0-2.332-1.26-3.428-2.8-1.287-1.82-2.323-4.65-2.323-7.34 0-4.29 2.794-6.57 5.54-6.57 1.46 0 2.678.96 3.59.96.88 0 2.24-1.02 3.79-1.02.58 0 2.65.06 4 2.02-.13.09-2.39 1.38-2.39 4.07 0 3.06 2.73 4.14 2.77 4.16z" />
      </svg>
    );
  }
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M0 3.449L9.75 2.1v9.451H0V3.449zm10.949-1.524L24 0v11.4H10.949V1.925zM0 12.6h9.75v9.451L0 20.699V12.6zm10.949 0H24V24l-13.051-1.8V12.6z" />
    </svg>
  );
}
