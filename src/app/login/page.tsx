// src/app/login/page.tsx
import { redirect } from "next/navigation";
import LoginForm from "./LoginForm";
import { createServerClient } from "@/lib/supabase/server";

export default async function LoginPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ✅ If already signed in, never render login (prevents 2s flicker)
  if (user) redirect("/create");

  return (
    <div className="container" style={{ paddingTop: 28 }}>
      <LoginForm />
    </div>
  );
}
