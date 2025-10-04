import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const PUBLIC_PATHS = new Set([
  '/', '/login', '/signup',
  '/reset', '/reset/confirm',
  '/favicon.ico', '/robots.txt', '/icon.svg'
]);

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Always allow Next internals and static assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/public') ||
    pathname.match(/\.(png|jpg|jpeg|gif|webp|svg|ico|txt|xml)$/)
  ) return NextResponse.next();

  // Always allow these routes (even if user is signed in)
  if (PUBLIC_PATHS.has(pathname) || pathname.startsWith('/reset')) {
    return NextResponse.next();
  }

  // If you have logic that pushes signed-in users to /app,
  // keep it — but make sure it *never* runs for /reset routes.
  return NextResponse.next();
}
