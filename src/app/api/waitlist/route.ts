// src/app/api/waitlist/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = String(body.email || "").trim().toLowerCase();
    const name = String(body.name || "").trim();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Enter a valid email." },
        { status: 400 }
      );
    }

    // ✅ for now: just succeed (so your UI works)
    // later we can save to Supabase, Beehiiv, ConvertKit, etc.
    return NextResponse.json({ success: true, email, name });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Waitlist failed.", details: err?.message || String(err) },
      { status: 500 }
    );
  }
}
