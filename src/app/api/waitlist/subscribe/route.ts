import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendConfirmationEmail } from "@/lib/waitlist/email";
import { hashIp } from "@/lib/waitlist/signing";
import { rateLimit } from "@/lib/waitlist/rate-limit";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const PLUGIN_SLUGS = ["reflexion", "refraction", "inflexion"] as const;
const SOURCES = ["site_cta", "plugin_page", "hero", "footer", "modal"] as const;

const BodySchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  source: z.enum(SOURCES).default("site_cta"),
  interestedIn: z.array(z.enum(PLUGIN_SLUGS)).optional().default([]),
  locale: z.string().max(16).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
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

export async function POST(req: NextRequest) {
  // ---- 1. Parse + validate ------------------------------------------------
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

  // Honeypot — silently succeed so bots think they won.
  if (parsed.data.website && parsed.data.website.length > 0) {
    return NextResponse.json({ ok: true, status: "pending" });
  }

  // ---- 2. Rate limit -----------------------------------------------------
  const ip = clientIp(req) ?? "unknown";
  const rl = rateLimit(`waitlist:${ip}`, 5, 60_000);
  if (!rl.ok) {
    return errorResponse(
      429,
      "rate_limited",
      "Too many attempts. Try again in a minute."
    );
  }

  const { email, source, interestedIn, locale, metadata } = parsed.data;
  const userAgent = req.headers.get("user-agent") ?? null;
  const ipHash = await hashIp(ip);

  const supa = supabaseAdmin();

  // ---- 3. Upsert subscriber ---------------------------------------------
  // If the email already exists in 'confirmed' or 'pending', we behave
  // idempotently: re-issue a confirmation email but never overwrite status.
  const { data: existing, error: selErr } = await supa
    .from("subscribers")
    .select("id, status, confirmation_token, interested_in")
    .eq("email", email)
    .maybeSingle();

  if (selErr) {
    console.error("[waitlist.subscribe] select error", selErr);
    return errorResponse(500, "db_error", "Something went wrong on our end.");
  }

  let subscriberId: string;
  let confirmationToken: string;
  let finalInterests: string[] = interestedIn;

  if (existing) {
    subscriberId = existing.id as string;
    confirmationToken = existing.confirmation_token as string;

    // Merge interests so a user who clicked Reflexion and later Refraction
    // ends up tracked for both.
    const merged = new Set<string>([
      ...((existing.interested_in as string[]) ?? []),
      ...interestedIn,
    ]);
    finalInterests = Array.from(merged);

    const { error: updErr } = await supa
      .from("subscribers")
      .update({
        interested_in: finalInterests,
        metadata: {
          ...(metadata ?? {}),
          last_source: source,
          last_user_agent: userAgent,
        },
        locale: locale ?? null,
      })
      .eq("id", subscriberId);

    if (updErr) {
      console.error("[waitlist.subscribe] update error", updErr);
      return errorResponse(500, "db_error", "Something went wrong on our end.");
    }

    // If already confirmed, short-circuit: no need to re-send a confirm email.
    if (existing.status === "confirmed") {
      return NextResponse.json({ ok: true, status: "confirmed" });
    }
    if (existing.status === "unsubscribed") {
      // Treat as a fresh re-opt-in: flip back to pending so confirm flow works.
      await supa
        .from("subscribers")
        .update({ status: "pending", unsubscribed_at: null })
        .eq("id", subscriberId);
    }
  } else {
    const { data: inserted, error: insErr } = await supa
      .from("subscribers")
      .insert({
        email,
        source,
        interested_in: finalInterests,
        ip_hash: ipHash,
        user_agent: userAgent,
        locale: locale ?? null,
        metadata: metadata ?? {},
      })
      .select("id, confirmation_token")
      .single();

    if (insErr || !inserted) {
      console.error("[waitlist.subscribe] insert error", insErr);
      return errorResponse(500, "db_error", "Something went wrong on our end.");
    }
    subscriberId = inserted.id as string;
    confirmationToken = inserted.confirmation_token as string;
  }

  // ---- 4. Audit event ----------------------------------------------------
  await supa.from("subscriber_events").insert({
    subscriber_id: subscriberId,
    event_type: "subscribed",
    payload: { source, interestedIn: finalInterests, locale, ipHash },
  });

  // ---- 5. Send confirmation email ---------------------------------------
  try {
    const result = await sendConfirmationEmail({
      to: email,
      confirmationToken,
      interestedIn: finalInterests,
    });

    await supa
      .from("subscribers")
      .update({
        last_email_sent_at: new Date().toISOString(),
        email_sent_count: 1,
      })
      .eq("id", subscriberId);

    await supa.from("subscriber_events").insert({
      subscriber_id: subscriberId,
      event_type: "email_sent",
      payload: { stage: "confirm", resend_id: result.id },
    });
  } catch (err) {
    console.error("[waitlist.subscribe] email error", err);
    // We don't fail the request — the row is already there. The user can
    // request a resend from the UI later.
    return NextResponse.json({
      ok: true,
      status: "pending",
      warn: "email_delivery_delayed",
    });
  }

  return NextResponse.json({ ok: true, status: "pending" });
}
