// src/app/auth/callback/route.ts
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  // No code? Go back to login with an error
  if (!code) {
    return NextResponse.redirect(`${url.origin}/login?error=missing_code`);
  }

  const supabase = await createServerClient();

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("exchangeCodeForSession error:", error);
    return NextResponse.redirect(
      `${url.origin}/login?error=${encodeURIComponent(error.message)}`
    );
  }

  // ✅ At this point, Supabase should have set the auth cookies.
  // Send them to wherever you want after login:
  return NextResponse.redirect(`${url.origin}/create`);
}
