import { NextResponse } from "next/server";

/**
 * GET /api/jobs/[id]
 * Reads the [id] from the request URL instead of relying on Next's context arg.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.pathname.split("/").pop() || "";
  // TODO: fetch the job by id from your DB if needed
  return NextResponse.json({ id, ok: true });
}

/**
 * DELETE /api/jobs/[id]
 */
export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const id = url.pathname.split("/").pop() || "";
  // TODO: delete/cancel job by id
  return NextResponse.json({ id, deleted: true });
}
