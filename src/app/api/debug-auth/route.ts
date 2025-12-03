// src/app/api/debug-auth/route.ts
import { NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/server";
export async function GET() {
  try {
   const supabase = createRouteClient();
    const { data, error } = await supabase.auth.getUser();

    return NextResponse.json(
      {
        ok: !error,
        error: error?.message || null,
        user: data?.user || null,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("debug-auth error:", err);
    return NextResponse.json(
      {
        ok: false,
        error: err?.message || "unexpected error",
        user: null,
      },
      { status: 500 }
    );
  }
}
