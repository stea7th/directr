import { NextResponse } from "next/server";
import { supabaseFromCookies } from "../../../lib/supabase/server";

export async function POST(req: Request) {
  const supabase = await supabaseFromCookies();

  const { data: ures } = await supabase.auth.getUser();
  if (!ures?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    title?: string;
    prompt?: string;
    type?: string;      // e.g., "hook_finder" | "clip" | "text_overlay"
    input_url?: string; // optional video/file input
  };

  const insert = {
    owner_id: ures.user.id,
    title: body.title ?? "Untitled Job",
    prompt: body.prompt ?? "",
    type: body.type ?? "hook_finder",
    input_url: body.input_url ?? null,
    status: "queued",
  };

  const { data, error } = await supabase
    .from("jobs")
    .insert(insert)
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ id: data.id });
}
