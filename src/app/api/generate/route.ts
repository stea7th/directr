// src/app/api/generate/route.ts
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const prompt = (body.prompt || "").trim();
    const platform = (body.platform || "TikTok").trim();
    const clips = Number(body.clips || 5);
    const style = (body.style || "default").trim();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // 🔹 Supabase + auth
    const supabase = await createServerClient();
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user?.id) {
      return NextResponse.json(
        { error: "Not signed in" },
        { status: 401 }
      );
    }

    // 🔹 Placeholder "AI result" – we’ll swap this for real AI/video later
    const fakeResult = [
      `Platform: ${platform}`,
      `Requested clips: ${clips}`,
      `Style: ${style}`,
      "",
      "This is placeholder output from /api/generate.",
      "Once AI is wired, this will be real editing instructions / scripts.",
    ].join("\n");

    const id = randomUUID();

    // 🔹 Insert job into Supabase
    const { data: job, error: dbError } = await supabase
      .from("jobs")
      .insert({
        id,
        user_id: user.id,
        platform,
        prompt,
        result: fakeResult,
        status: "complete", // must be valid per jobs_status_check
      })
      .select("*")
      .single();

    if (dbError) {
      console.error("DB insert error", dbError);
      return NextResponse.json(
        { error: dbError.message },
        { status: 500 }
      );
    }

    // 🔹 Return the job so the UI can show it
    return NextResponse.json({ job }, { status: 201 });
  } catch (err: any) {
    console.error("Generate API error:", err);
    return NextResponse.json(
      { error: err?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
