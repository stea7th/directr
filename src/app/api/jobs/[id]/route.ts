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

/* === external API keys you must set in Vercel ===
OPENAI_API_KEY
REPLICATE_API_TOKEN
REPLICATE_MODEL_CLIPPER   (e.g. "owner/model:version")
REPLICATE_MODEL_RESIZER   (e.g. "owner/model:version")
*/

async function openaiJSON(body: any) {
  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`OpenAI error: ${await r.text()}`);
  return (await r.json()) as any;
}

async function openaiTranscribe(url: string): Promise<string> {
  // Simple fetch+pipe method: Whisper via OpenAI input_audio with URL
  // If your file is in Supabase storage, pass its public URL here.
  const r = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: (() => {
      const form = new FormData();
      // OpenAI prefers file uploads; if you only have a URL, fetch and re-upload
      // For demo, we just pass the URL as "file_url"
      form.append("file_url", url);
      form.append("model", "whisper-1");
      return form;
    })(),
  });
  if (!r.ok) throw new Error(`Transcription error: ${await r.text()}`);
  const data = await r.json();
  // API shape differences exist; adapt to your account’s response
  return data.text ?? data?.results?.[0]?.text ?? "";
}

async function replicateRun(model: string, input: Record<string, unknown>) {
  const r = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.REPLICATE_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ version: model, input }),
  });
  if (!r.ok) throw new Error(`Replicate start error: ${await r.text()}`);
  const start = await r.json();

  // poll
  let pred = start;
  for (let i = 0; i < 120; i++) {
    if (pred.status === "succeeded" || pred.status === "failed" || pred.status === "canceled") break;
    await new Promise((res) => setTimeout(res, 2000));
    const rr = await fetch(`https://api.replicate.com/v1/predictions/${pred.id}`, {
      headers: { Authorization: `Bearer ${process.env.REPLICATE_API_TOKEN}` },
    });
    pred = await rr.json();
  }
  if (pred.status !== "succeeded") throw new Error(`Replicate failed: ${pred.status}`);
  return pred;
}

/* =============== ROUTES =============== */

// GET /api/jobs/:id  -> return job
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await supabaseFromCookies();

  const { data, error } = await supabase.from("jobs").select("*").eq("id", id).maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(data);
}

// POST /api/jobs/:id  -> process job
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await supabaseFromCookies();

  const { data: ures } = await supabase.auth.getUser();
  if (!ures?.user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { data: job, error: jerr } = await supabase.from("jobs").select("*").eq("id", id).maybeSingle();
  if (jerr) return NextResponse.json({ error: jerr.message }, { status: 400 });
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // set processing
  await supabase.from("jobs").update({ status: "processing", started_at: new Date().toISOString() }).eq("id", id);

  try {
    let result_url: string | null = null;
    let result_text: string | null = null;

    switch (job.type) {
      case "hooks": {
        // If you have input_url, try to transcribe it first; else use prompt as source text.
        const sourceText =
          (job.input_url ? await openaiTranscribe(job.input_url) : null) || job.prompt || "";
        const completion = await openaiJSON({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "You are a viral content strategist. From the transcript, extract three thumb-stopping hook lines (10 words max each). Return as numbered lines.",
            },
            { role: "user", content: sourceText.slice(0, 12000) },
          ],
          temperature: 0.7,
        });
        result_text = completion.choices?.[0]?.message?.content?.trim() || "No hooks produced.";
        break;
      }

      case "caption": {
        if (!job.input_url) throw new Error("Missing input_url for caption job");
        const transcript = await openaiTranscribe(job.input_url);
        // Keep it simple: return transcript as result_text. You can add SRT formatting later.
        result_text = transcript || "No transcript.";
        break;
      }

      case "clip": {
        if (!process.env.REPLICATE_MODEL_CLIPPER) throw new Error("REPLICATE_MODEL_CLIPPER not set");
        if (!job.input_url) throw new Error("Missing input_url for clip job");
        const pred = await replicateRun(process.env.REPLICATE_MODEL_CLIPPER, {
          video_url: job.input_url,
          ...(job.params || {}),
        });
        // Most video models return an array of URLs or a single URL in output
        result_url = Array.isArray(pred.output) ? pred.output[0] : pred.output;
        result_text = "Clip created.";
        break;
      }

      case "resize": {
        if (!process.env.REPLICATE_MODEL_RESIZER) throw new Error("REPLICATE_MODEL_RESIZER not set");
        if (!job.input_url) throw new Error("Missing input_url for resize job");
        const pred = await replicateRun(process.env.REPLICATE_MODEL_RESIZER, {
          video_url: job.input_url,
          target_aspect: (job.params?.["target_aspect"] as string) || "9:16",
          ...(job.params || {}),
        });
        result_url = Array.isArray(pred.output) ? pred.output[0] : pred.output;
        result_text = "Video resized.";
        break;
      }

      default:
        result_text = `Unknown job type: ${job.type ?? "(none)"}`;
    }

    const { error: e2 } = await supabase
      .from("jobs")
      .update({
        status: "done",
        result_url,
        result_text,
        finished_at: new Date().toISOString(),
        error: null,
      })
      .eq("id", id);

    if (e2) return NextResponse.json({ error: e2.message }, { status: 400 });
    return NextResponse.json({ ok: true, result_url, result_text });
  } catch (err: any) {
    await supabase
      .from("jobs")
      .update({
        status: "error",
        error: String(err?.message || err),
        finished_at: new Date().toISOString(),
      })
      .eq("id", id);
    return NextResponse.json({ error: String(err?.message || err) }, { status: 500 });
  }
}
