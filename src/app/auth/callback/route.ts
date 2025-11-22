// src/app/auth/callback/route.ts
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  // If Supabase didn't send a code, just go back to login with an error
  if (!code) {
    return NextResponse.redirect(`${url.origin}/login?error=missing_code`);
  }

  // Use your server helper to attach the Supabase session cookie
  const supabase = await createServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("exchangeCodeForSession error:", error);
    return NextResponse.redirect(
      `${url.origin}/login?error=${encodeURIComponent(error.message)}`
    );
  }

  // ✅ At this point a session cookie should be set.
  // Send them to the app (change /create to wherever you want to land after login)
  return NextResponse.redirect(`${url.origin}/create`);
}
