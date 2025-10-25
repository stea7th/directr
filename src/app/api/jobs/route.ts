import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

/* === inline supabaseFromCookies (no external imports) === */
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

function projectRefFromUrl(url: string) {
  const m = url.match(/^https?:\/\/([a-z0-9-]+)\.supabase\.co/i);
  return m?.[1] || null;
}

async function supabaseFromCookies() {
  const jar = await cookies();
  const ref = projectRefFromUrl(SUPABASE_URL);
  const accessToken =
    jar.get("sb-access-token")?.value ||
    (ref ? jar.get(`sb-${ref}-auth-token`)?.value : undefined) ||
    "";

  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
    global: accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : {},
  });
}
/* === end inline helper === */

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
