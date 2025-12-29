// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // ✅ always allow api routes (THIS fixes the 307)
  if (pathname.startsWith("/api")) return NextResponse.next();

  // ✅ allow next internals + static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/robots") ||
    pathname.startsWith("/sitemap") ||
    pathname.match(/\.(png|jpg|jpeg|gif|webp|svg|ico|css|js|map)$/)
  ) {
    return NextResponse.next();
  }

  // ✅ allow lock + login pages
  if (pathname.startsWith("/lock") || pathname.startsWith("/login")) {
    return NextResponse.next();
  }

  // 🔒 lock everything else
  if (process.env.SITE_LOCK_ENABLED === "true") {
    const unlocked = req.cookies.get("directr_unlocked")?.value === "1";
    if (!unlocked) {
      const url = req.nextUrl.clone();
      url.pathname = "/lock";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next).*)"],
};
