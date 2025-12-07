// src/app/api/generate/route.ts
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import OpenAI from "openai";
import { createRouteClient } from "@/lib/supabase/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY is missing");
      return NextResponse.json(
        { error: "AI is not configured. Contact support." },
        { status: 500 }
      );
    }

    const form = await req.formData();

    const prompt = (form.get("prompt") as string | null)?.trim() ?? "";
    const platform = (form.get("platform") as string | null)?.trim() || "TikTok";
    const goal =
      (form.get("goal") as string | null)?.trim() ||
      "Grow my page and drive sales";
    const lengthSecondsStr =
      (form.get("lengthSeconds") as string | null)?.trim() || "30";
    const tone = (form.get("tone") as string | null)?.trim() || "Casual";
    const file = form.get("file") as File | null;

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required." },
        { status: 400 }
      );
    }

    const supabase = createRouteClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Not signed in." }, { status: 401 });
    }

    // ---------- 1) Optional file upload ----------
    let fileUrl: string | null = null;

    if (file && file.size > 0) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
        const path = `${user.id}/${randomUUID()}-${safeName}`;

        const { data: uploaded, error: uploadError } = await supabase.storage
          .from("uploads")
          .upload(path, buffer, {
            contentType: file.type || "application/octet-stream",
          });

        if (uploadError) {
          console.error("Supabase upload error:", uploadError);
        } else if (uploaded?.path) {
          const { data: publicData } = supabase
            .storage.from("uploads")
            .getPublicUrl(uploaded.path);

          fileUrl = publicData?.publicUrl ?? null;
        }
      } catch (uploadErr) {
        console.error("Upload pipeline error:", uploadErr);
      }
    }

    const lengthSeconds = Number.isNaN(Number(lengthSecondsStr))
      ? 30
      : Number(lengthSecondsStr);

    // ---------- 2) Call OpenAI "editor brain" ----------
    const editorPrompt = `
You are Directr, an expert short-form content editor.

User info:
- Platform: ${platform}
- Goal: ${goal}
- Desired length: ~${lengthSeconds} seconds
- Tone: ${tone}

User prompt (their idea / context):
"${prompt}"

If a source video is provided, assume it's a talking-head / vlog style piece.
Your job is NOT to fake the video. Instead:

1) Hook
2) Core structure (beats, timestamps if possible)
3) Caption style (font vibe, placement)
4) On-screen text for key moments
5) B-roll suggestions (realistic clips to overlay, not AI-generated)
6) Transitions & pacing notes
7) Color / filter vibe & music direction

Return everything in clean markdown, easy for an editor to follow.
`;

    const aiRes = await openai.responses.create({
      model: "gpt-4.1-mini", // change to "gpt-5.1" if you want max quality
      input: editorPrompt,
    });

    const aiText =
      aiRes.output[0].content[0].type === "output_text"
        ? aiRes.output[0].content[0].text
        : "AI response format was unexpected.";

    // ---------- 3) Store job in Supabase ----------
    const id = randomUUID();

    const { data: job, error: dbError } = await supabase
      .from("jobs")
      .insert({
        id,
        user_id: user.id,
        platform,
        prompt,
        goal,
        tone,
        length_seconds: lengthSeconds,
        source_url: fileUrl,
        edited_url: null,
        provider_job_id: null,
        result_text: aiText,
        status: "draft", // not actually edited yet, just planned
      })
      .select("*")
      .single();

    if (dbError) {
      console.error("Supabase insert error:", dbError);
    }

    return NextResponse.json(
      {
        ok: true,
        aiNotes: aiText,
        job: job ?? {
          id,
          user_id: user.id,
          platform,
          prompt,
          goal,
          tone,
          length_seconds: lengthSeconds,
          source_url: fileUrl,
          edited_url: null,
          provider_job_id: null,
          result_text: aiText,
          status: "draft",
        },
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Generate route fatal error:", err?.response || err);
    const status =
      err?.response?.status && Number.isInteger(err.response.status)
        ? err.response.status
        : 500;

    return NextResponse.json(
      {
        error:
          err?.response?.data?.error?.message ||
          err?.message ||
          "Unknown error from AI.",
      },
      { status }
    );
  }
}
