import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BUILD_TAG = "generate_prod_final_v1";

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
};

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { success: false, error: "OPENAI_API_KEY missing", build: BUILD_TAG },
        { status: 500 }
      );
    }

    const supabase = await createServerClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "unauthorized", build: BUILD_TAG },
        { status: 401 }
      );
    }

    // ensure profile exists
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

    const FREE_LIMIT = 3;
    const isPro = !!profile?.is_pro;
    const usedBefore = Number(profile?.generations_used ?? 0);

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

    const body = (await req.json()) as GenerateBody;
    const prompt = safeStr(body.prompt).trim();

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: "Missing prompt", build: BUILD_TAG },
        { status: 400 }
      );
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const aiRes = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content:
            "You are Directr, an expert short-form hook writer. Output scroll-stopping hooks only.",
        },
        {
          role: "user",
          content: `Give me 10 scroll-stopping hooks for:\n${prompt}`,
        },
      ],
    });

    const text = extractOutputText(aiRes);

    // increment usage AFTER success
    if (!isPro) {
      await supabase
        .from("profiles")
        .update({ generations_used: usedBefore + 1 })
        .eq("id", user.id);
    }

    return NextResponse.json({
      success: true,
      text,
      build: BUILD_TAG,
      usage: {
        isPro,
        usedBefore,
        usedAfter: isPro ? usedBefore : usedBefore + 1,
        freeLimit: FREE_LIMIT,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: "server_error",
        details: err?.message ?? String(err),
        build: BUILD_TAG,
      },
      { status: 500 }
    );
  }
}
