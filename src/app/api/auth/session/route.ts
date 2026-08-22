import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function safeNext(value: unknown): string {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//")
    ? value
    : "/today";
}

function requestOrigin(request: NextRequest): string {
  const forwardedHost = request.headers.get("x-forwarded-host");
  if (process.env.NODE_ENV !== "development" && forwardedHost) {
    const protocol = request.headers.get("x-forwarded-proto") || "https";
    return `${protocol}://${forwardedHost}`;
  }
  return new URL(request.url).origin;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { action?: unknown; email?: unknown; password?: unknown; next?: unknown };
    const action = typeof body.action === "string" ? body.action : "signin";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const next = safeNext(body.next);

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }
    if (action !== "reset" && password.length < 6) {
      return NextResponse.json({ error: "Enter a password with at least 6 characters." }, { status: 400 });
    }

    const supabase = await createServerClient();
    const origin = requestOrigin(request);

    if (action === "signin") {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error || !data.session || !data.user) {
        return NextResponse.json({ error: error?.message || "Sign-in did not create a session." }, { status: 401 });
      }
      return NextResponse.json({ success: true, next, email: data.user.email });
    }

    if (action === "signup") {
      const callback = `${origin}/auth/callback?next=${encodeURIComponent(next)}`;
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: callback },
      });
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({
        success: true,
        next,
        requiresConfirmation: !data.session,
        message: data.session ? "Your account is ready." : "Check your email to confirm your account.",
      });
    }

    if (action === "reset") {
      const callback = `${origin}/auth/callback?next=${encodeURIComponent("/reset/new")}`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: callback });
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ success: true, message: "Check your email for the reset link." });
    }

    return NextResponse.json({ error: "Unknown authentication action." }, { status: 400 });
  } catch (error) {
    console.error("Directr authentication failed", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Sign-in is temporarily unavailable. Try again in a moment." }, { status: 500 });
  }
}
