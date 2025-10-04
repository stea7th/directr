// src/middleware.ts
import { NextResponse, NextRequest } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // 1) Always allow these paths with NO auth redirects
  const publicRoutes = [
    '/',                 // landing
    '/favicon.ico',
    '/reset',            // request email page
    '/reset/confirm',    // the page your email should land on
    '/signup',
    '/login',
    '/api',              // your APIs
  ]

  // Also allow anything under these prefixes
  const publicPrefixes = ['/reset/', '/api/', '/_next/', '/public/', '/assets/']

  const isPublic =
    publicRoutes.includes(pathname) ||
    publicPrefixes.some((p) => pathname.startsWith(p)) ||
    pathname.match(/\.(png|jpg|jpeg|svg|gif|webp|ico|txt|xml|css|js)$/)

  if (isPublic) {
    return NextResponse.next()
  }

  // 2) For protected stuff, gate by session
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()

  // If not logged in, send to login (adjust if you want)
  if (!session) {
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // Otherwise allow
  return res
}

// 3) Apply middleware to everything *except* next internals & static files
export const config = {
  matcher: [
    '/((?!_next/|.*\\.(?:.*)|favicon.ico).*)',
  ],
}
