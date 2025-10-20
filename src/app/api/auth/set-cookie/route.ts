import { NextResponse } from "next/server";

type Body = {
  access_token: string;
  refresh_token: string;
  // optional, if you pass it from the client
  expires_in?: number;   // seconds
  expires_at?: number;   // epoch seconds
};

export async function POST(req: Request) {
  const { access_token, refresh_token, expires_in, expires_at } = (await req.json()) as Body;

  if (!access_token || !refresh_token) {
    return NextResponse.json({ error: "Missing tokens" }, { status: 400 });
  }

  // Compute a sane cookie lifetime
  const now = Math.floor(Date.now() / 1000);
  const exp = typeof expires_at === "number" ? expires_at : now + (expires_in || 60 * 60); // default 1h
  const maxAge = Math.max(60, exp - now); // at least 1 minute

  const res = NextResponse.json({ ok: true });

  // Minimal cookie pair the server can read to validate the session.
  // (Names are your choice; keep them consistent with whatever your server check reads.)
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
    // refresh token usually lasts longer; give it ~2 weeks if we don't know exact exp
    maxAge: Math.max(maxAge, 60 * 60 * 24 * 14),
  });

  return res;
}
