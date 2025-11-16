// src/lib/ai.ts
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type GenerateClipIdeasParams = {
  topic: string;
  platform: string;
  goal: string;
  length: string;
  tone: string;
};

export async function generateClipIdeas(
  params: GenerateClipIdeasParams
): Promise<string> {
  const { topic, platform, goal, length, tone } = params;

  const systemPrompt = `
You are an elite short-form content strategist and video editor.

You help creators turn long-form content into viral short-form clips.
You respond in a clean, structured way that is easy to copy into an editor.

RULES:
- No cringe marketing speak.
- No fake “must watch” hooks.
- Sound like a real, modern creator.
- Focus on hooks, angles, and what happens in each clip.
- Do NOT talk about yourself, just give the plan.
`;

  const userPrompt = `
Platform: ${platform}
Goal: ${goal}
Desired clip length: ${length} seconds
Tone: ${tone}

Topic / source description:
${topic}

Return a list like:

1) Title: ...
   Hook: ...
   Angle: ...
   Suggested pacing: ...
   On-screen text ideas: ...
   B-roll / overlay ideas: ...
   CTA (optional): ...

Give 3–5 strong clips. Keep it tight but detailed enough that an editor
could build the clips from this alone.
`;

  const response = await client.responses.create({
    model: "gpt-4.1-mini",
    input: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  } as any);

  // The OpenAI "responses" type definitions are a bit strict,
  // so we keep this loose to avoid TypeScript errors.
  const first = (response as any).output?.[0];
  const content = first?.content?.[0];

  const text: string =
    content?.type === "output_text" && typeof content?.text === "string"
      ? content.text
      : JSON.stringify(response);

  return text.trim();
}
