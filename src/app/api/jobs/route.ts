import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

/* === inline supabaseFromCookies === */
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
/* === end helper === */

export async function POST(req: Request) {
  const supabase = await supabaseFromCookies();

  const { data: ures } = await supabase.auth.getUser();
  if (!ures?.user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as {
    title?: string;
    prompt?: string;
    type?: "hooks" | "caption" | "clip" | "resize";
    input_url?: string;
    params?: Record<string, unknown>;
  };

  const insert = {
    owner_id: ures.user.id,
    title: body.title ?? "Untitled Job",
    prompt: body.prompt ?? "",
    type: body.type ?? "hooks",
    input_url: body.input_url ?? null,
    params: body.params ?? null,
    status: "queued",
  };

  const { data, error } = await supabase
    .from("jobs")
    .insert(insert)
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // Kick off processing immediately (fire-and-forget)
  fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/jobs/${data.id}`, { method: "POST" }).catch(
    () => {}
  );

  return NextResponse.json({ id: data.id });
}
