import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// tight email check (works for real emails, blocks garbage)
function isValidEmail(email: string) {
  const e = email.trim();
  if (!e || e.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(e);
}

function supabaseAdmin() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    "";

  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE ||
    "";

  if (!url || !key) throw new Error("Missing Supabase admin env vars");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";

    let email = "";
    let name = "";
    let source = "directr.so";

    // Accept JSON OR FormData (so ANY front-end works)
    if (contentType.includes("application/json")) {
      const body = await req.json().catch(() => ({} as any));
      email = String(body?.email ?? body?.Email ?? body?.emailAddress ?? body?.value ?? "").trim();
      name = String(body?.name ?? body?.fullName ?? "").trim();
      source = String(body?.source ?? source).trim();
    } else {
      const form = await req.formData();
      email = String(form.get("email") ?? form.get("Email") ?? form.get("emailAddress") ?? "").trim();
      name = String(form.get("name") ?? form.get("fullName") ?? "").trim();
      source = String(form.get("source") ?? source).trim();
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        {
          success: false,
          error: "Enter a valid email.",
          debug: { receivedEmail: email ? email.slice(0, 3) + "…" : "(empty)" },
        },
        { status: 400 }
      );
    }

    // Save to Supabase (server-only)
    const admin = supabaseAdmin();

    // Create a table called: waitlist
    // Columns: email (text, unique), name (text, nullable), source (text, nullable), created_at (timestamptz default now())
    //
    // This insert is resilient:
    // - duplicates won’t crash if email is unique
    const { error } = await admin.from("waitlist").insert({
      email: email.toLowerCase(),
      name: name || null,
      source: source || null,
    });

    if (error) {
      // If duplicate (already on waitlist), still treat as success
      // Postgres unique violation code: 23505
      const code = (error as any)?.code;
      if (code === "23505") {
        return NextResponse.json({ success: true, already: true });
      }

      return NextResponse.json(
        {
          success: false,
          error: "waitlist_insert_failed",
          details: error.message,
          code: (error as any)?.code ?? null,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "server_error", details: err?.message || String(err) },
      { status: 500 }
    );
  }
}
