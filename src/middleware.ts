// src/middleware.ts
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Everything here must be allowed WITHOUT a session
const PUBLIC: RegExp[] = [
  /^\/reset(\/.*)?$/,          // <-- allow /reset and /reset/confirm/new etc.
  /^\/auth\/callback(\/.*)?$/,
  /^\/login$/,
  /^\/signup$/,
  /^\/api\/auth\/.*/,
  /^\/_next\/.*/,
  /^\/favicon\.ico$/,
  /^\/robots\.txt$/,
  /^\/sitemap\.xml$/,
];

const PROTECTED: RegExp[] = [
  /^\/$/,               // your landing/dashboard
  /^\/create/,
  /^\/clipper/,
  /^\/planner/,
  /^\/jobs/,
  /^\/account/,
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1) Public routes go straight through
  if (PUBLIC.some((re) => re.test(pathname))) {
    return NextResponse.next();
  }

  // 2) Non-protected routes go through as well
  if (!PROTECTED.some((re) => re.test(pathname))) {
    return NextResponse.next();
  }

  // 3) Guard protected routes by presence of Supabase cookies
  const hasSession =
    req.cookies.has('sb-access-token') ||
    req.cookies.has('sb:token') ||
    req.cookies.has('supabase-auth-token');

  if (!hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname || '/');
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/(.*)'],
};
