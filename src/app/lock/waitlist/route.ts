// src/app/api/waitlist/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

function cleanEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function POST(req: Request) {
  try {
    const { email } = (await req.json()) as { email?: string };
    const e = cleanEmail(String(email || ""));

    if (!e || !e.includes("@")) {
      return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceKey) {
      return NextResponse.json(
        { error: "Missing Supabase env vars (URL or SERVICE ROLE KEY)." },
        { status: 500 }
      );
    }

    const supabase = createClient(url, serviceKey);

    // "waitlist" table: id uuid, email text unique, created_at timestamptz
    const { error } = await supabase
      .from("waitlist")
      .insert({ email: e });

    // If duplicate email, treat as success
    if (error && String(error.message).toLowerCase().includes("duplicate")) {
      return NextResponse.json({ ok: true, already: true });
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to join waitlist." },
      { status: 500 }
    );
  }
}
