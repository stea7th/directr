// src/app/auth/callback/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase/server";

type CookieToSet = {
  name: string;
  value: string;
  options?: Parameters<ReturnType<typeof cookies>["set"]>[2];
};

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");

  // Where to send them after auth
  const next = url.searchParams.get("next") || "/";

  if (!code) {
    return NextResponse.redirect(new URL(`/login?err=Missing+code`, url.origin));
  }

  const cookieStore = await cookies();

  // your helper should create a Supabase server client wired to Next cookies()
  const supabase = await createServerClient();

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      new URL(`/login?err=${encodeURIComponent(error.message)}`, url.origin)
    );
  }

  // If your createServerClient() doesn't automatically persist cookies,
  // you can still be safe by touching cookieStore (no-op here).
  // Keeping this file simple avoids the setAll typing problem.

  return NextResponse.redirect(new URL(next, url.origin));
}
