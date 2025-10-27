// src/components/Header.tsx  (or inside app/layout.tsx)
import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";

export default async function Header() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  async function signOut() {
    "use server";
    const s = await createServerClient();
    await s.auth.signOut();
  }

  return (
    <nav className="nav">
      <div className="nav__inner">
        <Link href="/" className="logo">
          directr<span className="dot">.</span>
        </Link>

        <div className="menu">
          <Link href="/create">Create</Link>
          <Link href="/clipper">Clipper</Link>
          <Link href="/planner">Planner</Link>
          <Link href="/jobs">Jobs</Link>

          {user ? (
            <form action={signOut}>
              <button className="btn btn--ghost" type="submit">
                Sign out
              </button>
            </form>
          ) : (
            <Link href="/login" className="btn btn--primary">
              Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
