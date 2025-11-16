// src/lib/ai.ts
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type GenerateInput = {
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

Make 1 high-performing script based on:
- Topic: ${topic}
- Platform: ${platform}
- Goal: ${goal || "general engagement"}
- Length: ${length || "30"} seconds
- Tone: ${tone || "casual"}

Return:
- A hook
- Beat-by-beat structure
- Rough VO lines
- B-roll suggestions
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

  return JSON.stringify(response.output, null, 2);
}
