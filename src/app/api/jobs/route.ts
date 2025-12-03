// src/app/api/jobs/route.ts
import { NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
  try {
    const supabase = createRouteClient();

    // Who is this?
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user?.id) {
      return NextResponse.json(
        { error: "Not signed in" },
        { status: 401 }
      );
    }

    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    // If ?id=... → return that single job
    if (id) {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error("Error fetching job by id:", error);
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({ job: data }, { status: 200 });
    }

    // Otherwise → return latest jobs for this user
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      console.error("Error fetching jobs list:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ jobs: data }, { status: 200 });
  } catch (err: any) {
    console.error("Jobs API error:", err);
    return NextResponse.json(
      { error: err?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
