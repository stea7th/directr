// src/app/debug-auth/route.ts
import { NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createRouteClient(); // ✅ await

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  return NextResponse.json({
    success: !error,
    user: user ?? null,
    error: error?.message ?? null,
  });
}
