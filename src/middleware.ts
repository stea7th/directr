import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const PUBLIC_PATHS = new Set<string>([
  "/login",
  "/create",             // allow signup
  "/reset/confirm",      // recovery link landing
  "/api/confirm-client", // API used by recovery
]);

function projectRefFromUrl(url: string | undefined) {
  if (!url) return null;
  const m = url.match(/^https?:\/\/([a-z0-9-]+)\.supabase\.co/i);
  return m?.[1] || null;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // allow static files and Next internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/icons") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/public")
  ) {
    return NextResponse.next();
  }

  // public pages that never require auth
  if (PUBLIC_PATHS.has(pathname)) {
    return NextResponse.next();
  }

  const cookies = req.cookies;
  const hasGeneric =
    cookies.has("sb-access-token") || cookies.has("sb-refresh-token");

  const ref = projectRefFromUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const hasRef =
    !!ref &&
    (cookies.has(`sb-${ref}-auth-token`) ||
      cookies.has(`sb-${ref}-refresh-token`));

  const isAuthed = hasGeneric || hasRef;

  if (!isAuthed) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname + (req.nextUrl.search || ""));
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"], // run on all routes except static/assets
};
