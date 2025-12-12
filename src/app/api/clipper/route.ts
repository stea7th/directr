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

    const body = await req.json().catch(() => null);
    const fileUrl = body?.fileUrl ? String(body.fileUrl) : "";
    const prompt =
      body?.prompt && String(body.prompt).trim()
        ? String(body.prompt).trim()
        : "Find the best short-form hooks.";

    if (!fileUrl) {
      return NextResponse.json(
        { success: false, error: "fileUrl is required." },
        { status: 400 }
      );
    }

    // Download the file from Supabase
    const fileRes = await fetch(fileUrl);
    if (!fileRes.ok) {
      return NextResponse.json(
        {
          success: false,
          error: `Failed to download file (status ${fileRes.status}).`,
        },
        { status: 500 }
      );
    }

    const arrayBuffer = await fileRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Whisper transcription
    const transcription = await openai.audio.transcriptions.create({
      file: { data: buffer, name: "upload.mp4" } as any,
      model: "whisper-1",
      response_format: "json",
    });

    const transcriptText = transcription.text?.trim() || "";
    if (!transcriptText) {
      return NextResponse.json(
        { success: false, error: "No transcript returned." },
        { status: 500 }
      );
    }

    // Ask GPT for hook timestamps (best effort timestamps)
    const clipPrompt = `
Transcript:
${transcriptText}

Goal:
${prompt}

Return ONLY valid JSON:
{
  "clips": [
    { "start": 0.0, "end": 8.0, "hook_line": "...", "description": "..." }
  ]
}

Rules:
- 3 to 7 clips
- start/end are seconds (best estimate)
- hook_line must be the exact line from transcript (or close)
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

    let clips: any[] = [];
    const firstOutput: any = (clipRes as any).output?.[0];
    const raw =
      firstOutput?.type === "message"
        ? String(firstOutput.content?.[0]?.text || "").trim()
        : "";

    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed?.clips)) clips = parsed.clips;
    } catch {
      // If parsing fails, return transcript so UI still shows something
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

    // Save job
    const { data: job, error: insertError } = await supabase
      .from("jobs")
      .insert({
        type: "clipper",
        prompt,
        source_url: fileUrl,
        output_script: transcriptText,
        output_clips: clips,
        status: "completed",
      })
      .select()
      .single();

    if (insertError) console.error("Job insert error:", insertError);

    return NextResponse.json({
      success: true,
      transcript: transcriptText,
      clips,
      job,
    });
  } catch (err: any) {
    console.error("Clipper error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to find hooks.", details: err?.message },
      { status: 500 }
    );
  }
}
