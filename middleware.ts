// middleware.ts
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = [
  "/lock",
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
];

function isPublic(pathname: string) {
  if (PUBLIC_PATHS.includes(pathname)) return true;
  if (pathname.startsWith("/_next")) return true;
  if (pathname.startsWith("/api/lock")) return true; // if you have lock APIs
  return false;
}

export function middleware(req: NextRequest) {
  const enabled = process.env.SITE_LOCK_ENABLED === "true";
  if (!enabled) return NextResponse.next();

  const { pathname, search } = req.nextUrl;

  // allow lock page + next assets
  if (isPublic(pathname)) return NextResponse.next();

  // allow if cookie says unlocked
  const unlocked = req.cookies.get("directr_unlocked")?.value === "true";
  if (unlocked) return NextResponse.next();

  // otherwise redirect to lock + preserve where they tried to go
  const url = req.nextUrl.clone();
  url.pathname = "/lock";
  url.searchParams.set("from", pathname + search);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/:path*"], // <-- this is what prevents bypass
};
