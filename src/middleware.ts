import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const CANONICAL_HOST = "directr-beta.vercel.app"; // your domain
const PUBLIC_PATHS = new Set(["/login", "/create", "/reset/confirm", "/api/confirm-client"]);

function projectRefFromUrl(url: string | undefined) {
  if (!url) return null;
  const m = url.match(/^https?:\/\/([a-z0-9-]+)\.supabase\.co/i);
  return m?.[1] || null;
}

export function middleware(req: NextRequest) {
  if (req.nextUrl.hostname !== CANONICAL_HOST) {
    const url = new URL(req.nextUrl.toString());
    url.hostname = CANONICAL_HOST;
    return NextResponse.redirect(url, 308);
  }

  const { pathname } = req.nextUrl;
  if (
    pathname.startsWith("/_next") ||
    pathname.includes(".") ||
    PUBLIC_PATHS.has(pathname)
  ) {
    return NextResponse.next();
  }

  const cookies = req.cookies;
  const ref = projectRefFromUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);

  const isAuthed =
    cookies.has("sb-access-token") ||
    cookies.has("sb-refresh-token") ||
    (ref &&
      (cookies.has(`sb-${ref}-auth-token`) ||
        cookies.has(`sb-${ref}-refresh-token`)));

  if (!isAuthed) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname + (req.nextUrl.search || ""));
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = { matcher: ["/((?!_next|.*\\..*).*)"] };
