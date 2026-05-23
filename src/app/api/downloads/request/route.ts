import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendDownloadEmail } from "@/lib/waitlist/email";
import { hashIp } from "@/lib/waitlist/signing";
import { rateLimit } from "@/lib/waitlist/rate-limit";
import {
  pluginObjectExists,
  signPluginDownloadUrl,
  type PluginSlug,
  type Platform,
} from "@/lib/r2";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PLUGIN_SLUGS = ["reflexion", "refraction", "inflexion"] as const;
const SOURCES = ["plugin_page", "home_cta", "admin_broadcast", "manual"] as const;

const BodySchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  // Empty array means "the full collection". Single-plug-in grants are
  // also supported so the plug-in detail pages can request just one.
  plugins: z.array(z.enum(PLUGIN_SLUGS)).optional().default([]),
  source: z.enum(SOURCES).default("plugin_page"),
  // Honeypot — must be empty if filled, it's a bot.
  website: z.string().max(0).optional(),
});

function clientIp(req: NextRequest): string | null {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]?.trim() ?? null;
  return req.headers.get("x-real-ip");
}

function errorResponse(status: number, code: string, message: string) {
  return NextResponse.json({ ok: false, code, message }, { status });
}

/**
 * Issue download links for a subscriber.
 *
 * Flow:
 *   1. Validate body.
 *   2. Rate limit per IP (3 / minute — these emails are heavier than
 *      a confirmation, so we're stricter than the subscribe endpoint).
 *   3. Look up the subscriber — they MUST be `confirmed`. We do not
 *      gate on plug-in interest; if you confirmed your email, you're
 *      welcome to the whole collection.
 *   4. Read the *current* version per plug-in from `plugin_releases`.
 *   5. For each requested plug-in × platform, HEAD the R2 object so we
 *      only sign URLs for artefacts that actually exist.
 *   6. Persist a `download_grants` row with the version pins.
 *   7. Send the download email.
 *
 * Whoever didn't confirm gets a generic "request received" response —
 * we don't leak the difference between "no such subscriber" and "not
 * confirmed yet" to avoid enumeration attacks.
 */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return errorResponse(400, "invalid_json", "Body must be valid JSON.");
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(400, "invalid_input", parsed.error.message);
  }

  // Honeypot — silently succeed.
  if (parsed.data.website && parsed.data.website.length > 0) {
    return NextResponse.json({ ok: true, status: "queued" });
  }

  const ip = clientIp(req) ?? "unknown";
  const rl = rateLimit(`download:${ip}`, 3, 60_000);
  if (!rl.ok) {
    return errorResponse(
      429,
      "rate_limited",
      "Too many download requests. Try again in a minute.",
    );
  }

  const { email, plugins: requestedPlugins, source } = parsed.data;
  const userAgent = req.headers.get("user-agent") ?? null;
  const ipHash = hashIp(ip);

  const supa = supabaseAdmin();

  // Look up subscriber — must be confirmed.
  const { data: subscriber, error: selErr } = await supa
    .from("subscribers")
    .select("id, email, status")
    .eq("email", email)
    .maybeSingle();

  if (selErr) {
    console.error("[downloads.request] subscriber lookup error", selErr);
    return errorResponse(500, "db_error", "Something went wrong on our end.");
  }

  // To avoid leaking who is and isn't on the list, we return the same
  // generic success response in both cases. The user just won't get an
  // email if they aren't a confirmed subscriber.
  if (!subscriber || subscriber.status !== "confirmed") {
    return NextResponse.json({ ok: true, status: "queued" });
  }

  // Resolve the current version of each plug-in we'll send.
  const targets: PluginSlug[] =
    requestedPlugins.length > 0
      ? Array.from(new Set(requestedPlugins))
      : ["reflexion", "refraction", "inflexion"];

  const { data: releases, error: releasesErr } = await supa
    .from("plugin_releases")
    .select("slug, version, platforms, release_notes")
    .in("slug", targets)
    .eq("is_current", true);

  if (releasesErr || !releases || releases.length === 0) {
    console.error("[downloads.request] releases lookup", releasesErr);
    return errorResponse(
      503,
      "no_release",
      "Downloads are not available yet. Please try again later.",
    );
  }

  // Build the per-plug-in artefact list, signing only the platforms we
  // can actually deliver.
  type ArtefactRow = {
    slug: PluginSlug;
    version: string;
    releaseNotes: string | null;
    mac: string | null;
    windows: string | null;
  };
  const artefacts: ArtefactRow[] = [];
  const versionPins: Record<string, string> = {};

  for (const release of releases) {
    const slug = release.slug as PluginSlug;
    const version = release.version as string;
    const platforms = (release.platforms ?? []) as Platform[];
    const releaseNotes = (release.release_notes ?? null) as string | null;

    versionPins[slug] = version;

    const macUrl =
      platforms.includes("mac") &&
      (await pluginObjectExists(slug, "mac", version))
        ? await signPluginDownloadUrl({ slug, platform: "mac", version })
        : null;
    const windowsUrl =
      platforms.includes("windows") &&
      (await pluginObjectExists(slug, "windows", version))
        ? await signPluginDownloadUrl({ slug, platform: "windows", version })
        : null;

    artefacts.push({ slug, version, releaseNotes, mac: macUrl, windows: windowsUrl });
  }

  const anyArtefact = artefacts.some((a) => a.mac || a.windows);
  if (!anyArtefact) {
    // Releases row exists but the binary is missing in R2. Don't fail
    // loudly to the user; just retry-later.
    console.error("[downloads.request] no artefacts found in R2 for", targets);
    return errorResponse(
      503,
      "no_artefacts",
      "Downloads are not available yet. Please try again later.",
    );
  }

  // Persist grant + audit row.
  const { data: grant, error: insertErr } = await supa
    .from("download_grants")
    .insert({
      subscriber_email: email,
      plugins: targets,
      version_pins: versionPins,
      source,
      ip_hash: ipHash,
      user_agent: userAgent,
    })
    .select("id")
    .single();

  if (insertErr || !grant) {
    console.error("[downloads.request] grant insert error", insertErr);
    return errorResponse(500, "db_error", "Something went wrong on our end.");
  }

  await supa.from("subscriber_events").insert({
    subscriber_id: subscriber.id,
    event_type: "downloads_requested",
    payload: { grant_id: grant.id, plugins: targets, source },
  });

  // Send the email. If Resend fails, we still keep the grant row so an
  // admin can resend by hand.
  try {
    const result = await sendDownloadEmail({
      to: email,
      artefacts,
    });
    await supa.from("subscriber_events").insert({
      subscriber_id: subscriber.id,
      event_type: "email_sent",
      payload: { stage: "downloads", resend_id: result.id, grant_id: grant.id },
    });
  } catch (err) {
    console.error("[downloads.request] email error", err);
    return NextResponse.json({
      ok: true,
      status: "queued",
      warn: "email_delivery_delayed",
    });
  }

  return NextResponse.json({ ok: true, status: "sent" });
}
