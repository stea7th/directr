import { NextResponse } from "next/server";

// ✅ Keep it simple: don't type the 2nd arg.
// Next will pass { params: { id: string } } here.
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  // TODO: look up job by id if you need to
  // const job = await ...;

  return NextResponse.json({ id, ok: true });
}

// (Optional) other methods:
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  // TODO: delete/cancel job id
  return NextResponse.json({ id, deleted: true });
}
