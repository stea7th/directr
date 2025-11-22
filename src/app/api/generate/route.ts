// src/app/api/generate/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      route: "/api/generate",
      method: "GET",
      message: "API route is alive and returning JSON.",
    },
    { status: 200 }
  );
}

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";

    let prompt = "";
    let platform = "TikTok";

    if (contentType.includes("application/json")) {
      const body = await req.json();
      prompt = (body.prompt ?? "").trim();
      platform = (body.platform ?? "TikTok").trim();
    } else if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      prompt = ((form.get("prompt") as string | null) ?? "").trim();
      platform = ((form.get("platform") as string | null) ?? "TikTok").trim();
    } else {
      return NextResponse.json(
        {
          ok: false,
          error: "Unsupported content type",
          contentType,
        },
        { status: 400 }
      );
    }

    if (!prompt) {
      return NextResponse.json(
        { ok: false, error: "Prompt is required" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        route: "/api/generate",
        method: "POST",
        prompt,
        platform,
        message: "This is a fake AI response. Route is wired correctly.",
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Generate route error", err);
    return NextResponse.json(
      {
        ok: false,
        error: err?.message ?? "Unknown error",
      },
      { status: 500 }
    );
  }
}
