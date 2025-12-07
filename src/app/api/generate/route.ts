// src/app/api/generate/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type GenerateRequestBody = {
  prompt: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<GenerateRequestBody>;
    const prompt = body.prompt?.trim();

    if (!prompt) {
      return NextResponse.json(
        { error: "Missing 'prompt' in request body." },
        { status: 400 }
      );
    }

    // Call OpenAI Responses API
    const aiRes = await openai.responses.create({
      model: "gpt-4.1-mini", // or "gpt-4.1" / whatever you want to use
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

    // Safely extract text from the response (avoid TS type issues)
    let aiText = "AI response format was unexpected.";

    const firstOutput = (aiRes as any)?.output?.[0];

    if (firstOutput?.type === "message") {
      const firstContent = firstOutput?.content?.[0];

      if (firstContent?.type === "output_text") {
        aiText = firstContent.text as string;
      }
    }

    return NextResponse.json({ text: aiText });
  } catch (err: unknown) {
    console.error("Error in /api/generate:", err);

    const message =
      err instanceof Error ? err.message : "Unknown error occurred.";

    return NextResponse.json(
      {
        error: "Failed to generate response.",
        details: message,
      },
      { status: 500 }
    );
  }
}
