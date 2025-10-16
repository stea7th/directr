// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server';

const PROTECTED_PREFIXES = ['/app', '/planner', '/create', '/clipper']; // whatever you gate

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow reset flow and public assets/APIs to pass through
  if (
    pathname.startsWith('/reset/') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/static')
  ) {
    return NextResponse.next();
  }

  // If you protect certain areas, only redirect for those
  const needsAuth = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (!needsAuth) return NextResponse.next();

  // Your own session check; replace with your cookie or header logic
  const hasSession = req.cookies.has('sb-access-token'); // Supabase cookie name
  if (!hasSession) {
    const url = new URL('/signin', req.url);
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
};
