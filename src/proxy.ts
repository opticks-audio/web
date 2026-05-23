import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

/**
 * Edge proxy — runs ahead of every matched route. (Next.js 16 renamed
 * "middleware" to "proxy"; the behaviour is otherwise identical.)
 *
 * Responsibilities (in order):
 *   1. Refresh the Supabase session by reading the request cookies and
 *      writing any rotated ones back on the response. This is the
 *      canonical pattern from @supabase/ssr; without it, getUser() in
 *      Server Components becomes stale and admins get logged out at
 *      random.
 *   2. For `/admin/*` paths (except the login + auth callback routes),
 *      redirect unauthenticated requests to /admin/login with a `next`
 *      param so we can bounce them back after sign-in.
 *
 * We deliberately do NOT enforce admin_users membership here — that
 * lookup needs a DB round-trip and the proxy should stay cheap.
 * The gated layout in src/app/(admin-gated)/admin/layout.tsx does the
 * role check.
 */
export async function proxy(req: NextRequest) {
  let res = NextResponse.next({ request: req });

  const supa = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(toSet: { name: string; value: string; options: CookieOptions }[]) {
          for (const { name, value } of toSet) {
            req.cookies.set(name, value);
          }
          res = NextResponse.next({ request: req });
          for (const { name, value, options } of toSet) {
            res.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  const {
    data: { user },
  } = await supa.auth.getUser();

  const { pathname } = req.nextUrl;
  const isAdminArea = pathname.startsWith("/admin");
  // Public admin routes — these MUST stay accessible to unauthenticated
  // users. /admin/auth/callback in particular is where the session is
  // created from the magic-link code; gating it would chicken-and-egg
  // the entire sign-in flow.
  const isPublicAdminRoute =
    pathname === "/admin/login" ||
    pathname.startsWith("/admin/login/") ||
    pathname.startsWith("/admin/auth/");

  if (isAdminArea && !isPublicAdminRoute && !user) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return res;
}

export const config = {
  // Run on every path except static assets + Next internals.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2?)$).*)",
  ],
};
