import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ THIS_IS_THE_GENERATE_ROUTE: true });
}
