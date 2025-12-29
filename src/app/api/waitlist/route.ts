import { NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

function cleanStr(v: unknown) {
  return typeof v === "string" ? v.trim() : "";
}

export async function POST(req: Request) {
  try {
    const supabase = await createRouteClient();

    const body = await req.json().catch(() => ({}));
    const email = cleanStr(body?.email).toLowerCase();
    const name = cleanStr(body?.name);

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Invalid email." },
        { status: 400 }
      );
    }

    // expects a table named: waitlist
    // columns: email (text, unique), name (text, nullable), created_at (timestamp default now())
    const { error } = await supabase
      .from("waitlist")
      .upsert(
        { email, name: name || null },
        { onConflict: "email" }
      );

    if (error) {
      console.error("waitlist insert error:", error);
      return NextResponse.json(
        { success: false, error: "Waitlist insert failed.", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("waitlist route error:", err);
    return NextResponse.json(
      { success: false, error: "Waitlist failed.", details: err?.message || String(err) },
      { status: 500 }
    );
  }
}
