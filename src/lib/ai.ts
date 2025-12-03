// src/lib/ai.ts

export type GenerateInput = {
  prompt: string;
  platform: string;
  goal: string;
  lengthSeconds: number;
  tone: string;
};

/**
 * Calls OpenAI to turn a raw idea + context
 * into a detailed edit plan for the clip.
 */
export async function generateClipIdeas({
  prompt,
  platform,
  goal,
  lengthSeconds,
  tone,
}: GenerateInput): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;

  // If no key set, return a fallback so dev doesn’t break
  if (!apiKey) {
    return [
      `AI is not configured yet (missing OPENAI_API_KEY).`,
      ``,
      `Here’s a placeholder plan based on your inputs:`,
      `- Platform: ${platform}`,
      `- Goal: ${goal}`,
      `- Tone: ${tone}`,
      `- Target length: ~${lengthSeconds}s`,
      ``,
      `Hook: Use a strong first 2 seconds calling out your audience.`,
      `Body: Deliver 2–3 punchy points, cut out silences, keep pacing tight.`,
      `CTA: End with a clear action aligned to your goal.`,
    ].join("\n");
  }

  const systemPrompt = `
You are Directr – an AI editor for creators.

Given:
- A raw idea / video context (the "prompt")
- Platform (TikTok, Reels, Shorts, etc.)
- Goal (grow page, drive sales, book calls, etc.)
- Tone (casual, educational, cinematic, aggressive, etc.)
- Target length in seconds

Return a detailed *edit blueprint* the editor can follow, including:
- Hook idea (first 1–3 seconds)
- Structure & pacing notes
- Caption / text-on-screen ideas
- B-roll suggestions (what to cut in where)
- Transitions & sound design notes
- CTA options

Format it as clear sections with bullet points, not code.
`.trim();

  const userPrompt = `
Creator idea / context:
"${prompt}"

Platform: ${platform}
Goal: ${goal || "Grow my page and drive sales"}
Tone: ${tone}
Target length: ~${lengthSeconds} seconds

Write this as if you're talking directly to a video editor or an AI editing agent.
`.trim();

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.8,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("OpenAI error:", res.status, text);
    return `Directr AI error (${res.status}). Try again in a minute or contact support.`;
  }

  const json: any = await res.json();
  const content =
    json?.choices?.[0]?.message?.content?.trim() ??
    "AI returned no content. Try again.";

  return content;
}
