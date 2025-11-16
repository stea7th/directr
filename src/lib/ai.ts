// src/lib/ai.ts
import OpenAI from "openai";

export type GenerateInput = {
  topic: string;
  platform: string;
  goal: string;
  length: string;
  tone: string;
};

// Lazily create OpenAI client so we only throw inside route try/catch
let _client: OpenAI | null = null;

function getClient() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    throw new Error("OPENAI_API_KEY is not set in your environment");
  }
  if (!_client) {
    _client = new OpenAI({ apiKey: key });
  }
  return _client;
}

export async function generateClipIdeas(input: GenerateInput): Promise<string> {
  const openai = getClient();

  const prompt = `
You are Directr, an AI that creates short-form video scripts.

Topic: ${input.topic}
Platform: ${input.platform}
Goal: ${input.goal}
Target length (seconds): ${input.length}
Tone: ${input.tone}

Return:
- 3–5 clip ideas with strong hooks
- Beat-by-beat structure for each
- Simple on-screen text + b-roll suggestions.

Format your answer as clean, human-readable text. No JSON.
  `.trim();

  const res: any = await openai.responses.create({
    model: "gpt-4.1-mini",
    input: prompt,
  });

  // Super defensive extraction so TS doesn't complain
  const first = res?.output?.[0];
  const text =
    first?.output_text?.[0]?.content
      ?.map((c: any) => c?.text ?? "")
      .join(" ")
      .trim() ||
    first?.content?.[0]?.text ||
    "";

  if (text) return text;

  // Fallback: stringify the whole object so at least you see *something*
  return JSON.stringify(res, null, 2);
}
