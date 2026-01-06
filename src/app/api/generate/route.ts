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

    // ✅ Fetch profile
    let { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("id, is_pro, generations_used")
      .eq("id", user.id)
      .maybeSingle();

    if (profileErr) {
      return NextResponse.json(
        { success: false, error: "profile_fetch_failed", details: profileErr.message },
        { status: 500 }
      );
    }

    // ✅ Insert ONLY if missing (DO NOT upsert counters)
    if (!profile) {
      const { error: insErr } = await supabase.from("profiles").insert({
        id: user.id,
        is_pro: false,
        generations_used: 0,
      });

      if (insErr) {
        return NextResponse.json(
          { success: false, error: "profile_insert_failed", details: insErr.message },
          { status: 500 }
        );
      }

      // re-fetch
      const refetch = await supabase
        .from("profiles")
        .select("id, is_pro, generations_used")
        .eq("id", user.id)
        .single();

      if (refetch.error) {
        return NextResponse.json(
          { success: false, error: "profile_refetch_failed", details: refetch.error.message },
          { status: 500 }
        );
      }

      profile = refetch.data;
    }

    const isPro = !!profile.is_pro;
    const usedBefore = Number(profile.generations_used ?? 0);

    // ✅ Enforce limit BEFORE generation
    if (!isPro && usedBefore >= FREE_LIMIT) {
      return NextResponse.json(
        { success: false, error: "limit_reached", usage: { isPro, usedBefore, freeLimit: FREE_LIMIT } },
        { status: 402 }
      );
    }

    // ---- Parse input ----
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return NextResponse.json(
        { success: false, error: "unsupported_content_type" },
        { status: 415 }
      );
    }

    const body = (await req.json()) as GenerateBody;

    const prompt = safeStr(body.prompt).trim();
    const platform = safeStr(body.platform).trim() || "TikTok";
    const goal = safeStr(body.goal).trim() || "Get more views";
    const lengthSeconds = safeStr(body.lengthSeconds).trim() || "30";
    const tone = safeStr(body.tone).trim() || "Casual";

    if (!prompt) {
      return NextResponse.json({ success: false, error: "missing_prompt" }, { status: 400 });
    }

    // ---- OpenAI ----
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const system = `
You are Directr.
You are NOT an AI writer.
You are a short-form content director who has worked with real creators.

STRICT RULES:
- Do NOT use generic phrases like: "stop scrolling", "game changer", "you won’t believe", "this changed everything"
- Hooks must sound SPOKEN, NATURAL, HUMAN
- Specific > clever. Clarity > hype.
- If it sounds AI, rewrite it.

Output MUST follow the format exactly.
`.trim();

    const userMsg = `
CREATOR IDEA:
${prompt}

PLATFORM: ${platform}
GOAL: ${goal}
VIDEO LENGTH: ~${lengthSeconds}s
TONE: ${tone}

OUTPUT FORMAT (FOLLOW EXACTLY):

1. HOOK OPTIONS (8)
- Each hook is 1–2 spoken lines (what someone would actually say)

2. BEST HOOK PICK
- Pick the strongest hook + 1 sentence why

3. OPENING DELIVERY NOTES
- How to say the first 3 seconds (pacing, pauses, emphasis)

4. VIDEO FLOW FRAMEWORK
- 0–3s: Hook
- 3–10s: Context
- 10–25s: Core value
- 25–end: Payoff or CTA

5. SHOT LIST / B-ROLL IDEAS
- 6–8 phone-friendly shots (jump cuts, movement, screen changes)

6. CAPTIONS (3)
- Short, native to ${platform}, 1 CTA max

7. POSTING NOTES
- When to post
- What to reply to first comments
- One retention trick

No emojis. No markdown. No fluff.
`.trim();

    const aiRes = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        { role: "system", content: system },
        { role: "user", content: userMsg },
      ],
    });

    const text = extractOutputText(aiRes);

    // ✅ Increment usage AFTER success (atomic) for free users
    let usedAfter = usedBefore;

    if (!isPro) {
      const { data: updated, error: incErr } = await supabase
        .from("profiles")
        .update({ generations_used: usedBefore + 1 })
        .eq("id", user.id)
        .select("generations_used")
        .single();

      if (incErr) {
        // don’t block output, but surface it so you can see it
        return NextResponse.json({
          success: true,
          text,
          warning: "Output generated, but failed to increment usage.",
          inc_error: incErr.message,
          usage: { isPro, usedBefore, usedAfter: usedBefore, freeLimit: FREE_LIMIT },
        });
      }

      usedAfter = Number(updated?.generations_used ?? usedBefore + 1);
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
