// src/app/api/waitlist/route.ts
import { NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

function safeStr(v: unknown) {
  return typeof v === "string" ? v : v == null ? "" : String(v);
}

export async function POST(req: Request) {
  try {
    const supabase = await createRouteClient();

    const body = await req.json().catch(() => ({}));
    const email = safeStr(body?.email).trim().toLowerCase();
    const name = safeStr(body?.name).trim() || null;

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Invalid email." },
        { status: 400 }
      );
    }

    // Upsert by email so re-submitting doesn't error
    const { error } = await supabase
      .from("waitlist")
      .upsert({ email, name }, { onConflict: "email" });

    if (error) {
      console.error("waitlist insert error:", error);
      return NextResponse.json(
        { success: false, error: "Database error." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("waitlist error:", err);
    return NextResponse.json(
      { success: false, error: "Failed.", details: err?.message || String(err) },
      { status: 500 }
    );
  }
}
