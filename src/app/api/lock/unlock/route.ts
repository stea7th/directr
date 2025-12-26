import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { password, from } = await req.json().catch(() => ({}));
  const expected = process.env.SITE_LOCK_PASSWORD || "";

  if (!expected) {
    return NextResponse.json(
      { success: false, error: "SITE_LOCK_PASSWORD not set on server." },
      { status: 500 }
    );
  }

  if (!password || password !== expected) {
    return NextResponse.json({ success: false, error: "Wrong password." }, { status: 401 });
  }

  const redirectTo = typeof from === "string" && from.length ? from : "/create";

  const res = NextResponse.json({ success: true, redirectTo });
  res.cookies.set("directr_unlocked", "true", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
