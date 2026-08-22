import { redirect } from "next/navigation";
import { authenticatedCreator, getCreatorDNA } from "@/lib/directr-server";
import TodayExperience from "./TodayExperience";

export const dynamic = "force-dynamic";

export default async function TodayPage() {
  const account = await authenticatedCreator();
  if (!account) redirect("/login?next=%2Ftoday");

  const profile = await getCreatorDNA(account.supabase, account.user);
  if (!profile.onboardedAt) redirect("/onboarding");

  return <TodayExperience profile={profile} />;
}
