// src/lib/ai.ts
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type GenerateClipIdeasInput = {
  prompt: string;          // what the user typed
  platform: string;        // TikTok / Reels / Shorts / All
  goal?: string;           // grow page, drive sales, etc.
  lengthSeconds?: number;  // target length per clip
  tone?: string;           // Casual, Authority, etc.
};

export async function generateClipIdeas(
  input: GenerateClipIdeasInput
): Promise<string> {
  const {
    prompt,
    platform,
    goal = "Grow my page and drive sales",
    lengthSeconds = 30,
    tone = "Casual",
  } = input;

  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is missing");
  }

  const system = `
You are Directr, an AI short-form video editor for creators.

Your job:
- Take the creator's description and platform.
- Decide the best hooks, cuts, pacing, caption style, and b-roll ideas.
- Output something they could literally copy into their editor or send to a human editor.

Rules:
- Be specific with timestamps IF they mention a transcript or timecodes.
- Use natural creator language, not corporate.
- Make it feel like a high-skill editor talking to a client.
- Keep it focused on ${platform}.
- Tone: ${tone}.
`;

  const userPrompt = `
Creator's idea / context:
"${prompt}"

Goal: ${goal}
Target clip length: ~${lengthSeconds} seconds
Platform: ${platform}

Please respond in this structure:

1) Big idea / angle (1 paragraph)

2) Hook options (3–5 lines):
- ...

3) Clip breakdown (3–7 clips):
For each clip:
- Clip #: 
- Approx length:
- What happens:
- Editing style:
- Caption style:
- B-roll ideas:

4) Caption & title ideas (5–10 options)

5) On-screen text + call-to-action ideas
`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      { role: "system", content: system.trim() },
      { role: "user", content: userPrompt.trim() },
    ],
    temperature: 0.8,
  });

  const text = completion.choices[0]?.message?.content ?? "";

  return text.trim();
}
