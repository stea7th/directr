// src/middleware.ts
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Always allow the password reset flow and general assets
  if (
    pathname.startsWith('/reset/') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/static')
  ) {
    return NextResponse.next();
  }

  // If you guard other areas, do it here. Example:
  const needsAuth =
    pathname.startsWith('/app') ||
    pathname.startsWith('/planner') ||
    pathname.startsWith('/create') ||
    pathname.startsWith('/clipper');

  if (!needsAuth) return NextResponse.next();

  // Supabase cookie set when a session exists
  const hasSession =
    req.cookies.has('sb-access-token') || req.cookies.has('sb-refresh-token');

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
