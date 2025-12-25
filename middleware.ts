// middleware.ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const lockEnabled = process.env.SITE_LOCK_ENABLED === "true";
  if (!lockEnabled) return NextResponse.next();

  const { pathname } = req.nextUrl;

  // allow these always
  if (
    pathname.startsWith("/lock") ||
    pathname.startsWith("/api/lock") ||
    pathname.startsWith("/api/unlock") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/robots") ||
    pathname.startsWith("/sitemap")
  ) {
    return NextResponse.next();
  }

  const unlocked = req.cookies.get("directr_unlocked")?.value === "true";
  if (unlocked) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/lock";
  url.searchParams.set("from", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!.*\\.).*)"], // all routes except files with extensions
};
