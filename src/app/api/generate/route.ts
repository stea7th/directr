// src/app/api/generate/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createRouteClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

function safeStr(v: unknown) {
  return typeof v === "string" ? v : v == null ? "" : String(v);
}

function extractOutputText(res: any): string {
  try {
    // Prefer SDK helper if present
    if (typeof res?.output_text === "string" && res.output_text.trim()) {
      return res.output_text.trim();
    }

    const out = res?.output;
    if (!Array.isArray(out)) return "AI response format was unexpected.";

    const texts: string[] = [];
    for (const item of out) {
      const content = item?.content;
      if (!Array.isArray(content)) continue;
      for (const c of content) {
        if (c?.type === "output_text" && typeof c?.text === "string") {
          texts.push(c.text);
        }
      }
    }
    return texts.join("\n").trim() || "AI response format was unexpected.";
  } catch {
    return "AI response format was unexpected.";
  }
}

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { success: false, error: "OPENAI_API_KEY is not set on the server." },
        { status: 500 }
      );
    }

    // ✅ Next 15: this MUST be awaited
    const supabase = await createRouteClient();

    // (Optional) tie to user if logged in
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const form = await req.formData();

    const prompt = safeStr(form.get("prompt")).trim();
    const platform = safeStr(form.get("platform")).trim() || "TikTok";
    const goal = safeStr(form.get("goal")).trim() || "Drive sales, grow page, etc.";
    const lengthSeconds = safeStr(form.get("lengthSeconds")).trim() || "30";
    const tone = safeStr(form.get("tone")).trim() || "Casual";

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: "Missing prompt" },
        { status: 400 }
      );
    }

    // File is optional (you can wire this into real transcription later)
    const file = form.get("file");
    const fileMeta =
      file instanceof File
        ? { name: file.name, type: file.type, size: file.size }
        : null;

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const system = `You are Directr, an expert content director. Return clean, actionable output.`;
    const userMsg = `
PROMPT:
${prompt}

CONTEXT:
- platform: ${platform}
- goal: ${goal}
- lengthSeconds: ${lengthSeconds}
- tone: ${tone}

If helpful, include:
- 5 hook options
- A tight script
- Shot list + b-roll ideas
- Caption options + CTA
- Posting notes

Return plain text (not JSON).
`.trim();

    const aiRes = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        { role: "system", content: system },
        { role: "user", content: userMsg },
      ],
    });

    const text = extractOutputText(aiRes);

    // Store as a job in Supabase
    const insertPayload: any = {
      type: "script",
      prompt,
      result_text: text,
      platform,
      goal,
      length_seconds: Number(lengthSeconds) || null,
      tone,
      file_name: fileMeta?.name ?? null,
      file_type: fileMeta?.type ?? null,
      file_size: fileMeta?.size ?? null,
      user_id: user?.id ?? null,
    };

    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .insert(insertPayload)
      .select("*")
      .single();

    if (jobError) {
      console.error("Supabase insert error:", jobError);
      // Still return the AI text so UI works even if DB fails
      return NextResponse.json({
        success: true,
        text,
        job: null,
        warning: "Saved output but failed to write job to database.",
      });
    }

    return NextResponse.json({
      success: true,
      text,
      job,
    });
  } catch (err: any) {
    console.error("generate error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to generate response.", details: err?.message || String(err) },
      { status: 500 }
    );
  }
}
