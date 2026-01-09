import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
      return NextResponse.json(
        { success: false, error: "unauthorized" },
        { status: 401 }
      );
    }

    const FREE_LIMIT = 3;

    // ✅ Fetch profile (don’t assume columns exist; handle missing gracefully)
    let { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("id, is_pro, generations_used")
      .eq("id", user.id)
      .maybeSingle();

    // If the table/columns are out of sync, fail loud so you see it
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

    // ✅ Insert ONLY if missing (NO upsert reset)
    if (!profile) {
      // IMPORTANT: only insert fields that definitely exist in your schema.
      // If your profiles table DOESN'T have generations_used, remove it and use a separate usage table.
      const insertPayload: Record<string, any> = { id: user.id, is_pro: false };

      // try to include generations_used if your schema supports it
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

    // ✅ Enforce limit BEFORE generation
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
      return NextResponse.json(
        { success: false, error: "missing_prompt" },
        { status: 400 }
      );
    }

    // ---- OpenAI ----
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const system = `
You are Directr — a ruthless short-form content director.

Your ONLY goal:
Write hooks that STOP scrolling in the first 1–2 seconds.

Rules (do not break these):
- Write like a HUMAN speaking, not an assistant
- No polite phrasing, no filler, no “here’s how”
- No generic motivation
- Each hook must create tension, curiosity, or a pattern interrupt
- Hooks must sound natural when read out loud
- Short beats > long explanations
- If a hook wouldn’t make someone look up, it’s wrong

STRUCTURE YOUR OUTPUT EXACTLY LIKE THIS:

1. SCROLL-STOPPING HOOKS (10)
Each hook must:
- Be ONE sentence max
- Feel slightly uncomfortable, bold, or risky
- Avoid buzzwords and clichés

2. BEST HOOK PICK (1)
- Pick the strongest hook
- Explain WHY it works in 2–3 sentences (psychology + retention)

3. DELIVERY GUIDE
- How to say the hook (tone, pacing, pause)
- What the first visual shot should be
- Where to pause for retention

4. SHOT LIST (5–7 quick shots)
- Simple, realistic shots (phone-friendly)
- Focus on movement, cuts, or visual contrast

5. CAPTIONS (3)
- Short
- Casual
- One CTA max

6. POSTING FRAMEWORK
- Best post timing (general, not specific)
- First comment idea
- What to reply when someone comments “how?”

IMPORTANT:
Do NOT sound like ChatGPT.
If it sounds like advice, rewrite it.
If it sounds safe, rewrite it.
`.trim();

    const userMsg = `
CREATOR IDEA:
${prompt}

CONTEXT:
- platform: ${platform}
- goal: ${goal}
- lengthSeconds: ${lengthSeconds}
- tone: ${tone}

Return plain text (not JSON).
`.trim();

    const aiRes = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        { role: "system", content: system },
        { role: "user", content: userMsg },
      ],
    });

    const text = extractOutputText(aiRes);

    // ✅ Increment usage AFTER success (atomic-ish)
    let usedAfter = usedBefore;

    if (!isPro) {
      // If your profiles table doesn't have generations_used, this will throw.
      // We surface the error but DO NOT block output.
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
