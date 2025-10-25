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

// GET /api/jobs/:id
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await supabaseFromCookies();

  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(data);
}

// POST /api/jobs/:id  -> demo processor switch; replace with real pipelines
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await supabaseFromCookies();

  const { data: ures } = await supabase.auth.getUser();
  if (!ures?.user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { data: job, error: jerr } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (jerr) return NextResponse.json({ error: jerr.message }, { status: 400 });
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // set processing
  const { error: e1 } = await supabase.from("jobs").update({ status: "processing" }).eq("id", id);
  if (e1) return NextResponse.json({ error: e1.message }, { status: 400 });

  try {
    let result_url: string | null = null;
    let result_text: string | null = null;

    switch (job.type) {
      case "hook_finder":
        result_text = `Top Hooks (demo):
1) This is the moment everything changes…
2) Stop scrolling: you’re missing THIS.
3) I tested what nobody else would…`;
        break;

      case "clip":
        // Plug your real clip pipeline here; for now, demo text:
        result_text = "Clip created (demo). Plug in your real processor.";
        // result_url = "https://storage.example.com/jobs/clip-<id>.mp4";
        break;

      case "text_overlay":
        result_text = "Overlay applied (demo).";
        break;

      default:
        result_text = `Unknown job type: ${job.type ?? "(none)"}`;
    }

    const { error: e2 } = await supabase
      .from("jobs")
      .update({ status: "done", result_url, result_text })
      .eq("id", id);

    if (e2) return NextResponse.json({ error: e2.message }, { status: 400 });
    return NextResponse.json({ ok: true, result_url, result_text });
  } catch (err: any) {
    await supabase
      .from("jobs")
      .update({ status: "error", result_text: String(err?.message || err) })
      .eq("id", id);
    return NextResponse.json({ error: String(err?.message || err) }, { status: 500 });
  }
}
