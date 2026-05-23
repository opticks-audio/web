import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { publicEnv, serverEnv } from "@/lib/env";

/**
 * Server-only Supabase client using the service_role key.
 *
 * NEVER import this from a Client Component or expose any return value
 * directly to the browser. It bypasses Row Level Security by design.
 */
let cached: SupabaseClient | null = null;

export function supabaseAdmin(): SupabaseClient {
  if (cached) return cached;
  const pub = publicEnv();
  const srv = serverEnv();
  cached = createClient(pub.NEXT_PUBLIC_SUPABASE_URL, srv.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: { "x-opticks-source": "server" },
    },
  });
  return cached;
}
