// src/app/api/generate/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  let body: any = null;

  try {
    body = await req.json();
  } catch {
    body = null;
  }

  const prompt = (body?.prompt ?? "").trim();
  const platform = (body?.platform ?? "TikTok").trim();
  const goal = body?.goal ?? "";
  const length = body?.length ?? "";
  const tone = body?.tone ?? "";
  const fileName = body?.fileName ?? null;

  const job = {
    id: "job_" + Date.now().toString(),
    prompt,
    platform,
    goal,
    length,
    tone,
    fileName,
    status: "complete",
    created_at: new Date().toISOString(),
  };

  return NextResponse.json({ job }, { status: 201 });
}

export async function GET() {
  return NextResponse.json(
    { ok: true, message: "POST to /api/generate with JSON." },
    { status: 200 }
  );
}
