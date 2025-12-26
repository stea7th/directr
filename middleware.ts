import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const lockEnabled = process.env.SITE_LOCK_ENABLED === "true";
  if (!lockEnabled) return NextResponse.next();

  const { pathname, search } = req.nextUrl;

  // allow Next internals + api + lock page
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    pathname === "/lock"
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
  matcher: ["/((?!_next|api|favicon.ico).*)"],
};
