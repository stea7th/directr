// src/middleware.ts
import { NextResponse, NextRequest } from 'next/server';

// Routes that never need auth
const PUBLIC = [
  /^\/login/i,
  /^\/signup/i,
  /^\/reset(\/.*)?$/i,     // /reset, /reset/confirm, /reset/new
  /^\/recover(\/.*)?$/i,   // optional bridge route if you use it
  /^\/auth\/callback/i,
  /^\/_next\/.*$/i,
  /^\/favicon\.ico$/i,
  /^\/robots\.txt$/i,
  /^\/sitemap\.xml$/i,
  /^\/api\/public(\/.*)?$/i, // keep if you have public APIs
];

// Routes that do need auth
const PROTECTED = [
  /^\/$/i,
  /^\/app(\/.*)?$/i,
  /^\/create(\/.*)?$/i,
  /^\/clipper(\/.*)?$/i,
  /^\/planner(\/.*)?$/i,
  /^\/jobs(\/.*)?$/i,
  /^\/campaigns(\/.*)?$/i,
  /^\/settings(\/.*)?$/i,
];

function hasSupabaseSessionCookie(req: NextRequest): boolean {
  // Supabase sets one of these, depending on your setup
  // - sb-<project-ref>-auth-token  (JSON array)
  // - sb-access-token / sb-refresh-token (older)
  // - supabase-auth-token (helpers)
  for (const c of req.cookies.getAll()) {
    const n = c.name;
    if (n.startsWith('sb-') && n.endsWith('-auth-token')) return true;
    if (n === 'sb-access-token' || n === 'sb-refresh-token') return true;
    if (n === 'supabase-auth-token') return true;
  }
  return false;
}

export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  // Always allow Supabase recovery flow so the client page can read the hash token
  if (searchParams.get('type') === 'recovery') {
    return NextResponse.next();
  }

  // Public routes are open
  if (PUBLIC.some((r) => r.test(pathname))) {
    return NextResponse.next();
  }

  // Only gate protected routes
  const needsAuth = PROTECTED.some((r) => r.test(pathname));
  if (!needsAuth) return NextResponse.next();

  // If we see a Supabase session cookie, let it through
  if (hasSupabaseSessionCookie(req)) {
    return NextResponse.next();
  }

  // No session → send to login and preserve intended path
  const url = req.nextUrl.clone();
  url.pathname = '/login';
  url.searchParams.set('redirect', pathname || '/');
  return NextResponse.redirect(url);
}

// Run on all app pages, skip Next internals and static assets
export const config = {
  matcher: ['/((?!_next|.*\\.(?:\\w+)$).*)'],
};
