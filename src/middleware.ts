import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const url = req.nextUrl;

  // Catch Supabase reset flow hash links like /?access_token=...
  if (url.hash.includes('access_token') && url.pathname === '/') {
    url.pathname = '/reset/confirm';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}
