import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BUILD_TAG = "generate_service_role_usage_v3";

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
        { success: false, error: "OPENAI_API_KEY missing", build: BUILD_TAG },
        { status: 500, headers: { "Cache-Control": "no-store" } }
      );
    }

    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.SUPABASE_URL ||
      "";

    const serviceKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_SERVICE_ROLE ||
      "";

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json(
        {
          success: false,
          error: "missing_supabase_service_role",
          details:
            "Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel env.",
          build: BUILD_TAG,
        },
        { status: 500, headers: { "Cache-Control": "no-store" } }
      );
    }

    // cookie-based client (for auth)
    const supabase = await createServerClient();
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();

    if (userErr) {
      return NextResponse.json(
        { success: false, error: "auth_getUser_failed", details: userErr.message, build: BUILD_TAG },
        { status: 500, headers: { "Cache-Control": "no-store" } }
      );
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: "unauthorized", build: BUILD_TAG },
        { status: 401, headers: { "Cache-Control": "no-store" } }
      );
    }

    // admin client (bypass RLS for usage tracking)
    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // Ensure profile exists (admin bypass)
    const { error: upsertErr } = await admin
      .from("profiles")
      .upsert({ id: user.id, is_pro: false, generations_used: 0 }, { onConflict: "id" });

    if (upsertErr) {
      return NextResponse.json(
        {
          success: false,
          error: "profile_upsert_failed",
          details: upsertErr.message,
          build: BUILD_TAG,
        },
        { status: 500, headers: { "Cache-Control": "no-store" } }
      );
    }

    // Fetch profile (admin bypass)
    const { data: profile, error: profileErr } = await admin
      .from("profiles")
      .select("is_pro, generations_used")
      .eq("id", user.id)
      .single();

    if (profileErr || !profile) {
      return NextResponse.json(
        {
          success: false,
          error: "profile_fetch_failed",
          details: profileErr?.message ?? "no_profile",
          build: BUILD_TAG,
        },
        { status: 500, headers: { "Cache-Control": "no-store" } }
      );
    }

    const FREE_LIMIT = 3;
    const isPro = !!profile.is_pro;
    const usedBefore = Number(profile.generations_used ?? 0);

    if (!isPro && usedBefore >= FREE_LIMIT) {
      return NextResponse.json(
        {
          success: false,
          error: "limit_reached",
          build: BUILD_TAG,
          usage: { isPro, usedBefore, usedAfter: usedBefore, freeLimit: FREE_LIMIT },
        },
        { status: 402, headers: { "Cache-Control": "no-store" } }
      );
    }

    // Read JSON body
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return NextResponse.json(
        {
          success: false,
          error: "unsupported_content_type",
          details: 'Content-Type must be "application/json".',
          build: BUILD_TAG,
        },
        { status: 415, headers: { "Cache-Control": "no-store" } }
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
        { success: false, error: "Missing prompt", build: BUILD_TAG },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const system =
      "You are Directr, an expert short-form hook writer. Return clean, scroll-stopping hooks and captions.";

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
- 1 quick posting note

Plain text only.
`.trim();

    const aiRes = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        { role: "system", content: system },
        { role: "user", content: userMsg },
      ],
    });

    const text = extractOutputText(aiRes);

    // Increment usage after success (admin bypass)
    let usedAfter = usedBefore;
    if (!isPro) {
      const { data: incRow, error: incErr } = await admin
        .from("profiles")
        .update({ generations_used: usedBefore + 1 })
        .eq("id", user.id)
        .select("generations_used")
        .single();

      if (incErr) {
        // still return hooks, but tell you usage failed
        return NextResponse.json(
          {
            success: true,
            text,
            job: null,
            warning: "Output ok but usage increment failed.",
            inc_error: incErr.message,
            build: BUILD_TAG,
            usage: { isPro, usedBefore, usedAfter: usedBefore, freeLimit: FREE_LIMIT },
          },
          { status: 200, headers: { "Cache-Control": "no-store" } }
        );
      }

      usedAfter = Number(incRow?.generations_used ?? usedBefore + 1);
    }

    return NextResponse.json(
      {
        success: true,
        text,
        job: null,
        build: BUILD_TAG,
        usage: { isPro, usedBefore, usedAfter, freeLimit: FREE_LIMIT },
      },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: "server_error",
        details: err?.message ?? String(err),
        build: BUILD_TAG,
      },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
