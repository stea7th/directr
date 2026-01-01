import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const BUILD_TAG = "prod_generate_usage_v1";

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

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { success: false, error: "OPENAI_API_KEY is not set on the server.", build: BUILD_TAG },
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
        { success: false, error: "auth_getUser_failed", details: userErr.message, build: BUILD_TAG },
        { status: 500 }
      );
    }

    if (!user) {
      return NextResponse.json({ success: false, error: "unauthorized", build: BUILD_TAG }, { status: 401 });
    }

    // ✅ Ensure profile row exists
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
          build: BUILD_TAG,
        },
        { status: 500 }
      );
    }

    // ✅ Fetch profile
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
          build: BUILD_TAG,
        },
        { status: 500 }
      );
    }

    const FREE_LIMIT = 3;
    const isPro = !!profile.is_pro;
    const usedBefore = Number(profile.generations_used ?? 0);

    // ✅ LIMIT GUARD
    if (!isPro && usedBefore >= FREE_LIMIT) {
      return NextResponse.json(
        {
          success: false,
          error: "limit_reached",
          build: BUILD_TAG,
          usage: { isPro, usedBefore, freeLimit: FREE_LIMIT },
        },
        { status: 402 }
      );
    }

    // ---- Read input (JSON only) ----
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return NextResponse.json(
        {
          success: false,
          error: "unsupported_content_type",
          details: 'Content-Type must be "application/json".',
          build: BUILD_TAG,
        },
        { status: 415 }
      );
    }

    const body = (await req.json()) as GenerateBody;

    const prompt = safeStr(body.prompt).trim();
    const platform = safeStr(body.platform).trim() || "TikTok";
    const goal = safeStr(body.goal).trim() || "Drive sales, grow page, etc.";
    const lengthSeconds = safeStr(body.lengthSeconds).trim() || "30";
    const tone = safeStr(body.tone).trim() || "Casual";

    if (!prompt) {
      return NextResponse.json({ success: false, error: "Missing prompt", build: BUILD_TAG }, { status: 400 });
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const system =
      "You are Directr, an expert short-form hook writer. Return clean, actionable output optimized for scroll-stopping hooks.";

    const userMsg = `
PROMPT:
${prompt}

CONTEXT:
- platform: ${platform}
- goal: ${goal}
- lengthSeconds: ${lengthSeconds}
- tone: ${tone}

Return:
- 10 scroll-stopping hook options (numbered)
- 3 caption options (with CTA)
- quick posting note (1-2 lines)

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

    // ---- Save job to Supabase (best-effort) ----
    // NOTE: no file_* columns because your jobs table doesn't have them right now
    let job: any = null;
    let jobWarning: any = null;

    const insertPayload: any = {
      type: "hooks",
      prompt,
      result_text: text,
      platform,
      goal,
      length_seconds: Number(lengthSeconds) || null,
      tone,
      user_id: user.id,
    };

    const { data: jobData, error: jobError } = await supabase
      .from("jobs")
      .insert(insertPayload)
      .select("*")
      .single();

    if (jobError) {
      jobWarning = {
        warning: "Saved output but failed to write job to database.",
        job_error: jobError.message,
      };
    } else {
      job = jobData;
    }

    // ✅ Increment usage AFTER success (free users only) — DO NOT early return on job failure
    if (!isPro) {
      const { error: incError } = await supabase
        .from("profiles")
        .update({ generations_used: usedBefore + 1 })
        .eq("id", user.id);

      if (incError) {
        return NextResponse.json({
          success: true,
          text,
          job,
          ...(jobWarning ?? {}),
          warning: "Output saved, but failed to increment usage.",
          inc_error: incError.message,
          build: BUILD_TAG,
          usage: { isPro, usedBefore, freeLimit: FREE_LIMIT },
        });
      }
    }

    return NextResponse.json({
      success: true,
      text,
      job,
      ...(jobWarning ?? {}),
      build: BUILD_TAG,
      usage: { isPro, usedBefore, freeLimit: FREE_LIMIT },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "server_error", details: err?.message || String(err), build: BUILD_TAG },
      { status: 500 }
    );
  }
}
