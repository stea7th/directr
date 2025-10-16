import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // ✅ allow reset pages
  if (path.startsWith('/reset')) return NextResponse.next();

  // your normal auth logic here
  return NextResponse.next();
}
