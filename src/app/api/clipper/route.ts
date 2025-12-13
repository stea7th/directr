import { NextResponse } from "next/server";
import OpenAI, { toFile } from "openai";
import { createRouteClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 60;

function getOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set on the server.");
  return new OpenAI({ apiKey });
}

function extractFirstJsonObject(s: string) {
  // tries to find the first {...} block and parse it
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  const chunk = s.slice(start, end + 1);
  try {
    return JSON.parse(chunk);
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const openai = getOpenAI();
    const supabase = createRouteClient();

    const ct = req.headers.get("content-type") || "";
    if (!ct.includes("multipart/form-data")) {
      return NextResponse.json(
        { success: false, error: "Expected multipart/form-data with a 'file' field." },
        { status: 400 }
      );
    }

    const form = await req.formData();
    const blob = form.get("file");
    const prompt = String(form.get("prompt") || "").trim();

    if (!blob || !(blob instanceof Blob)) {
      return NextResponse.json(
        { success: false, error: "No file uploaded. Field name must be 'file'." },
        { status: 400 }
      );
    }

    // Build a File-like object for OpenAI SDK
    const filename =
      (blob as any).name?.toString?.() ||
      "upload.mp4";

    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 1) Whisper transcription
    const audioFile = await toFile(buffer, filename);
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
    });

    const transcript = (transcription.text || "").trim();
    if (!transcript) {
      return NextResponse.json(
        { success: false, error: "No transcript returned from Whisper." },
        { status: 500 }
      );
    }

    // 2) Ask model for clip moments (NO response_format param => no TS overload error)
    const instruction = `
You are a short-form editor. Given the transcript, find the best moments to clip.

Return ONLY JSON (no markdown, no extra text) in this exact shape:
{
  "clips": [
    { "start": 0.0, "end": 8.0, "hook_line": "…", "description": "…" }
  ]
}

Rules:
- 3 to 7 clips
- start/end are seconds (best estimate)
- hook_line should match the transcript wording as closely as possible
- end must be > start
`;

    const userGoal = prompt ? `User goal: ${prompt}\n` : "";

    const res = await openai.responses.create({
      model: "gpt-4o-mini",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `${instruction}\n\n${userGoal}\nTranscript:\n${transcript}`,
            },
          ],
        },
      ],
    });

    // Extract text from Responses API output safely
    const out0: any = (res as any).output?.[0];
    const rawText =
      out0?.type === "message"
        ? String(out0?.content?.[0]?.text || "").trim()
        : "";

    const parsed = extractFirstJsonObject(rawText);
    const clips = Array.isArray(parsed?.clips) ? parsed.clips : null;

    if (!clips) {
      return NextResponse.json(
        {
          success: false,
          error: "Model did not return valid JSON clips.",
          transcript,
          raw: rawText.slice(0, 2000),
        },
        { status: 500 }
      );
    }

    // Optional: save to jobs (don’t fail request if this fails)
    try {
      await supabase.from("jobs").insert({
        type: "clipper",
        prompt: prompt || null,
        status: "completed",
        output_script: transcript,
        output_clips: clips,
      });
    } catch (e) {
      console.warn("jobs insert failed (non-fatal):", e);
    }

    return NextResponse.json({
      success: true,
      transcript,
      clips,
    });
  } catch (err: any) {
    console.error("/api/clipper error:", err);
    return NextResponse.json(
      { success: false, error: "Clipper failed.", details: err?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
