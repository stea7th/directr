// src/app/api/generate/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  let body: any = null;

  try {
    body = await req.json();
  } catch {
    body = null;
  }

  return NextResponse.json(
    {
      ok: true,
      message: "Hello from /api/generate",
      received: body,
    },
    { status: 200 }
  );
}

export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      message: "Use POST to /api/generate",
    },
    { status: 200 }
  );
}
