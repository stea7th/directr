// src/middleware.ts
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

/**
 * IMPORTANT: The password reset link carries the tokens in the URL HASH
 * (/#access_token=...), which the server never sees. If we redirect those
 * requests (e.g., to /login), the hash is lost. So we must allow /reset/*
 * through untouched, and we should NOT protect "/" either.
 */

// Routes that require an authenticated session cookie.
const PROTECTED = [/^\/create/, /^\/clipper/, /^\/planner/, /^\/jobs/];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Always allow the entire reset flow: /reset, /reset/confirm, etc.
  if (pathname.startsWith('/reset')) {
    return NextResponse.next();
  }

  // Public paths that should never be blocked
  if (
    pathname === '/' ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/auth') || // oauth callbacks if you use them
    pathname.startsWith('/api')     // your APIs handle auth themselves
  ) {
    return NextResponse.next();
  }

  // Check if this path is protected
  const needsAuth = PROTECTED.some((re) => re.test(pathname));
  if (!needsAuth) return NextResponse.next();

  // If protected, require the Supabase session cookie
  // (sb:token is the default cookie prefix; adapt if you’ve customized)
  const hasSession =
    req.cookies.has('sb:token') ||
    req.cookies.get('sb-access-token') ||
    req.cookies.get('sb:access-token');

  if (hasSession) return NextResponse.next();

  // Not authenticated: send to login WITHOUT touching hash-based flows.
  const url = req.nextUrl.clone();
  url.pathname = '/login';
  url.searchParams.set('next', pathname || '/');
  return NextResponse.redirect(url);
}

// Only run on app routes (exclude _next/static, images, etc.)
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
};
