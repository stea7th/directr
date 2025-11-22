// src/app/auth/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");

  if (!code) {
    // No code = nothing to exchange
    return NextResponse.redirect(
      new URL("/signin?error=missing_code", req.url)
    );
  }

  const supabase = await createServerClient();

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("exchangeCodeForSession error", error);
    return NextResponse.redirect(
      new URL(
        `/signin?error=${encodeURIComponent(error.message)}`,
        req.url
      )
    );
  }

  // ✅ Session cookie is now set. Send them into the app.
  return NextResponse.redirect(new URL("/create", req.url));
}
