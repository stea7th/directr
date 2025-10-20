// No "use client" – this is a Server Component with a Server Action
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

function projectRefFromUrl(url: string) {
  const m = url.match(/^https?:\/\/([a-z0-9-]+)\.supabase\.co/i);
  return m?.[1] || null;
}

async function setAuthCookiesFromSession(session: any) {
  "use server";
  if (!session) return;

  const jar = cookies();
  const { access_token, refresh_token, expires_in, expires_at } = session;

  const now = Math.floor(Date.now() / 1000);
  const exp = typeof expires_at === "number" ? expires_at : now + (expires_in || 3600);
  const maxAge = Math.max(60, exp - now);

  // Generic names
  jar.set("sb-access-token", access_token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge,
  });
  jar.set("sb-refresh-token", refresh_token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: Math.max(maxAge, 60 * 60 * 24 * 14),
  });

  // Project-ref names (what many SSR helpers expect)
  const ref = projectRefFromUrl(SUPABASE_URL);
  if (ref) {
    jar.set(`sb-${ref}-auth-token`, access_token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge,
    });
    jar.set(`sb-${ref}-refresh-token`, refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: Math.max(maxAge, 60 * 60 * 24 * 14),
    });
  }
}

export default function LoginPage() {
  async function signInAction(formData: FormData) {
    "use server";
    const email = String(formData.get("email") || "");
    const password = String(formData.get("password") || "");

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false },
    });

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      // Re-render page with an error by throwing a redirect with a query param
      redirect(`/login?err=${encodeURIComponent(error.message)}`);
    }

    await setAuthCookiesFromSession(data.session);
    // go wherever you want post-login
    redirect("/planner"); // or "/"
  }

  async function sendResetAction(formData: FormData) {
    "use server";
    const email = String(formData.get("email") || "");
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false },
    });
    const origin = process.env.NEXT_PUBLIC_SITE_URL;
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/reset/confirm`,
    });
    redirect("/login?msg=" + encodeURIComponent("Reset link sent. Check your email."));
  }

  // read query params for messages (server-side)
  const search = new URLSearchParams(typeof window === "undefined" ? "" : window.location.search);
  const err = search.get("err");
  const msg = search.get("msg");

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-semibold">Sign in</h1>

      {err && <p className="mt-3 text-sm text-red-500">{err}</p>}
      {msg && <p className="mt-3 text-sm text-green-500">{msg}</p>}

      <form action={signInAction} className="mt-4 space-y-3">
        <label className="block">
          <span className="text-sm text-gray-300">Email</span>
          <input
            name="email"
            type="email"
            className="mt-1 w-full rounded-lg border border-gray-600 bg-black p-2 text-white"
            placeholder="you@email.com"
            required
          />
        </label>

        <label className="block">
          <span className="text-sm text-gray-300">Password</span>
          <input
            name="password"
            type="password"
            className="mt-1 w-full rounded-lg border border-gray-600 bg-black p-2 text-white"
            placeholder="••••••••"
            required
          />
        </label>

        <button
          type="submit"
          className="mt-2 rounded-lg border border-gray-300 bg-white px-3 py-2 font-semibold"
        >
          Sign in
        </button>
      </form>

      <div className="mt-4 text-sm text-gray-400">
        <details>
          <summary className="cursor-pointer underline">Forgot password?</summary>
          <form action={sendResetAction} className="mt-3 space-y-2">
            <input
              name="email"
              type="email"
              className="w-full rounded-lg border border-gray-600 bg-black p-2 text-white"
              placeholder="you@email.com"
              required
            />
            <button
              type="submit"
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 font-semibold"
            >
              Send reset link
            </button>
          </form>
        </details>
        <span className="mx-2">•</span>
        <Link href="/create" className="underline">
          Create account
        </Link>
      </div>
    </main>
  );
}
