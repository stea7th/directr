import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type GenerateBody = {
  prompt?: string;
  platform?: string;
  goal?: string;
  lengthSeconds?: string | number;
  tone?: string;
};

function safeStr(v: unknown) {
  return typeof v === "string" ? v : v == null ? "" : String(v);
}

function extractOutputText(res: any): string {
  try {
    if (typeof res?.output_text === "string" && res.output_text.trim()) {
      return res.output_text.trim();
    }

    const out = res?.output;
    if (!Array.isArray(out)) return "Unexpected AI response.";

    const texts: string[] = [];
    for (const item of out) {
      const content = item?.content;
      if (!Array.isArray(content)) continue;
      for (const c of content) {
        if (c?.type === "output_text" && typeof c?.text === "string") {
          texts.push(c.text);
        }
      }
    }
    return texts.join("\n").trim() || "Unexpected AI response.";
  } catch {
    return "Unexpected AI response.";
  }
}

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { success: false, error: "OPENAI_API_KEY missing" },
        { status: 500 }
      );
    }

    const supabase = await createServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "unauthorized" },
        { status: 401 }
      );
    }

    // ---- ensure profile exists ----
    await supabase
      .from("profiles")
      .upsert(
        { id: user.id, is_pro: false, generations_used: 0 },
        { onConflict: "id" }
      );

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_pro, generations_used")
      .eq("id", user.id)
      .single();

    const isPro = !!profile?.is_pro;
    const used = Number(profile?.generations_used ?? 0);
    const FREE_LIMIT = 3;

    if (!isPro && used >= FREE_LIMIT) {
      return NextResponse.json(
        { success: false, error: "limit_reached" },
        { status: 402 }
      );
    }

    const contentType = req.headers.get("content-type") || "";

    let prompt = "";
    let platform = "TikTok";
    let goal = "Grow views";
    let lengthSeconds = "30";
    let tone = "Casual";

    if (contentType.includes("application/json")) {
      const body = (await req.json()) as GenerateBody;
      prompt = safeStr(body.prompt).trim();
      platform = safeStr(body.platform) || platform;
      goal = safeStr(body.goal) || goal;
      lengthSeconds = safeStr(body.lengthSeconds) || lengthSeconds;
      tone = safeStr(body.tone) || tone;
    } else {
      return NextResponse.json(
        { success: false, error: "unsupported_content_type" },
        { status: 415 }
      );
    }

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: "missing_prompt" },
        { status: 400 }
      );
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // ===============================
    // 🔒 CORE PROMPT — DO NOT WATER DOWN
    // ===============================
    const system = `
You are Directr.

You are NOT an AI writer.
You are a short-form content director who has worked with real creators.

Your job:
Create hooks and frameworks that sound SPOKEN, NATURAL, and HUMAN.

STRICT RULES:
- Do NOT use generic phrases like:
  "stop scrolling", "game changer", "you won’t believe", "this changed everything"
- Hooks must sound like something a real person would say on camera
- Assume the creator is talking to ONE person
- Write in short, punchy, conversational sentences
- Specific > clever
- Clarity > hype

If something sounds like AI, rewrite it.

Platform language matters.
Hooks must fit how people actually talk on ${platform}.
`;

    const userMsg = `
CREATOR IDEA:
${prompt}

GOAL:
${goal}

PLATFORM:
${platform}

VIDEO LENGTH:
~${lengthSeconds} seconds

TONE:
${tone}

OUTPUT FORMAT (FOLLOW EXACTLY):

1. HOOK OPTIONS (8)
- Each hook should be 1–2 spoken lines
- Line 1 = pattern interrupt
- Line 2 = retention / curiosity
- Write them how someone would actually say them out loud

2. BEST HOOK PICK
- Choose the strongest hook
- Explain WHY it works in 1 sentence

3. OPENING DELIVERY NOTES
- How to say the first 3 seconds
- Pacing, pauses, emphasis

4. VIDEO FLOW FRAMEWORK
- 0–3s: Hook
- 3–10s: Context
- 10–25s: Core value
- 25–end: Payoff or CTA

5. SHOT LIST / B-ROLL IDEAS
- 5–8 concrete shots
- Simple phone-friendly ideas
- Think jump cuts, movement, screen changes

6. CAPTIONS (3)
- Short
- Native to ${platform}
- 1 CTA max

7. POSTING NOTES
- When to post
- How to reply to the first comments
- One retention trick to boost watch time

Return clean, readable text.
No emojis.
No markdown.
No fluff.
`.trim();

    const aiRes = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        { role: "system", content: system },
        { role: "user", content: userMsg },
      ],
    });

    const text = extractOutputText(aiRes);

    // ---- increment usage AFTER success ----
    if (!isPro) {
      await supabase
        .from("profiles")
        .update({ generations_used: used + 1 })
        .eq("id", user.id);
    }

    return NextResponse.json({
      success: true,
      text,
      usage: {
        isPro,
        usedBefore: used,
        freeLimit: FREE_LIMIT,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "server_error", details: err?.message || String(err) },
      { status: 500 }
    );
  }
}
