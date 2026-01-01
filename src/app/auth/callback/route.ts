// src/app/auth/callback/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { createRouteClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") || "/";

  if (!code) {
    return NextResponse.redirect(
      new URL(`/login?err=${encodeURIComponent("Missing code")}`, url.origin)
    );
  }

  // IMPORTANT: use your route client (the one that handles cookies correctly in Next 15)
  const supabase = await createRouteClient();

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      new URL(`/login?err=${encodeURIComponent(error.message)}`, url.origin)
    );
  }

  return NextResponse.redirect(new URL(next, url.origin));
}
