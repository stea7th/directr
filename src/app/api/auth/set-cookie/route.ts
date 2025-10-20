import { NextResponse } from "next/server";

type Body = {
  access_token: string;
  refresh_token: string;
  expires_in?: number;   // seconds
  expires_at?: number;   // epoch seconds
};

function getProjectRefFromUrl(url: string | undefined) {
  if (!url) return null;
  // e.g. https://abcd1234.supabase.co -> abcd1234
  const m = url.match(/^https?:\/\/([a-z0-9-]+)\.supabase\.co/i);
  return m?.[1] || null;
}

export async function POST(req: Request) {
  const { access_token, refresh_token, expires_in, expires_at } = (await req.json()) as Body;

  if (!access_token || !refresh_token) {
    return NextResponse.json({ error: "Missing tokens" }, { status: 400 });
  }

  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const projectRef = getProjectRefFromUrl(SUPABASE_URL || "");

  const now = Math.floor(Date.now() / 1000);
  const exp = typeof expires_at === "number" ? expires_at : now + (expires_in || 60 * 60);
  const maxAge = Math.max(60, exp - now);

  const res = NextResponse.json({ ok: true });

  // Generic names (what we set earlier)
  res.cookies.set("sb-access-token", access_token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge,
  });
  res.cookies.set("sb-refresh-token", refresh_token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: Math.max(maxAge, 60 * 60 * 24 * 14),
  });

  // Supabase project-ref names (what many server helpers expect)
  if (projectRef) {
    res.cookies.set(`sb-${projectRef}-auth-token`, access_token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge,
    });
    res.cookies.set(`sb-${projectRef}-refresh-token`, refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: Math.max(maxAge, 60 * 60 * 24 * 14),
    });
  }

  return res;
}
