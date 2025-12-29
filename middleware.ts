// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ✅ NEVER touch API / Next internals / auth pages
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname.startsWith("/lock") ||
    pathname.startsWith("/login")
  ) {
    return NextResponse.next();
  }

  // ✅ NEVER redirect POST/PUT/etc (prevents 307 on waitlist)
  if (req.method !== "GET" && req.method !== "HEAD") {
    return NextResponse.next();
  }

  if (process.env.SITE_LOCK_ENABLED !== "true") {
    return NextResponse.next();
  }

  const unlocked = req.cookies.get("directr_unlocked")?.value === "1";
  if (unlocked) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/lock";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/:path*"],
};
