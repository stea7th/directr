// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 🔒 VERY IMPORTANT:
  // Do NOT touch API routes, Next internals, or favicon.
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // If you want auth protection later, we’ll add it here.
  // For now, let every non-API route through.
  return NextResponse.next();
}

export const config = {
  // This will run on most paths, but we skip API inside the function above.
  matcher: ["/:path*"],
};
