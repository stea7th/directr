// src/app/api/clipper/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createRouteClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set on the server.");
  }
  return new OpenAI({ apiKey });
}

export async function POST(req: Request) {
  try {
    const supabase = createRouteClient();
    const openai = getOpenAIClient();

    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { success: false, error: "Expected multipart/form-data with a file." },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const prompt =
      String(formData.get("prompt") || "").trim() ||
      "Find the best hooks for short-form content.";

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file uploaded (field name 'file')." },
        { status: 400 }
      );
    }

    // 1️⃣ TRANSCRIBE AUDIO/VIDEO → TEXT (Whisper)
    const transcription = await openai.audio.transcriptions.create({
      file: file as any,
      model: "whisper-1",
      response_format: "json",
    });

    const transcriptText = transcription.text?.trim();
    if (!transcriptText) {
      return NextResponse.json(
        { success: false, error: "Transcription returned no text." },
        { status: 500 }
      );
    }

    // 2️⃣ ASK AI TO FIND CLIPS (HOOKS) FROM TRANSCRIPT
    const clipPrompt = `
You are a short-form content clip finder.

Transcript:
${transcriptText}

Task:
- Find 3–7 of the strongest hook moments for TikTok/Reels/Shorts.
- Focus on lines that:
  - Make people stop scrolling
  - State a bold claim, pain point, or strong curiosity
  - Can start a clip cleanly

For each clip, return:
- "start": number in seconds
- "end": number in seconds
- "hook_line": the key line that makes it a hook
- "description": a short human description (what happens visually / context)

Return ONLY valid JSON in this shape (no backticks, no text before/after):

{
  "clips": [
    {
      "start": 0.0,
      "end": 5.2,
      "hook_line": "...",
      "description": "..."
    }
  ]
}
`;

    const clipRes = await openai.responses.create({
      model: "gpt-4o-mini",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: clipPrompt,
            },
          ],
        },
      ],
    });

    // 🔁 Parse plain-text output as JSON
    let clips: any[] = [];
    const firstOutput: any = (clipRes as any).output?.[0];

    if (firstOutput?.type === "message") {
      const firstContent = firstOutput?.content?.[0];
      if (firstContent?.type === "output_text") {
        const raw = (firstContent.text as string).trim();
        try {
          const json = JSON.parse(raw);
          if (Array.isArray(json.clips)) {
            clips = json.clips;
          }
        } catch (e) {
          console.error("Failed to parse clips JSON:", e, raw);
        }
      }
    }

    if (!Array.isArray(clips) || clips.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "AI did not return any clips or JSON was invalid.",
          transcript: transcriptText,
        },
        { status: 500 }
      );
    }

    // 3️⃣ SAVE AS A JOB IN SUPABASE (type='clipper')
    const { data: job, error: insertError } = await supabase
      .from("jobs")
      .insert({
        type: "clipper",
        prompt,
        output_script: transcriptText, // storing transcript here for now
        output_clips: clips,
        status: "completed",
      })
      .select()
      .single();

    if (insertError) {
      console.error("Failed to insert clipper job:", insertError);
    }

    return NextResponse.json({
      success: true,
      transcript: transcriptText,
      clips,
      job,
    });
  } catch (err: any) {
    console.error("Error in /api/clipper:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to find clips.",
        details: err?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
