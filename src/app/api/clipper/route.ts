import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createRouteClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 60;

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set on the server.");
  return new OpenAI({ apiKey });
}

export async function POST(req: Request) {
  try {
    const openai = getOpenAIClient();
    const supabase = createRouteClient();

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
        { success: false, error: "No file uploaded (field name must be 'file')." },
        { status: 400 }
      );
    }

    // 1) Transcribe
    const transcription = await openai.audio.transcriptions.create({
      file: file as any,
      model: "whisper-1",
      response_format: "json",
    });

    const transcriptText = transcription.text?.trim() || "";
    if (!transcriptText) {
      return NextResponse.json(
        { success: false, error: "Transcription returned no text." },
        { status: 500 }
      );
    }

    // 2) Find clip hooks from transcript (JSON-only output)
    const clipPrompt = `
You are a short-form content clip finder.

Transcript:
${transcriptText}

User context / goal:
${prompt}

Return ONLY valid JSON (no backticks, no extra text):

{
  "clips": [
    {
      "start": 0.0,
      "end": 7.5,
      "hook_line": "...",
      "description": "..."
    }
  ]
}

Rules:
- 3 to 7 clips
- start/end are seconds (best estimate)
- hook_line should be a real line from the transcript when possible
`;

    const clipRes = await openai.responses.create({
      model: "gpt-4o-mini",
      input: [
        {
          role: "user",
          content: [{ type: "input_text", text: clipPrompt }],
        },
      ],
    });

    // Extract text from Responses API
    const firstOutput: any = (clipRes as any).output?.[0];
    let raw = "";

    if (firstOutput?.type === "message") {
      raw = String(firstOutput.content?.[0]?.text || "").trim();
    }

    let clips: any[] = [];
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed?.clips)) clips = parsed.clips;
    } catch (e) {
      console.error("Clip JSON parse failed:", e, raw);
      return NextResponse.json(
        {
          success: false,
          error: "AI returned invalid JSON for clips.",
          transcript: transcriptText,
          raw,
        },
        { status: 500 }
      );
    }

    // 3) Save a job (optional, but kept because you already use jobs)
    const { data: job, error: insertError } = await supabase
      .from("jobs")
      .insert({
        type: "clipper",
        prompt,
        output_script: transcriptText, // storing transcript here
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
