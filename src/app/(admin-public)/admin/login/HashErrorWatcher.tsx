"use client";

import * as React from "react";

/**
 * Promotes Supabase auth errors that arrive in the URL hash fragment
 * to a regular query parameter so the server-rendered error card can
 * pick them up on the next request.
 *
 * Why: when a magic-link OTP expires, Supabase issues a redirect that
 * looks like
 *   /admin/login?error=access_denied&error_code=otp_expired#error=...
 *                ^ visible to the server                    ^ hash, server-blind
 * Both halves arrive, but in some browsers the hash is what the user
 * actually sees and the page can render even when the query is empty
 * (depending on routing). This watcher unifies the two paths so the
 * UI is consistent — we strip the hash and reload with the canonical
 * `?error=<error_code>` shape.
 */
export function HashErrorWatcher() {
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash;
    if (!hash || !hash.includes("error")) return;

    const params = new URLSearchParams(hash.replace(/^#/, ""));
    const errorCode = params.get("error_code") ?? params.get("error");
    if (!errorCode) return;

    const search = new URLSearchParams(window.location.search);
    // Only redirect if the query doesn't already encode the error —
    // otherwise we'd loop forever.
    if (search.get("error") === errorCode) {
      // Clean the hash so the user doesn't keep seeing #access_denied
      // in the address bar.
      history.replaceState(null, "", window.location.pathname + window.location.search);
      return;
    }
    search.set("error", errorCode);
    window.location.replace(
      `${window.location.pathname}?${search.toString()}`,
    );
  }, []);

  return null;
}
