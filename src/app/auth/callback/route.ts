// src/app/auth/callback/route.ts
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${url.origin}/login?error=missing_code`);
  }

  const supabase = createServerClient();

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("exchangeCodeForSession error:", error);
    return NextResponse.redirect(
      `${url.origin}/login?error=${encodeURIComponent(error.message)}`
    );
  }

  // ✅ user cookies are now set
  return NextResponse.redirect(`${url.origin}/create`);
}
