// src/app/auth/callback/route.ts
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/create";

  if (code) {
    const supabase = await createServerClient();

    // This tells Supabase to turn the "code" in the URL
    // into a real session and set the auth cookies.
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    console.log("exchangeCodeForSession", { data, error });
  }

  // After we set the session, send user into the app.
  return NextResponse.redirect(new URL(next, url.origin));
}
