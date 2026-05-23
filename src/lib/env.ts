import { z } from "zod";

/**
 * Centralised, typed environment access.
 *
 * - Server-only secrets are read lazily so they never leak to the bundle.
 * - Public values (NEXT_PUBLIC_*) are read eagerly.
 * - Missing values throw at first use rather than at module load so that
 *   `npm run build` doesn't fail on contributors who haven't filled in
 *   their .env yet. Production runtime catches it the moment a request hits.
 */

const PublicSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(20),
  NEXT_PUBLIC_SITE_URL: z.string().url().default("https://opticksaudio.com"),
});

const ServerSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20),
  RESEND_API_KEY: z.string().min(10),
  RESEND_FROM_EMAIL: z.string().email().default("hello@opticksaudio.com"),
  RESEND_FROM_NAME: z.string().default("Opticks Audio"),
  // Used to sign things like unsubscribe links so users can't tamper.
  WAITLIST_SECRET: z.string().min(16),
  // Cloudflare R2 — plug-in releases bucket. Optional so the marketing
  // site keeps building when the downloads feature isn't configured yet.
  R2_ACCOUNT_ID: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_BUCKET: z.string().default("opticks-audio-releases"),
  R2_ENDPOINT: z.string().url().optional(),
});

export type PublicEnv = z.infer<typeof PublicSchema>;
export type ServerEnv = z.infer<typeof ServerSchema>;

let cachedPublic: PublicEnv | null = null;
let cachedServer: ServerEnv | null = null;

export function publicEnv(): PublicEnv {
  if (cachedPublic) return cachedPublic;
  const parsed = PublicSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  });
  if (!parsed.success) {
    throw new Error(
      `[opticks-audio] Public env invalid: ${parsed.error.message}`
    );
  }
  cachedPublic = parsed.data;
  return cachedPublic;
}

export function serverEnv(): ServerEnv {
  if (cachedServer) return cachedServer;
  const parsed = ServerSchema.safeParse({
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
    RESEND_FROM_NAME: process.env.RESEND_FROM_NAME,
    WAITLIST_SECRET: process.env.WAITLIST_SECRET,
    R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID,
    R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,
    R2_BUCKET: process.env.R2_BUCKET,
    R2_ENDPOINT: process.env.R2_ENDPOINT,
  });
  if (!parsed.success) {
    throw new Error(
      `[opticks-audio] Server env invalid: ${parsed.error.message}`
    );
  }
  cachedServer = parsed.data;
  return cachedServer;
}
