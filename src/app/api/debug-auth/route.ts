// src/app/api/debug-auth/route.ts
import { NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    // ✅ Next 15: createRouteClient is async
    const supabase = await createRouteClient();

    const { data, error } = await supabase.auth.getUser();

    return NextResponse.json({
      success: true,
      user: data?.user ?? null,
      error: error ? { message: error.message, status: (error as any).status } : null,
    });
  } catch (err: any) {
    console.error("debug-auth error:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Debug auth failed",
        details: err?.message || String(err),
      },
      { status: 500 }
    );
  }
}
