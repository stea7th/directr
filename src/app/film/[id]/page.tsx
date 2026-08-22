import { redirect } from "next/navigation";
import { authenticatedCreator, getCreatorDNA } from "@/lib/directr-server";
import FilmExperience from "./FilmExperience";

export const dynamic = "force-dynamic";

export default async function FilmPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const account = await authenticatedCreator();
  if (!account) redirect(`/login?next=${encodeURIComponent(`/film/${id}`)}`);
  const profile = await getCreatorDNA(account.supabase, account.user);
  if (!profile.onboardedAt) redirect("/onboarding");
  return <FilmExperience id={id} profile={profile} />;
}
