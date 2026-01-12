// src/app/login/page.tsx
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function LoginPage() {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If cookie says you're authed, we should not show login
  if (user) redirect("/create");

  return (
    <div className="container" style={{ paddingTop: 28 }}>
      <LoginForm />
    </div>
  );
}
