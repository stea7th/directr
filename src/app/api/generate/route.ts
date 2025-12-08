// src/app/api/generate/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createRouteClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 60; // allow more time if needed

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set on the server.");
  }
  return new OpenAI({ apiKey });
}

export async function POST(req: Request) {
  try {
    const openai = getOpenAIClient();
    const supabase = createRouteClient();

    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error:
            "Expected JSON body. Make sure you're sending Content-Type: application/json.",
        },
        { status: 400 }
      );
    }

    const {
      prompt,
      platform = "TikTok",
      goal = "Drive sales, grow page, etc.",
      lengthSeconds = "30",
      tone = "Casual",
    } = body || {};

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json(
        { success: false, error: "Prompt is required." },
        { status: 400 }
      );
    }

    const userPrompt = `
You are Directr, a short-form video director.

User prompt:
"${prompt.trim()}"

Context:
- Platform: ${platform}
- Goal: ${goal}
- Target length: ~${lengthSeconds} seconds
- Tone: ${tone}

Output a detailed script plan including:
1. Hook (first 3–5 seconds)
2. Full A-roll script (word-for-word lines)
3. B-roll suggestions
4. Caption (with emojis if it fits)
5. 5–10 hashtag ideas

Write it as clear sections that a creator could read straight into camera.
`;

    const aiRes = await openai.responses.create({
      model: "gpt-4o-mini",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: userPrompt,
            },
          ],
        },
      ],
    });

    // Safely extract plain text from the responses API
    let aiText = "AI response format was unexpected.";

    const firstOutput: any = (aiRes as any).output?.[0];
    if (firstOutput?.type === "message") {
      const firstContent = firstOutput.content?.[0];
      if (firstContent?.type === "output_text" && firstContent.text) {
        aiText = String(firstContent.text);
      }
    }

    // Store as a job in Supabase
    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .insert({
        type: "script",
        prompt,
        platform,
        goal,
        length_seconds: Number(lengthSeconds) || null,
        tone,
        output_script: aiText,
        status: "completed",
      })
      .select()
      .single();

    if (jobError) {
      console.error("Failed to insert script job:", jobError);
    }

    return NextResponse.json({
      success: true,
      text: aiText,
      job,
    });
  } catch (err: any) {
    console.error("Error in /api/generate:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate response.",
        details: err?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
