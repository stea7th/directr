// src/app/api/jobs/route.ts
import { NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    // ✅ MUST await (your helper is async now)
    const supabase = await createRouteClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { data: jobs, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, jobs: jobs ?? [] });
  } catch (err: any) {
    console.error("jobs GET error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to load jobs", details: err?.message || String(err) },
      { status: 500 }
    );
  }
}

