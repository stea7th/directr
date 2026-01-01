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
        },
        { status: 500 }
      );
    }

    // ✅ LIMIT GUARD
    const FREE_LIMIT = 3;
    const isPro = !!profile.is_pro;
    const used = Number(profile.generations_used ?? 0);

    if (!isPro && used >= FREE_LIMIT) {
      return NextResponse.json(
        { success: false, error: "limit_reached", usage: { isPro, used, freeLimit: FREE_LIMIT } },
        { status: 402 }
      );
    }

    const contentType = req.headers.get("content-type") || "";

    // ---- Read input (JSON OR FormData) ----
    let prompt = "";
    let platform = "TikTok";
    let goal = "Drive sales, grow page, etc.";
    let lengthSeconds = "30";
    let tone = "Casual";

    if (contentType.includes("application/json")) {
      const body = (await req.json()) as GenerateBody;

      prompt = safeStr(body.prompt).trim();
      platform = safeStr(body.platform).trim() || platform;
      goal = safeStr(body.goal).trim() || goal;
      lengthSeconds = safeStr(body.lengthSeconds).trim() || lengthSeconds;
      tone = safeStr(body.tone).trim() || tone;
    } else if (
      contentType.includes("multipart/form-data") ||
      contentType.includes("application/x-www-form-urlencoded")
    ) {
      const form = await req.formData();

      prompt = safeStr(form.get("prompt")).trim();
      platform = safeStr(form.get("platform")).trim() || platform;
      goal = safeStr(form.get("goal")).trim() || goal;
      lengthSeconds = safeStr(form.get("lengthSeconds")).trim() || lengthSeconds;
      tone = safeStr(form.get("tone")).trim() || tone;
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "unsupported_content_type",
          details:
            'Content-Type must be "application/json", "multipart/form-data" or "application/x-www-form-urlencoded".',
        },
        { status: 415 }
      );
    }

    if (!prompt) {
      return NextResponse.json({ success: false, error: "Missing prompt" }, { status: 400 });
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
    // ✅ NOTE: your jobs table DOES NOT have file_* columns right now, so we do not send them.
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

    let job: any = null;
    let jobWarning: any = null;

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

    // ✅ Increment usage AFTER success (free users only) — EVEN if job insert fails
    if (!isPro) {
      const { error: incError } = await supabase
        .from("profiles")
        .update({ generations_used: used + 1 })
        .eq("id", user.id);

      if (incError) {
        return NextResponse.json({
          success: true,
          text,
          job,
          ...(jobWarning ?? {}),
          warning: "Output saved, but failed to increment usage.",
          inc_error: incError.message,
          usage: { isPro, usedBefore: used, freeLimit: FREE_LIMIT },
        });
      }
    }

    return NextResponse.json({
      success: true,
      text,
      job,
      ...(jobWarning ?? {}),
      usage: { isPro, usedBefore: used, freeLimit: FREE_LIMIT },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "server_error", details: err?.message || String(err) },
      { status: 500 }
    );
  }
}
