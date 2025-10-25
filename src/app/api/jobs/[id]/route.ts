import { NextResponse } from "next/server";
import { supabaseFromCookies } from "../../../../lib/supabase/server";
// If you wire real models later:
// import OpenAI from "openai";
// import Replicate from "replicate";
// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
// const replicate = new Replicate({ auth: process.env.REPLICATE_API_KEY });

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

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await supabaseFromCookies();

  const { data: ures } = await supabase.auth.getUser();
  if (!ures?.user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  // load job
  const { data: job, error: jerr } = await supabase.from("jobs").select("*").eq("id", id).maybeSingle();
  if (jerr) return NextResponse.json({ error: jerr.message }, { status: 400 });
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // set processing
  const { error: e1 } = await supabase.from("jobs").update({ status: "processing" }).eq("id", id);
  if (e1) return NextResponse.json({ error: e1.message }, { status: 400 });

  try {
    // ---- DEMO PIPELINE SWITCH (replace with real logic) ----
    let result_url: string | null = null;
    let result_text: string | null = null;

    switch (job.type) {
      case "hook_finder": {
        // Replace with real LLM call and transcript usage
        result_text = `Top Hooks (demo):
1) This is the moment everything changes…
2) Stop scrolling: you’re missing THIS.
3) I tested what nobody else would…`;
        break;
      }
      case "clip": {
        // Replace with real video model/process
        // result_url = "https://your-storage/public/jobs/clip-<id>.mp4";
        result_text = "Clip created (demo). Plug in your real processor.";
        break;
      }
      case "text_overlay": {
        // Replace with compositor pipeline
        result_text = "Overlay applied (demo).";
        break;
      }
      default: {
        result_text = `Unknown job type: ${job.type ?? "(none)"}`;
      }
    }

    const { error: e2 } = await supabase
      .from("jobs")
      .update({ status: "done", result_url, result_text })
      .eq("id", id);

    if (e2) return NextResponse.json({ error: e2.message }, { status: 400 });
    return NextResponse.json({ ok: true, result_url, result_text });
  } catch (err: any) {
    await supabase.from("jobs").update({ status: "error", result_text: String(err?.message || err) }).eq("id", id);
    return NextResponse.json({ error: String(err?.message || err) }, { status: 500 });
  }
}
