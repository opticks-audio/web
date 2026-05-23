import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { publicEnv } from "@/lib/env";

/**
 * Server-side Supabase client bound to the current Next.js request's
 * cookies. Use this from Server Components, Route Handlers, and Server
 * Actions to read the signed-in admin's session.
 *
 * The client uses the ANON key (not service_role): RLS still applies,
 * which is exactly what we want for session-scoped reads. Any admin
 * write that needs to bypass RLS continues to go through
 * `supabaseAdmin()` from ./admin.ts.
 */
export async function supabaseServer(): Promise<SupabaseClient> {
  const env = publicEnv();
  const store = await cookies();

  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return store.getAll();
        },
        setAll(toSet: { name: string; value: string; options: CookieOptions }[]) {
          // In Server Components Next forbids mutating cookies — the
          // call is wrapped in try/catch because reading the session in
          // a page is the common case and would otherwise throw. The
          // middleware (where we DO write cookies) lives elsewhere.
          try {
            for (const { name, value, options } of toSet) {
              store.set(name, value, options);
            }
          } catch {
            // No-op: read-only context.
          }
        },
      },
    },
  );
}
