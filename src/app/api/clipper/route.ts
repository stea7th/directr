import { NextResponse } from "next/server";
export const runtime = "nodejs";

export async function POST() {
  return NextResponse.json({ success: false, error: "Clipper not wired yet" });
}
