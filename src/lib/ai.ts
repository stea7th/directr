// src/lib/ai.ts
import OpenAI from "openai";

export type EditingBeat = {
  start: number;
  end: number;
  role: "talking_head" | "broll" | "overlay";
  onScreenText?: string;
  brollIdea?: string;
};

export type EditingPlan = {
  hook: {
    script: string;
    onScreenText: string;
  };
  outline: string[];
  beats: EditingBeat[];
  music: {
    description: string;
    searchKeywords: string[];
  };
  color: {
    description: string;
  };
  caption: string;
  thumbnailIdea: string;
  notes: string;
};

export type GenerateClipIdeasInput = {
  idea: string;        // user prompt
  platform: string;    // "TikTok", "Reels", "YouTube Shorts", etc.
  goal: string;        // growth/sales/etc
  lengthSeconds: number;
  tone: string;        // "Casual", "Serious", etc.
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function generateClipIdeas(
  input: GenerateClipIdeasInput
): Promise<EditingPlan> {
  const { idea, platform, goal, lengthSeconds, tone } = input;

  const systemPrompt = `
You are DIRECTR, an elite short-form content director for real creators.
You do NOT invent fake footage or deepfakes. You ONLY plan edits on the
creator's real footage: hooks, beats, on-screen text, B-roll ideas,
music, color grading, captions.

Always respond with a single valid JSON object matching this TypeScript type:

{
  "hook": { "script": string, "onScreenText": string },
  "outline": string[],
  "beats": Array<{
    "start": number,
    "end": number,
    "role": "talking_head" | "broll" | "overlay",
    "onScreenText"?: string,
    "brollIdea"?: string
  }>,
  "music": { "description": string, "searchKeywords": string[] },
  "color": { "description": string },
  "caption": string,
  "thumbnailIdea": string,
  "notes": string
}

No explanation, no markdown – JUST JSON.
`.trim();

  const userPrompt = `
Platform: ${platform}
Goal: ${goal || "Grow my page and drive sales"}
Target length: ~${lengthSeconds} seconds
Tone: ${tone}
Idea from creator:
"${idea}"

Assume the creator recorded a talking-head video on this topic.
Plan the best possible short-form edit that would actually perform on ${platform}.
`.trim();

  const completion = await openai.chat.completions.create({
    model: "gpt-5-mini", // you can bump to gpt-5.1 if you want
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });

  const raw = completion.choices[0].message.content || "{}";

  let parsed: EditingPlan;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    console.error("Failed to parse AI JSON, raw:", raw);
    throw new Error("Directr AI returned invalid JSON");
  }

  return parsed;
}
