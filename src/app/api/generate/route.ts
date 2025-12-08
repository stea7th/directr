// src/app/api/generate/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { supabaseServer } from "@/lib/supabaseServer";

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

    // Try JSON
    try {
      const parsed = JSON.parse(rawBody);
      if (parsed && typeof parsed === "object") {
        body = parsed as GenerateBody;
        userPrompt = String(parsed.prompt ?? "").trim();
      } else if (typeof parsed === "string") {
        userPrompt = parsed.trim();
      }
    } catch {
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

3. **B-roll & visuals plan**

4. **On-screen text & captions**

5. **Call to action**

6. **Caption + 8–15 hashtags**

No explanations. Just the formatted content.
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

    // 👉 Save as a job (type 'script')
    const { data: job, error: insertError } = await supabaseServer
      .from("jobs")
      .insert({
        type: "script",
        prompt: userPrompt,
        output_script: aiText,
        status: "completed",
      })
      .select()
      .single();

    if (insertError) {
      console.error("Failed to insert job:", insertError);
    }

    return NextResponse.json({
      success: true,
      text: aiText,
      job,
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
