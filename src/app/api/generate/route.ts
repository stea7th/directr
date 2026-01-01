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

    // ✅ use your project’s server client helper (works on Next 15)
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

    // ✅ LIMIT GUARD (source of truth)
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("is_pro, generations_used")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      console.error("Profile fetch error:", profileError);
      return NextResponse.json(
        { success: false, error: "profile_missing" },
        { status: 500 }
      );
    }

    const isPro = !!profile.is_pro;
    const used = Number(profile.generations_used ?? 0);
    const FREE_LIMIT = 3;

    if (!isPro && used >= FREE_LIMIT) {
      return NextResponse.json(
        { success: false, error: "limit_reached" },
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
    let fileMeta: { name: string; type: string; size: number } | null = null;

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

      const file = form.get("file");
      fileMeta =
        file instanceof File
          ? { name: file.name, type: file.type, size: file.size }
          : null;
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to generate response.",
          details:
            'Content-Type was not one of "application/json", "multipart/form-data" or "application/x-www-form-urlencoded".',
        },
        { status: 415 }
      );
    }

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: "Missing prompt" },
        { status: 400 }
      );
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const system = `You are Directr, an expert short-form hook writer. Return clean, actionable output optimized for scroll-stopping hooks.`;

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
    const insertPayload: any = {
      type: "hooks",
      prompt,
      result_text: text,
      platform,
      goal,
      length_seconds: Number(lengthSeconds) || null,
      tone,
      file_name: fileMeta?.name ?? null,
      file_type: fileMeta?.type ?? null,
      file_size: fileMeta?.size ?? null,
      user_id: user.id,
    };

    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .insert(insertPayload)
      .select("*")
      .single();

    if (jobError) {
      console.error("Supabase insert error:", jobError);
      return NextResponse.json({
        success: true,
        text,
        job: null,
        warning: "Saved output but failed to write job to database.",
      });
    }

    // ✅ INCREMENT USAGE ONLY AFTER SUCCESS (free users only)
    if (!isPro) {
      const { error: incError } = await supabase
        .from("profiles")
        .update({ generations_used: used + 1 })
        .eq("id", user.id);

      if (incError) {
        console.error("Failed to increment generations_used:", incError);
        // still return success; we don't want to block output
      }
    }

    return NextResponse.json({ success: true, text, job });
  } catch (err: any) {
    console.error("generate error:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate response.",
        details: err?.message || String(err),
      },
      { status: 500 }
    );
  }
}
