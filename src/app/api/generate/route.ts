// src/app/api/generate/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set on the server.");
  }
  return new OpenAI({ apiKey });
}

type GenerateBody = {
  prompt?: string;
  platform?: string;
  goal?: string;
  lengthSeconds?: string;
  tone?: string;
};

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    let body: GenerateBody = {};
    let userPrompt = "";

    // Try to parse JSON first
    try {
      const parsed = JSON.parse(rawBody);
      if (parsed && typeof parsed === "object") {
        body = parsed as GenerateBody;
        userPrompt = String(parsed.prompt ?? "").trim();
      } else if (typeof parsed === "string") {
        userPrompt = parsed.trim();
      }
    } catch {
      // Not JSON → treat as raw text prompt
      userPrompt = rawBody.trim();
    }

    if (!userPrompt) {
      return NextResponse.json(
        { success: false, error: "No prompt provided in request body." },
        { status: 400 }
      );
    }

    const platform = body.platform || "TikTok";
    const goal = body.goal || "Drive followers and authority.";
    const lengthSeconds = body.lengthSeconds || "30";
    const tone = body.tone || "Casual";

    const fullPrompt = `
You are Directr, an editor-minded short-form content strategist.

User idea:
"${userPrompt}"

Context:
- Platform: ${platform}
- Primary goal: ${goal}
- Ideal length: ~${lengthSeconds} seconds
- Tone: ${tone}

Return a tight, practical breakdown for ONE short-form video with these sections in Markdown:

1. **Hook options**
   - 3–5 punchy first-line hooks (bulleted list).

2. **Full A-roll script**
   - Dialogue line-by-line that fits ~${lengthSeconds} seconds.
   - Include timing hints only if helpful (e.g., (0–3s), (3–7s)).

3. **B-roll & visuals plan**
   - Timeline bullets: 0–3s, 3–7s, 7–12s, etc.
   - For each, describe visuals, camera moves, overlays.

4. **On-screen text & captions**
   - Big text overlays and any lower-third text.

5. **Call to action**
   - 1–2 CTA options tailored to the goal and platform.

6. **Caption + 8–15 hashtags**
   - Caption first.
   - On a new line, list 8–15 relevant hashtags.

Do NOT explain what you're doing. Just output the formatted content ready for a creator to copy-paste.
If the user idea is vague, make smart assumptions and still give a usable breakdown.
`;

    const openai = getOpenAIClient();

    const aiRes = await openai.responses.create({
      model: "gpt-4o-mini",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: fullPrompt,
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
