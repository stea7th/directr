import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const lockEnabled = process.env.SITE_LOCK_ENABLED === "true";
  if (!lockEnabled) return NextResponse.next();

  const { pathname, search } = req.nextUrl;

  // allow Next internals/static
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/icon") ||
    pathname.startsWith("/robots") ||
    pathname.startsWith("/sitemap")
  ) {
    return NextResponse.next();
  }

  // allow unlock + relock endpoints
  if (pathname.startsWith("/api/lock")) {
    return NextResponse.next();
  }

  // already on home (lock page)
  if (pathname === "/") {
    return NextResponse.next();
  }

  const unlocked = req.cookies.get("directr_unlocked")?.value === "true";
  if (unlocked) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/";
  url.searchParams.set("from", pathname + search);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/:path*"],
};
