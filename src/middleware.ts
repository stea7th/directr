// src/middleware.ts
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// ✅ Only run on protected areas
export const config = {
  matcher: ['/app/:path*', '/dashboard/:path*'], // adjust to your protected prefixes
};

export function middleware(req: NextRequest) {
  // If you don’t have a reliable auth cookie yet, keep this super light:
  // Let everything through for now, or redirect based on a simple flag you set after login.
  // Example placeholder:
  const hasAuthCookie =
    req.cookies.get('sb-access-token') ||
    req.cookies.get('supabase-auth-token') || // if you set it
    req.cookies.get('directr-auth');          // your own cookie

  if (!hasAuthCookie) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  return NextResponse.next();
}
