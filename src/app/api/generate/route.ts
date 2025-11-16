// src/app/api/generate/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  let body: any = null;

  try {
    body = await req.json();
  } catch {
    body = null;
  }

  // Minimal JSON so we can prove the route works
  return NextResponse.json(
    {
      ok: true,
      message: "Hello from /api/generate (POST).",
      received: body,
    },
    { status: 200 }
  );
}

// Optional: hitting it in the browser with GET should ALSO give JSON
export async function GET() {
  return NextResponse.json(
    { ok: true, message: "Use POST at /api/generate." },
    { status: 200 }
  );
}
