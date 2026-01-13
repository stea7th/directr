import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Mode = "quick" | "blueprint";

type GenerateBody = {
  prompt?: string;
  platform?: string;
  goal?: string;
  lengthSeconds?: string | number;

  // legacy
  tone?: string;

  // NEW blueprint fields
  mode?: Mode;
  voice?: string;
  audienceLevel?: string;
  hookAngles?: string[]; // up to 2
  ctaIntent?: string;
};

function safeStr(v: unknown) {
  return typeof v === "string" ? v : v == null ? "" : String(v);
}

function safeArr(v: unknown): string[] {
  if (Array.isArray(v)) return v.map((x) => safeStr(x)).filter(Boolean);
  return [];
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

function buildSystemPrompt(mode: Mode) {
  if (mode === "blueprint") {
    return `
You are Directr — a ruthless short-form content director.

Your job is NOT to generate random text.
Your job is to remove decision-making and hand the creator a film-ready plan.

Rules:
- Write like a HUMAN speaking (creator voice), not an assistant
- No “AI-y” headings, no corporate tone, no filler
- No “stop scrolling” phrases, no cringe hype
- Spoken hooks only: short, sharp, natural out loud
- Be specific to the idea. If vague, make smart assumptions and commit.
- Keep sections tight. No essays.

STRUCTURE YOUR OUTPUT EXACTLY LIKE THIS (plain text):

1) HOOK OPTIONS (8)
- 8 spoken hooks, ONE sentence max each
- Use the selected hook angles
- Vary style (cadence, tension, curiosity) but stay on-topic

2) BEST HOOK PICK
- Pick the strongest hook (repeat it)
- Why it wins (2–4 sentences): psychology + retention

3) OPENING DELIVERY NOTES
- Tone + pacing + where to pause
- First visual shot suggestion (simple, phone-friendly)
- First on-screen text (optional, short)

4) VIDEO FLOW (for <LENGTH>s)
- Time blocks with what to say/do
- Include 1 retention beat (pattern interrupt or visual swap)

5) SHOT LIST (6–9)
- Mix A-roll + B-roll
- Simple, realistic shots
- Mention 1 “movement” shot

6) CAPTIONS (3)
- Short, human captions
- Only ONE CTA per caption (based on CTA intent)

7) CTA LINE
- The exact last line to say on camera (based on CTA intent)

IMPORTANT:
- Do NOT add any other sections.
- Do NOT say “as an AI”.
- Do NOT sound like advice. Sound like a creator’s script + plan.
`.trim();
  }

  // QUICK
  return `
You are Directr — a ruthless short-form content director.

Your ONLY goal:
Write hooks that STOP scrolling in the first 1–2 seconds.

Rules (do not break these):
- Write like a HUMAN speaking, not an assistant
- No polite phrasing, no filler
- No generic motivation
- Each hook must create tension, curiosity, or a pattern interrupt
- Hooks must sound natural when read out loud
- Short beats > long explanations
- If a hook wouldn’t make someone look up, it’s wrong

STRUCTURE YOUR OUTPUT EXACTLY LIKE THIS (plain text):

1) HOOK OPTIONS (10)
- One sentence max each

2) BEST HOOK PICK
- Repeat the best hook
- Why it works (2–3 sentences)

3) DELIVERY NOTES
- How to say it + first visual

4) CTA LINE
- One line to end the video

IMPORTANT:
- Do NOT sound like ChatGPT.
- No cringe phrases.
`.trim();
}

function buildUserPrompt(args: {
  prompt: string;
  platform: string;
  goal: string;
  lengthSeconds: string;
  tone: string;
  mode: Mode;
  voice: string;
  audienceLevel: string;
  hookAngles: string[];
  ctaIntent: string;
}) {
  const {
    prompt,
    platform,
    goal,
    lengthSeconds,
    tone,
    mode,
    voice,
    audienceLevel,
    hookAngles,
    ctaIntent,
  } = args;

  if (mode === "blueprint") {
    return `
CREATOR IDEA:
${prompt}

CONTEXT:
- platform: ${platform}
- goal: ${goal}
- lengthSeconds: ${lengthSeconds}
- creatorVoice: ${voice}
- audienceLevel: ${audienceLevel}
- hookAngles: ${hookAngles.length ? hookAngles.join(", ") : "Curiosity gap"}
- primaryCTA: ${ctaIntent}

Write the plan for this exact creator + audience.
Return plain text (not JSON).
`.trim();
  }

  return `
CREATOR IDEA:
${prompt}

CONTEXT:
- platform: ${platform}
- goal: ${goal}
- lengthSeconds: ${lengthSeconds}
- tone: ${tone}

Return plain text (not JSON).
`.trim();
}

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { success: false, error: "OPENAI_API_KEY is not set on the server." },
        { status: 500 }
      );
    }

    const supabase = await createServerClient();

    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();

    if (userErr) {
      return NextResponse.json(
        { success: false, error: "auth_getUser_failed", details: userErr.message },
        { status: 500 }
      );
    }

    if (!user) {
      return NextResponse.json({ success: false, error: "unauthorized" }, { status: 401 });
    }

    const FREE_LIMIT = 3;

    let { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("id, is_pro, generations_used")
      .eq("id", user.id)
      .maybeSingle();

    if (profileErr) {
      return NextResponse.json(
        {
          success: false,
          error: "profile_fetch_failed",
          details: profileErr.message,
          code: (profileErr as any)?.code ?? null,
          hint: (profileErr as any)?.hint ?? null,
        },
        { status: 500 }
      );
    }

    if (!profile) {
      const insertPayload: Record<string, any> = { id: user.id, is_pro: false };
      insertPayload.generations_used = 0;

      const { error: insErr } = await supabase.from("profiles").insert(insertPayload);

      if (insErr) {
        return NextResponse.json(
          {
            success: false,
            error: "profile_insert_failed",
            details: insErr.message,
            code: (insErr as any)?.code ?? null,
            hint: (insErr as any)?.hint ?? null,
          },
          { status: 500 }
        );
      }

      const refetch = await supabase
        .from("profiles")
        .select("id, is_pro, generations_used")
        .eq("id", user.id)
        .single();

      if (refetch.error) {
        return NextResponse.json(
          {
            success: false,
            error: "profile_refetch_failed",
            details: refetch.error.message,
            code: (refetch.error as any)?.code ?? null,
            hint: (refetch.error as any)?.hint ?? null,
          },
          { status: 500 }
        );
      }

      profile = refetch.data;
    }

    const isPro = !!profile?.is_pro;
    const usedBefore = Number((profile as any)?.generations_used ?? 0);

    if (!isPro && usedBefore >= FREE_LIMIT) {
      return NextResponse.json(
        {
          success: false,
          error: "limit_reached",
          usage: { isPro, usedBefore, freeLimit: FREE_LIMIT },
        },
        { status: 402 }
      );
    }

    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return NextResponse.json({ success: false, error: "unsupported_content_type" }, { status: 415 });
    }

    const body = (await req.json()) as GenerateBody;

    const prompt = safeStr(body.prompt).trim();
    if (!prompt) {
      return NextResponse.json({ success: false, error: "missing_prompt" }, { status: 400 });
    }

    const platform = safeStr(body.platform).trim() || "TikTok";
    const goal = safeStr(body.goal).trim() || "Get more views";
    const lengthSeconds = safeStr(body.lengthSeconds).trim() || "30";

    // NEW
    const mode: Mode = (safeStr(body.mode).trim() as Mode) === "blueprint" ? "blueprint" : "quick";

    // keep legacy tone working
    const tone = safeStr(body.tone).trim() || "Casual";

    const voice = safeStr(body.voice).trim() || "Raw & conversational";
    const audienceLevel = safeStr(body.audienceLevel).trim() || "Aware but stuck";
    const ctaIntent = safeStr(body.ctaIntent).trim() || "Comments";

    let hookAngles = safeArr(body.hookAngles);
    if (hookAngles.length > 2) hookAngles = hookAngles.slice(0, 2);
    if (mode === "blueprint" && hookAngles.length === 0) hookAngles = ["Curiosity gap"];

    const system = buildSystemPrompt(mode);
    const userMsg = buildUserPrompt({
      prompt,
      platform,
      goal,
      lengthSeconds,
      tone,
      mode,
      voice,
      audienceLevel,
      hookAngles,
      ctaIntent,
    });

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // blueprint needs a bit more room
    const maxOutputTokens = mode === "blueprint" ? 1300 : 700;

    const aiRes = await client.responses.create({
      model: "gpt-4.1-mini",
      max_output_tokens: maxOutputTokens,
      input: [
        { role: "system", content: system },
        { role: "user", content: userMsg },
      ],
    });

    const text = extractOutputText(aiRes);

    // increment usage after success
    let usedAfter = usedBefore;

    if (!isPro) {
      const { data: updated, error: incErr } = await supabase
        .from("profiles")
        .update({ generations_used: usedBefore + 1 })
        .eq("id", user.id)
        .select("generations_used")
        .single();

      if (incErr) {
        return NextResponse.json({
          success: true,
          text,
          warning: "Output generated, but failed to increment usage.",
          inc_error: incErr.message,
          inc_code: (incErr as any)?.code ?? null,
          inc_hint: (incErr as any)?.hint ?? null,
          usage: { isPro, usedBefore, usedAfter: usedBefore, freeLimit: FREE_LIMIT },
        });
      }

      usedAfter = Number((updated as any)?.generations_used ?? usedBefore + 1);
    }

    return NextResponse.json({
      success: true,
      text,
      usage: { isPro, usedBefore, usedAfter, freeLimit: FREE_LIMIT },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "server_error", details: err?.message || String(err) },
      { status: 500 }
    );
  }
}
