// src/middleware.ts
import { NextResponse, type NextRequest } from 'next/server';

// Paths that never require auth
const PUBLIC_PATHS = [
  /^\/reset(\/.*)?$/i,       // password reset flow
  /^\/auth\/callback/i,
  /^\/login/i,
  /^\/signup/i,
  /^\/api\/.*$/i,
  /^\/_next\/.*$/i,
  /^\/favicon\.ico$/i,
  /^\/robots\.txt$/i,
];

export function middleware(req: NextRequest) {
  const { pathname, href } = req.nextUrl;

  // ✅ Allow Supabase recovery links that come with a hash fragment
  if (href.includes('#access_token')) {
    return NextResponse.next();
  }

  // Public routes are allowed
  if (PUBLIC_PATHS.some((re) => re.test(pathname))) {
    return NextResponse.next();
  }

  // For everything else, require a Supabase session cookie
  const hasSession =
    req.cookies.has('sb-access-token') ||
    req.cookies.has('sb:token') ||
    req.cookies.has('sb-auth-token');

  if (!hasSession) {
    const url = new URL('/login', req.url);
    url.searchParams.set('redirect', pathname || '/');
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Run on everything except static assets
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt).*)'],
};
