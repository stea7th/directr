// src/app/api/generate/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    let json: any = null;

    try {
      json = await req.json();
    } catch {
      json = null;
    }

    return NextResponse.json(
      {
        ok: true,
        source: "directr /api/generate TEST route",
        receivedBody: json,
        note:
          "If you see this in the UI, the API route is working and the problem is NOT that HTML error anymore.",
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        error: err?.message || "Unknown error in test route",
      },
      { status: 500 }
    );
  }
}
