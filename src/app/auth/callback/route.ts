// src/app/auth/callback/route.ts
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const next = url.searchParams.get("next") || "/create";
  const code = url.searchParams.get("code");
  if (!code) return NextResponse.redirect(new URL("/login", url.origin));

  const supabase = createServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(new URL("/login?error=oauth", url.origin));

  return NextResponse.redirect(new URL(next, url.origin));
}
