import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendWelcomeEmail } from "@/lib/waitlist/email";
import { publicEnv } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TokenSchema = z.string().uuid();

/**
 * Double opt-in completion.
 * Triggered when a user clicks the link in the confirmation email.
 * Always redirects — never returns JSON — because the user lands here
 * from their inbox.
 */
export async function GET(req: NextRequest) {
  const { NEXT_PUBLIC_SITE_URL } = publicEnv();
  const token = req.nextUrl.searchParams.get("token");

  const parsed = TokenSchema.safeParse(token);
  if (!parsed.success) {
    return NextResponse.redirect(
      `${NEXT_PUBLIC_SITE_URL}/waitlist/confirmed?status=invalid`
    );
  }

  const supa = supabaseAdmin();

  const { data: row, error: selErr } = await supa
    .from("subscribers")
    .select("id, email, status")
    .eq("confirmation_token", parsed.data)
    .maybeSingle();

  if (selErr) {
    console.error("[waitlist.confirm] select error", selErr);
    return NextResponse.redirect(
      `${NEXT_PUBLIC_SITE_URL}/waitlist/confirmed?status=error`
    );
  }

  if (!row) {
    return NextResponse.redirect(
      `${NEXT_PUBLIC_SITE_URL}/waitlist/confirmed?status=invalid`
    );
  }

  if (row.status === "confirmed") {
    return NextResponse.redirect(
      `${NEXT_PUBLIC_SITE_URL}/waitlist/confirmed?status=already`
    );
  }

  if (row.status === "unsubscribed") {
    // They unsubscribed and clicked an old link — re-opt them in.
    await supa
      .from("subscribers")
      .update({
        status: "confirmed",
        confirmed_at: new Date().toISOString(),
        unsubscribed_at: null,
      })
      .eq("id", row.id);
  } else {
    await supa
      .from("subscribers")
      .update({
        status: "confirmed",
        confirmed_at: new Date().toISOString(),
      })
      .eq("id", row.id);
  }

  await supa.from("subscriber_events").insert({
    subscriber_id: row.id,
    event_type: "confirmed",
  });

  // Welcome email — fire-and-forget. If it fails we still want the
  // redirect to succeed; the user is confirmed regardless.
  try {
    const result = await sendWelcomeEmail({ to: row.email as string });
    await supa.from("subscriber_events").insert({
      subscriber_id: row.id,
      event_type: "email_sent",
      payload: { stage: "welcome", resend_id: result.id },
    });
  } catch (err) {
    console.error("[waitlist.confirm] welcome email error", err);
  }

  return NextResponse.redirect(
    `${NEXT_PUBLIC_SITE_URL}/waitlist/confirmed?status=ok`
  );
}
