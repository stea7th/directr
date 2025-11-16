// src/lib/ai.ts
import OpenAI from "openai";

// Make sure you have OPENAI_API_KEY set in Vercel env
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export type GenerateInput = {
  topic: string;
  platform?: string;
  goal?: string;
  length?: string; // seconds, like "30–60"
  tone?: string;
};

export async function generateClipIdeas(input: GenerateInput): Promise<string> {
  const {
    topic,
    platform = "TikTok",
    goal = "Generate short-form video ideas and a rough script.",
    length = "30–60",
    tone = "natural creator, non-cringe, slightly punchy",
  } = input;

  const systemPrompt = `
You are Directr, an assistant that helps creators turn ideas into short-form videos.
- Platform: ${platform}
- Target length: ${length} seconds
- Tone: ${tone}
- Goal: ${goal}

Return:
1) A short hook.
2) A simple beat-by-beat script (1 line per shot).
3) A few on-screen text suggestions.
Use clear formatting and keep it tight.
`.trim();

  const userPrompt = `Idea / topic: ${topic}`;

  const response = await client.responses.create({
    model: "gpt-4.1-mini",
    input: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: userPrompt,
      },
    ],
  });

  // The Responses API has a rich type, but we’ll keep it simple
  const anyResponse = response as any;

  const firstOutput = anyResponse.output?.[0];
  const firstContent = firstOutput?.content?.[0];

  // New Responses API usually puts text here:
  const textFromOutputText =
    firstContent?.type === "output_text"
      ? firstContent.output_text?.text
      : undefined;

  // Fallback: some shapes use just `.text`
  const textFromPlain = firstContent?.text;

  const finalText =
    textFromOutputText ||
    textFromPlain ||
    JSON.stringify(response, null, 2);

  return String(finalText);
}
