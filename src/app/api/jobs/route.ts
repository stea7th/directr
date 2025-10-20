import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

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

export async function POST(req: Request) {
  const supabase = await supabaseFromCookies();

  const { data: ures } = await supabase.auth.getUser();
  if (!ures?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    title?: string;
    prompt?: string;
  };

  // Detect available columns on the 'jobs' table
  const { data: cols, error: colsErr } = await supabase
    .from("information_schema.columns")
    .select("column_name")
    .eq("table_schema", "public")
    .eq("table_name", "jobs");

  if (colsErr || !cols) {
    return NextResponse.json(
      { error: colsErr?.message || "Could not inspect jobs table" },
      { status: 500 }
    );
  }

  const has = (name: string) => cols.some((c: any) => c.column_name === name);

  // Build minimal safe insert
  const insert: Record<string, any> = {};
  if (has("title")) insert.title = body.title ?? "New Job";
  if (has("prompt")) insert.prompt = body.prompt ?? null;
  if (has("owner_id")) insert.owner_id = ures.user.id;
  if (has("status")) insert.status = "queued";
  if (has("created_at")) insert.created_at = new Date().toISOString();

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
