import { NextResponse, type NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getAdmin, logAdminEvent } from "@/lib/admin/auth";
import { hashIp } from "@/lib/waitlist/signing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATUSES = new Set([
  "pending",
  "confirmed",
  "unsubscribed",
  "bounced",
  "complained",
]);

/**
 * Stream a CSV of every subscriber matching the optional status filter.
 *
 * Auth: only callable by signed-in admins. The lookup itself uses the
 * service role so RLS doesn't get in the way of the export.
 *
 * No pagination — we pull a single page of up to 50k rows. We're not
 * close to that volume yet and Supabase handles it comfortably. When
 * we cross 100k we'll switch to a streaming RPC.
 */
export async function GET(req: NextRequest) {
  const admin = await getAdmin();
  if (!admin) {
    return NextResponse.json(
      { ok: false, code: "unauthorized" },
      { status: 401 },
    );
  }

  const statusParam = req.nextUrl.searchParams.get("status");
  const status =
    statusParam && STATUSES.has(statusParam) ? statusParam : null;

  const supa = supabaseAdmin();
  let query = supa
    .from("subscribers")
    .select(
      "email, status, source, interested_in, created_at, confirmed_at, unsubscribed_at",
    )
    .order("created_at", { ascending: false })
    .limit(50_000);

  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error || !data) {
    console.error("[admin.export] error", error);
    return NextResponse.json(
      { ok: false, code: "db_error" },
      { status: 500 },
    );
  }

  // Manual CSV serialisation — fast, dependency-free, and we control
  // quoting precisely. RFC 4180-ish: quote everything; double interior
  // double-quotes; preserve UTF-8.
  const header = [
    "email",
    "status",
    "source",
    "interested_in",
    "created_at",
    "confirmed_at",
    "unsubscribed_at",
  ];
  const escape = (val: unknown): string => {
    if (val == null) return "";
    if (Array.isArray(val)) return `"${val.join("|").replace(/"/g, '""')}"`;
    const s = String(val);
    return `"${s.replace(/"/g, '""')}"`;
  };

  const lines: string[] = [header.join(",")];
  for (const row of data) {
    lines.push(
      [
        escape(row.email),
        escape(row.status),
        escape(row.source),
        escape(row.interested_in),
        escape(row.created_at),
        escape(row.confirmed_at),
        escape(row.unsubscribed_at),
      ].join(","),
    );
  }
  const body = lines.join("\n");

  const ipFwd = req.headers.get("x-forwarded-for") ?? "";
  const ip = ipFwd.split(",")[0]?.trim() || null;
  await logAdminEvent({
    adminEmail: admin.email,
    action: "subscribers_export",
    payload: { status: status ?? "all", row_count: data.length },
    ip: ip ? hashIp(ip) : null,
    userAgent: req.headers.get("user-agent"),
  });

  const now = new Date().toISOString().slice(0, 10);
  const filename = `opticks-subscribers-${status ?? "all"}-${now}.csv`;
  return new NextResponse(body, {
    status: 200,
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${filename}"`,
      "cache-control": "no-store",
    },
  });
}
