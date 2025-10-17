// src/middleware.ts
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Routes that must ALWAYS be reachable without a session
const PUBLIC: RegExp[] = [
  /^\/$/,                         // allow home (optional; keep or remove)
  /^\/login(?:\/.*)?$/,
  /^\/signup(?:\/.*)?$/,
  /^\/auth\/callback(?:\/.*)?$/,
  /^\/reset(?:\/.*)?$/,           // ⬅️ reset + reset/confirm are public
  /^\/_next\/static/,
  /^\/_next\/image/,
  /^\/favicon\.ico$/,
  /^\/icons?(?:\/.*)?$/,
  /^\/images?(?:\/.*)?$/,
];

// Routes that actually require auth
const PROTECTED: RegExp[] = [
  /^\/app(?:\/.*)?$/,
  /^\/create(?:\/.*)?$/,
  /^\/clipper(?:\/.*)?$/,
  /^\/planner(?:\/.*)?$/,
  /^\/jobs(?:\/.*)?$/,
  /^\/settings(?:\/.*)?$/,
];

function isMatch(pathname: string, rules: RegExp[]) {
  return rules.some((r) => r.test(pathname));
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Never guard public assets or auth/reset pages
  if (isMatch(pathname, PUBLIC)) {
    return NextResponse.next();
  }

  // Detect a Supabase session cookie (covering both helper + js client cases)
  const hasSession =
    req.cookies.has('sb-access-token') ||
    req.cookies.has('sb:token') ||
    req.cookies.has('supabase-auth-token'); // legacy JSON cookie

  // Only block if the path is protected AND no session is present
  if (isMatch(pathname, PROTECTED) && !hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Apply to everything except static files we already handled above.
// (Keeps the matcher simple and prevents double-processing assets.)
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icons|images).*)'],
};
