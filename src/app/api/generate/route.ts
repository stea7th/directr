import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createServerClient } from "@/lib/supabase/server";

// POST /api/generate
export async function POST(req: Request) {
  try {
    const supabase = await createServerClient();

    // (optional) make sure we have a user — aligns with your RLS
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    }

    const { prompt = "", fileName } = await req.json();

    // Build payload that matches your table + CHECK(status) constraint
    const payload = {
      id: randomUUID(),
      user_id: user.id,
      title: prompt?.slice(0, 80) || "Untitled Job",
      input_url: fileName || null,
      status: "queued",          // <-- must be one of allowed values
      file_name: fileName || null,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("jobs")
      .insert(payload)
      .select("id")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // TODO: kick your worker with data.id if needed
    return NextResponse.json({ id: data.id });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Failed" }, { status: 500 });
  }
}
