// src/lib/ai.ts
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export type ClipIdea = {
  title: string;
  hook: string;
  clip_description: string;
  overlay_text: string[];
  broll_ideas: string[];
  platform: string;
};

export async function generateClipIdeas(prompt: string): Promise<ClipIdea[]> {
  const systemPrompt = `
You are an expert short-form content director.
Given a description of a long-form video, you must respond with 3-5 short-form clip ideas.

Each idea must include:
- title
- hook
- clip_description
- overlay_text (array of 1-3 phrases to put as text on screen)
- broll_ideas (array of visual ideas)
- platform (tiktok, reels, or shorts – choose based on tone)

Respond ONLY as JSON array. No explanations, no extra text.
  `.trim();

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.8,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt },
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? "[]";
  // handle both string and array content types
  const text =
    typeof raw === "string"
      ? raw
      : Array.isArray(raw)
      ? raw.map((p: any) => (typeof p === "string" ? p : p.text ?? "")).join("")
      : "[]";

  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) {
      return parsed as ClipIdea[];
    }
    return [];
  } catch (e) {
    console.error("Failed to parse AI response", e, text);
    return [];
  }
}
