// src/app/api/generate/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    // 1) Read raw body first (so we don't crash on bad JSON)
    const rawBody = await req.text();
    let prompt: string | undefined;

    if (!rawBody) {
      return NextResponse.json(
        { success: false, error: "Empty request body." },
        { status: 400 }
      );
    }

    // 2) Try to parse as JSON: { prompt: "..." } or "..."
    try {
      const parsed = JSON.parse(rawBody);

      if (typeof parsed === "string") {
        prompt = parsed.trim();
      } else if (parsed && typeof parsed === "object" && "prompt" in parsed) {
        // @ts-expect-error – runtime guard is enough
        prompt = String(parsed.prompt || "").trim();
      }
    } catch {
      // 3) Not JSON → treat raw text as the prompt
      prompt = rawBody.trim();
    }

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: "No prompt provided in request body." },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: "OPENAI_API_KEY is not set on the server.",
        },
        { status: 500 }
      );
    }

    // 4) Call OpenAI Responses API
    const aiRes = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: prompt,
            },
          ],
        },
      ],
    });

    // 5) Safely extract the text
    let aiText = "AI response format was unexpected.";
    const firstOutput: any = (aiRes as any).output?.[0];

    if (firstOutput?.type === "message") {
      const firstContent = firstOutput?.content?.[0];
      if (firstContent?.type === "output_text") {
        aiText = firstContent.text as string;
      }
    }

    return NextResponse.json({
      success: true,
      text: aiText,
    });
  } catch (err: unknown) {
    console.error("Error in /api/generate:", err);

    const message =
      err instanceof Error ? err.message : "Unknown error occurred.";

    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate response.",
        details: message,
      },
      { status: 500 }
    );
  }
}
