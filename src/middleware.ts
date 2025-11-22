// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ✅ Never touch API routes or static files
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico")
  ) {
    return NextResponse.next();
  }

  // Example auth protection for app pages (adjust if you want)
  // Right now this does nothing special, just lets everything through.
  return NextResponse.next();
}

export const config = {
  // You can narrow this later, but do NOT include /api here.
  matcher: ["/:path*"],
};
