// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
export function middleware(req: NextRequest) {
  const { pathname, href } = req.nextUrl;

  // ✅ Allow Supabase recovery links to pass through untouched
  if (href.includes("#access_token") || pathname.startsWith("/reset")) {
    return NextResponse.next();
  }
// Only these paths require a logged-in session cookie.
const PROTECTED = [/^\/$/, /^\/create/, /^\/clipper/, /^\/planner/, /^\/jobs/];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Always allow password reset flow
  if (pathname.startsWith('/reset')) return NextResponse.next();

  // Allow Next.js internals, static files, and APIs
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/assets')
  ) {
    return NextResponse.next();
  }

  // Gate protected routes by Supabase auth cookies (adjust names if yours differ)
  if (PROTECTED.some((re) => re.test(pathname))) {
    const hasSb =
      req.cookies.get('sb-access-token') || req.cookies.get('sb-session');
    if (!hasSb) {
      const url = req.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

// Match all “pages” (not files with extensions)
export const config = {
  matcher: ['/((?!.*\\.[\\w]+$).*)'],
};
