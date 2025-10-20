import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const CANONICAL_HOST = "directr-beta.vercel.app"; // <- set your one true domain

const PUBLIC_PATHS = new Set<string>([
  "/login",
  "/create",
  "/reset/confirm",
  "/api/confirm-client",
]);

function projectRefFromUrl(url: string | undefined) {
  if (!url) return null;
  const m = url.match(/^https?:\/\/([a-z0-9-]+)\.supabase\.co/i);
  return m?.[1] || null;
}

export function middleware(req: NextRequest) {
  // 1) Canonical host redirect (prevents split-cookie issues across preview domains)
  if (req.nextUrl.hostname !== CANONICAL_HOST) {
    const url = new URL(req.nextUrl.toString());
    url.hostname = CANONICAL_HOST;
    return NextResponse.redirect(url, 308);
  }

  const { pathname } = req.nextUrl;

  // allow assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/icons") ||
    pathname.startsWith("/images") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // allow public routes
  if (PUBLIC_PATHS.has(pathname)) {
    return NextResponse.next();
  }

  // 2) Auth check (accept both cookie name styles)
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
  matcher: ["/((?!_next|.*\\..*).*)"],
};
