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
  const jar = await cookies(); // Next 15: cookies() may be Promise-like here
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

  const { data: ures, error: uerr } = await supabase.auth.getUser();
  if (uerr || !ures?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // -------- YOUR LOGIC HERE --------
  // const body = await req.json();
  // ... do work using ures.user.id ...
  // e.g.:
  // const { data, error } = await supabase.from("projects").insert({ owner_id: ures.user.id, ...body }).select().single();
  // if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  // return NextResponse.json({ ok: true, project: data });
  // ---------------------------------

  return NextResponse.json({ ok: true, user: { id: ures.user.id } });
}
