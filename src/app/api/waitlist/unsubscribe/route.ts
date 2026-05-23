import { NextResponse, type NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { verifyEmailToken } from "@/lib/waitlist/signing";
import { publicEnv } from "@/lib/env";

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * Supports two flows:
 *
 *  GET  /api/waitlist/unsubscribe?token=...   → one-click unsub (List-Unsubscribe)
 *  POST /api/waitlist/unsubscribe             → form-based, also supports
 *                                                Gmail's List-Unsubscribe-Post
 */
async function doUnsubscribe(token: string | null) {
  const { NEXT_PUBLIC_SITE_URL } = publicEnv();

  if (!token) {
    return NextResponse.redirect(
      `${NEXT_PUBLIC_SITE_URL}/waitlist/unsubscribe?status=invalid`
    );
  }

  const email = await verifyEmailToken(token);
  if (!email) {
    return NextResponse.redirect(
      `${NEXT_PUBLIC_SITE_URL}/waitlist/unsubscribe?status=invalid`
    );
  }

  const supa = supabaseAdmin();
  const { data: row, error } = await supa
    .from("subscribers")
    .select("id, status")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    console.error("[waitlist.unsubscribe] select error", error);
    return NextResponse.redirect(
      `${NEXT_PUBLIC_SITE_URL}/waitlist/unsubscribe?status=error`
    );
  }

  if (!row) {
    return NextResponse.redirect(
      `${NEXT_PUBLIC_SITE_URL}/waitlist/unsubscribe?status=ok`
    );
  }

  if (row.status !== "unsubscribed") {
    await supa
      .from("subscribers")
      .update({
        status: "unsubscribed",
        unsubscribed_at: new Date().toISOString(),
      })
      .eq("id", row.id);

    await supa.from("subscriber_events").insert({
      subscriber_id: row.id,
      event_type: "unsubscribed",
    });
  }

  return NextResponse.redirect(
    `${NEXT_PUBLIC_SITE_URL}/waitlist/unsubscribe?status=ok`
  );
}

export async function GET(req: NextRequest) {
  return doUnsubscribe(req.nextUrl.searchParams.get("token"));
}

export async function POST(req: NextRequest) {
  // RFC 8058: Gmail's "one-click" unsubscribe POST sends
  // `List-Unsubscribe=One-Click` in the body; the token comes from query.
  return doUnsubscribe(req.nextUrl.searchParams.get("token"));
}
