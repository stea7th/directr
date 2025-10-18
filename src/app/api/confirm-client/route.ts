import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Use your public URL + anon key. These must be set in Vercel Project Settings.
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(req: Request) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return NextResponse.json(
      { error: "Supabase env vars are missing" },
      { status: 500 }
    );
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
  });

  // Read query params from the request URL
  const { searchParams } = new URL(req.url);
  const token =
    searchParams.get("token") ||
    searchParams.get("token_hash") ||
    searchParams.get("code");
  const type = searchParams.get("type") || "recovery"; // e.g. "recovery" | "signup" | "email_change"

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  // Verify the Supabase link token (recovery / email confirm)
  const { data, error } = await supabase.auth.verifyOtp({
    type: type as any,
    token_hash: token,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    message: "Account confirmed successfully.",
    user: data.user,
  });
}
