import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Paths that require auth (everything else is public)
const PROTECTED = [/^\/$/, /^\/create/, /^\/clipper/, /^\/planner/, /^\/jobs/];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Always allow password reset + auth callbacks + static + API
  if (pathname.startsWith('/reset')) return NextResponse.next();
  if (pathname.startsWith('/auth')) return NextResponse.next();
  if (pathname.startsWith('/_next')) return NextResponse.next();
  if (pathname.startsWith('/api')) return NextResponse.next();
  if (/\.(png|jpg|jpeg|gif|svg|ico|txt|json|webp|mp4|mp3)$/i.test(pathname)) return NextResponse.next();

  const isProtected = PROTECTED.some((re) => re.test(pathname));
  if (!isProtected) return NextResponse.next();

  // Supabase cookies (any of these means "signed in")
  const hasSession =
    req.cookies.get('sb-access-token') ||
    req.cookies.get('sb:token') ||
    req.cookies.get('sb-session');

  if (!hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Run on all pages except static files; we still early-return for /reset above.
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
