// src/lib/ai.ts
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export type GenerateInput = {
  topic: string;
  platform: string;
  goal?: string;
  length?: string;
  tone?: string;
};

export async function generateScriptCopy(input: GenerateInput): Promise<string> {
  const { topic, platform, goal, length, tone } = input;

  const prompt = `
You are Directr, an AI that designs short-form video concepts.

Make 1 high-performing short-form video script based on:

- Topic: ${topic}
- Platform: ${platform}
- Goal: ${goal || "general engagement"}
- Length: ${length || "30"} seconds
- Tone: ${tone || "casual, natural, creator-style"}

Return the answer in this structure:

HOOK:
- 1–2 punchy hook options

BEATS:
- Beat 1: ...
- Beat 2: ...
- Beat 3: ...
(Each beat should say what the viewer sees and hears.)

SCRIPT:
- Line-by-line, like a shooting script

B-ROLL / VISUAL IDEAS:
- List b-roll ideas and on-screen text moments
`.trim();

  const response = await client.responses.create({
    model: "gpt-4.1-mini",
    input: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const first = response.output[0];

  if (
    first &&
    first.content &&
    first.content[0] &&
    first.content[0].type === "output_text"
  ) {
    return first.content[0].text;
  }

  // Fallback: dump raw output if format is different
  return JSON.stringify(response.output, null, 2);
}

/**
 * Backwards-compatible name that your API route imports.
 * This is what ./src/app/api/generate/route.ts is expecting.
 */
export async function generateClipIdeas(input: GenerateInput): Promise<string> {
  // For now, reuse the same generator.
  return generateScriptCopy(input);
}
