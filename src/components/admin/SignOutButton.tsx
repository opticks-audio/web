"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";

export function SignOutButton() {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);

  const signOut = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const supa = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      );
      await supa.auth.signOut();
    } finally {
      router.replace("/admin/login");
      router.refresh();
    }
  };

  return (
    <button
      type="button"
      onClick={signOut}
      disabled={busy}
      className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-[var(--border)] px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-[var(--foreground-muted)] transition hover:border-white/30 hover:text-[var(--foreground)] disabled:opacity-50"
    >
      <LogOut className="size-3" />
      {busy ? "Signing out…" : "Sign out"}
    </button>
  );
}
