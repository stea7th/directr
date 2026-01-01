import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST() {
  try {
    const supabase = await createServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "unauthorized" },
        { status: 401 }
      );
    }

    // ✅ LIMIT GUARD (same rules as /api/generate)
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("is_pro, generations_used")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      console.error("Profile fetch error:", profileError);
      return NextResponse.json(
        { success: false, error: "profile_missing" },
        { status: 500 }
      );
    }

    const isPro = !!profile.is_pro;
    const used = Number(profile.generations_used ?? 0);
    const FREE_LIMIT = 3;

    if (!isPro && used >= FREE_LIMIT) {
      return NextResponse.json(
        { success: false, error: "limit_reached" },
        { status: 402 }
      );
    }

    // 🔧 Not wired yet — DO NOT increment usage here
    // When you wire the real clipper, we’ll increment ONLY after success.

    return NextResponse.json({
      success: false,
      error: "Not wired yet",
    });
  } catch (err: any) {
    console.error("clipper error:", err);
    return NextResponse.json(
      { success: false, error: "Server error", details: err?.message || String(err) },
      { status: 500 }
    );
  }
}
