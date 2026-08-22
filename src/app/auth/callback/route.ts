// src/app/auth/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const requestedNext = url.searchParams.get("next") ?? "/today";
  const next = requestedNext.startsWith("/") && !requestedNext.startsWith("//") ? requestedNext : "/today";
  const forwardedHost = req.headers.get("x-forwarded-host");
  const origin = process.env.NODE_ENV === "development" || !forwardedHost ? url.origin : `https://${forwardedHost}`;

  if (!code) {
    return NextResponse.redirect(new URL(`/login?err=${encodeURIComponent("Missing code")}`, origin));
  }

  const supabase = await createServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      new URL(`/login?err=${encodeURIComponent(error.message)}`, origin)
    );
  }

  return NextResponse.redirect(new URL(next, origin));
}
