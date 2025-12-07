// src/app/api/generate/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

// ❗ Do NOT create the client at the top-level.
// We lazy-create it inside the handler so build doesn't explode if the key is missing.
function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    // We throw here and catch it in POST, so we can return a nice JSON error
    throw new Error("OPENAI_API_KEY is not set on the server.");
  }
  return new OpenAI({ apiKey });
}

export async function POST(req: Request) {
  try {
    // Read raw body (works whether frontend sends JSON or plain text)
    const rawBody = await req.text();
    let prompt: string | undefined;

    if (!rawBody) {
      return NextResponse.json(
        { success: false, error: "Empty request body." },
        { status: 400 }
      );
    }

    // Try JSON first ({ prompt: "..." } or just "...")
    try {
      const parsed = JSON.parse(rawBody);

      if (typeof parsed === "string") {
        prompt = parsed.trim();
      } else if (parsed && typeof parsed === "object" && "prompt" in parsed) {
        const obj = parsed as { prompt?: unknown };
        prompt = String(obj.prompt ?? "").trim();
      }
    } catch {
      // Not JSON → treat raw body as the prompt
      prompt = rawBody.trim();
    }

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: "No prompt provided in request body." },
        { status: 400 }
      );
    }

    // 👇 This is the only place we touch OpenAI.
    const openai = getOpenAIClient();

    const aiRes = await openai.responses.create({
      model: "gpt-4o-mini",
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
