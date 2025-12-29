import { NextResponse } from "next/server";
export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const email = String(body.email || "").trim().toLowerCase();
  const name = String(body.name || "").trim();

  if (!email || !email.includes("@")) {
    return NextResponse.json(
      { success: false, error: "Enter a valid email." },
      { status: 400 }
    );
  }

  // TODO: insert into Supabase later
  return NextResponse.json({ success: true, email, name });
}
