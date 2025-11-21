// src/app/api/generate/route.ts
import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      ok: true,
      route: "/api/generate",
      message: "If you see this, the API route is wired correctly.",
    },
    { status: 200 },
  );
}
