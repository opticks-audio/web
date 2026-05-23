"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import type { Plugin } from "@/lib/plugins";

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

  useEffect(() => {
    setOs(detectOS());
  }, []);

  const isAvailable = plugin.status === "available";
  const isBeta = plugin.status === "beta";

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <DownloadButton
          os="mac"
          label="Download for Mac"
          sublabel={plugin.systemRequirements.mac}
          highlighted={os === "mac"}
          available={isAvailable && Boolean(plugin.downloads.mac)}
          href={plugin.downloads.mac}
        />
        <DownloadButton
          os="windows"
          label="Download for Windows"
          sublabel={plugin.systemRequirements.windows}
          highlighted={os === "windows"}
          available={isAvailable && Boolean(plugin.downloads.windows)}
          href={plugin.downloads.windows}
        />
      </div>
      {!isAvailable && (
        <p className="text-xs text-foreground-subtle font-mono uppercase tracking-[0.18em]">
          {isBeta ? "Beta program · v" : "Coming soon · v"}
          {plugin.version}
          {isBeta && (
            <a
              href="mailto:beta@opticksaudio.com?subject=Beta program"
              className="ml-3 text-foreground hover:text-foreground/80 normal-case tracking-normal font-sans font-medium"
            >
              Request access →
            </a>
          )}
        </p>
      )}
    </div>
  );
}

function DownloadButton({
  os,
  label,
  sublabel,
  highlighted,
  available,
  href,
}: {
  os: OS;
  label: string;
  sublabel: string;
  highlighted: boolean;
  available: boolean;
  href?: string;
}) {
  const base =
    "group flex-1 flex items-center gap-4 rounded-2xl border px-5 py-4 transition-all duration-300";

  if (!available) {
    return (
      <div
        className={`${base} border-border bg-background-elevated/30 text-foreground-subtle cursor-not-allowed`}
      >
        <OSIcon os={os} />
        <div className="flex-1 text-left">
          <div className="text-sm font-medium">{label}</div>
          <div className="text-xs font-mono">{sublabel}</div>
        </div>
        <span className="text-[10px] font-mono uppercase tracking-[0.18em]">
          Soon
        </span>
      </div>
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
      <div className="flex-1 text-left">
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
