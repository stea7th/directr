import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const lockEnabled = process.env.SITE_LOCK_ENABLED === "true";
  if (!lockEnabled) return NextResponse.next();

  const { pathname } = req.nextUrl;

  // allow lock page + lock APIs + next assets
  if (
    pathname === "/lock" ||
    pathname.startsWith("/api/lock") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico"
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
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
