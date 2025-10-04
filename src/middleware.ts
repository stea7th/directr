// src/middleware.ts
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  // Only runs for /app/* (see matcher below)
  const hasSession =
    req.cookies.get('sb-access-token') || // Supabase v2 cookies
    req.cookies.get('supabase-auth-token'); // older packed cookie

  if (!hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// 👇 Limit middleware to private routes only
export const config = {
  matcher: ['/app/:path*'],
};
