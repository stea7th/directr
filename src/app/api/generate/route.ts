// src/app/api/generate/route.ts
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
// If you want Supabase later, you can uncomment this:
// import { createServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs"; // ensure Node (not edge) for FormData + future AI

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";

    let prompt = "";
    let platform = "TikTok";

    // 1) Handle both JSON and FormData, so whatever the frontend sends works
    if (contentType.includes("application/json")) {
      const body = await req.json();
      prompt = (body.prompt ?? "").trim();
      platform = (body.platform ?? "TikTok").trim();
    } else if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();

      prompt = ((form.get("prompt") as string | null) ?? "").trim();
      platform = ((form.get("platform") as string | null) ?? "TikTok").trim();

      // If/when you start handling uploads, you'll use this:
      // const file = form.get("file") as File | null;
      // TODO: upload file to Supabase storage / S3, etc.
    } else {
      return NextResponse.json(
        { error: "Unsupported content type" },
        { status: 400 }
      );
    }

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // 2) (Later) You can plug in Supabase auth + jobs here
    // const supabase = await createServerClient();
    // const { data: { user } } = await supabase.auth.getUser();
    // if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

    // 3) For now: fake AI result so the UI actually works
    const jobId = randomUUID();
    const resultText = `AI would generate clips for "${prompt}" on ${platform} here.`;

    // Later you’ll call your real AI helper here, e.g.:
    // const resultText = await generateClipIdeas({ ... })

    // 4) Always return JSON
    return NextResponse.json(
      {
        ok: true,
        jobId,
        prompt,
        platform,
        result: resultText,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Generate route error", err);
    return NextResponse.json(
      { error: err?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
