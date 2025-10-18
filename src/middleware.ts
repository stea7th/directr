// src/middleware.ts
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// --- Helpers ---
function isPublic(pathname: string) {
  // Entire password reset flow
  if (pathname.startsWith('/reset')) return true;

  // Auth callback routes (if you use them)
  if (pathname.startsWith('/auth/callback')) return true;

  // Public pages
  if (pathname === '/login' || pathname === '/signup') return true;

  // Static runtime stuff
  if (pathname.startsWith('/_next')) return true;
  if (pathname === '/favicon.ico') return true;
  if (pathname === '/robots.txt') return true;
  if (pathname === '/sitemap.xml') return true;

  return false;
}

const PROTECTED_ROOTS = ['/', '/create', '/clipper', '/planner', '/jobs', '/account'];

function isProtected(pathname: string) {
  return PROTECTED_ROOTS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function hasSupabaseSession(req: NextRequest) {
  // Supabase v2 cookies
  if (req.cookies.has('sb-access-token')) return true;
  if (req.cookies.has('sb-refresh-token')) return true;

  // Legacy cookie (array json string sometimes)
  const legacy = req.cookies.get('supabase-auth-token')?.value;
  if (legacy && legacy.length > 0) return true;

  return false;
}

// --- Middleware ---
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip API and webhooks entirely (auth handled per-route)
  if (pathname.startsWith('/api')) return NextResponse.next();

  // Always allow public routes
  if (isPublic(pathname)) return NextResponse.next();

  // If not a protected route, allow
  if (!isProtected(pathname)) return NextResponse.next();

  // Guard protected routes
  if (!hasSupabaseSession(req)) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname || '/');
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Only run on app paths, skip static assets and api for speed & safety
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|images/|fonts/|api/).*)',
  ],
};
