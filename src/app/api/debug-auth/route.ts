// src/app/api/debug-auth/route.ts
import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createServerClient();

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    return NextResponse.json({
      ok: !error,
      error: error?.message ?? null,
      user: user
        ? { id: user.id, email: user.email, created_at: user.created_at }
        : null,
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "debug-auth error" },
      { status: 500 }
    );
  }
}
