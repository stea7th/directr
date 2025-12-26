// src/middleware.ts
import { NextResponse, type NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const enabled = process.env.SITE_LOCK_ENABLED === "true";
  if (!enabled) return NextResponse.next();

  const { pathname, search } = req.nextUrl;

  // allow Next assets + lock page
  if (
    pathname.startsWith("/_next") ||
    pathname === "/lock" ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml"
  ) {
    return NextResponse.next();
  }

  const unlocked = req.cookies.get("directr_unlocked")?.value === "true";
  if (unlocked) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/lock";
  url.searchParams.set("from", pathname + search);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/:path*"],
};
