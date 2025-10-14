// Simple JSON API for a job by id

type Params = { id: string };

export async function GET(
  _req: Request,
  ctx: { params: Promise<Params> }
) {
  const { id } = await ctx.params;

  // TODO: fetch real data here (e.g., from Supabase)
  // const { data } = await supabase.from("jobs").select("*").eq("id", id).single();

  return Response.json({
    id,
    status: "ok",
    // job: data,
  });
}
