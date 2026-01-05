import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

function safeStr(v: unknown) {
  return typeof v === "string" ? v : v == null ? "" : String(v);
}

function extractOutputText(res: any): string {
  try {
    if (typeof res?.output_text === "string" && res.output_text.trim()) {
      return res.output_text.trim();
    }

    const out = res?.output;
    if (!Array.isArray(out)) return "AI response format was unexpected.";

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
    return texts.join("\n").trim() || "AI response format was unexpected.";
  } catch {
    return "AI response format was unexpected.";
  }
}

type GenerateBody = {
  prompt?: string;
  platform?: string;
  goal?: string;
  lengthSeconds?: string | number;
  tone?: string;
};

const FREE_LIMIT = 3;

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

    // Ensure profile exists (do NOT include updated_at)
    const { error: upsertError } = await supabase
      .from("profiles")
      .upsert({ id: user.id, is_pro: false, generations_used: 0 }, { onConflict: "id" });

    if (upsertError) {
      return NextResponse.json(
        {
          success: false,
          error: "profile_upsert_failed",
          details: upsertError.message,
          code: (upsertError as any).code ?? null,
          hint: (upsertError as any).hint ?? null,
        },
        { status: 500 }
      );
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("is_pro, generations_used")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        {
          success: false,
          error: "profile_fetch_failed",
          details: profileError?.message ?? "no_profile_row_returned",
          code: (profileError as any)?.code ?? null,
          hint: (profileError as any)?.hint ?? null,
        },
        { status: 500 }
      );
    }

    const isPro = !!profile.is_pro;
    const usedBefore = Number(profile.generations_used ?? 0);

    if (!isPro && usedBefore >= FREE_LIMIT) {
      return NextResponse.json({ success: false, error: "limit_reached" }, { status: 402 });
    }

    const contentType = req.headers.get("content-type") || "";

    let prompt = "";
    let platform = "TikTok";
    let goal = "Get more views, drive sales, grow page, etc.";
    let lengthSeconds = "30";
    let tone = "Casual";

    if (contentType.includes("application/json")) {
      const body = (await req.json()) as GenerateBody;
      prompt = safeStr(body.prompt).trim();
      platform = safeStr(body.platform).trim() || platform;
      goal = safeStr(body.goal).trim() || goal;
      lengthSeconds = safeStr(body.lengthSeconds).trim() || lengthSeconds;
      tone = safeStr(body.tone).trim() || tone;
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "unsupported_content_type",
          details: 'Content-Type must be "application/json".',
        },
        { status: 415 }
      );
    }

    if (!prompt) {
      return NextResponse.json({ success: false, error: "missing_prompt" }, { status: 400 });
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // 🔥 Strong anti-generic hook rules
    const system = `
You are Directr: an elite short-form hook writer for TikTok/Reels/Shorts.
Your job is to write hooks that sound like a real creator, not an AI.

Hard rules:
- NO generic clickbait phrases like: "Stop scrolling", "You won’t believe", "game-changer", "this will change your life", "watch till the end", "secret trick", "mind blown".
- NO brackets like [topic]. Write the actual topic.
- Every hook must be SPECIFIC to the user prompt, with concrete details.
- Write in the tone of a human creator speaking on camera.
- Prefer short sentences. Punchy. Natural.

Output format must be clean, plain text. No JSON.
`.trim();

    const userMsg = `
Write hooks for this video idea:

IDEA:
${prompt}

Context:
- Platform: ${platform}
- Goal: ${goal}
- Video length: ${lengthSeconds}s
- Tone: ${tone}

Return EXACTLY this structure:

A) 10 HOOKS (each must be 2 lines)
Format:
1) Hook line (first words out of mouth)
   Next line (the follow-up that keeps attention)

B) 3 CAPTIONS (short, not cringe)
- Each caption includes a simple CTA (comment/follow/save/link in bio)

C) 1 POSTING NOTE
- One sentence, specific to the platform and goal

Quality bar:
- Hooks should vary in style: curiosity, contrarian, proof/credibility, story, direct benefit.
- At least 3 hooks must include a specific number/time/result (if possible).
- At least 2 hooks should be contrarian (“Most people do X, but…”).
`.trim();

    const aiRes = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        { role: "system", content: system },
        { role: "user", content: userMsg },
      ],
    });

    const text = extractOutputText(aiRes);

    // Best-effort job write, but keep schema-safe (only fields you likely have)
    const { error: jobError } = await supabase.from("jobs").insert({
      type: "hooks",
      prompt,
      result_text: text,
      user_id: user.id,
    });

    // Increment usage AFTER success (free users only)
    if (!isPro) {
      const { error: incError } = await supabase
        .from("profiles")
        .update({ generations_used: usedBefore + 1 })
        .eq("id", user.id);

      if (incError) {
        // Still return success; logging only
        console.error("Failed to increment generations_used:", incError);
      }
    }

    return NextResponse.json({
      success: true,
      text,
      job: jobError ? null : true,
      build: "prod_generate_hookquality_v2",
      usage: { isPro, usedBefore, freeLimit: FREE_LIMIT },
    });
  } catch (err: any) {
    console.error("generate route error:", err);
    return NextResponse.json(
      { success: false, error: "server_error", details: err?.message || String(err) },
      { status: 500 }
    );
  }
}
