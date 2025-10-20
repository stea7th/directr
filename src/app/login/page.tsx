import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

function projectRefFromUrl(url: string) {
  const m = url.match(/^https?:\/\/([a-z0-9-]+)\.supabase\.co/i);
  return m?.[1] || null;
}

async function setAuthCookies(session: any) {
  "use server";
  if (!session) return;
  const jar = await cookies();
  const { access_token, refresh_token, expires_in, expires_at } = session;

  const now = Math.floor(Date.now() / 1000);
  const exp = typeof expires_at === "number" ? expires_at : now + (expires_in || 3600);
  const maxAge = Math.max(60, exp - now);

  // Generic cookies
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

  // Project-ref cookies (SSR compatibility)
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

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  async function signIn(formData: FormData) {
    "use server";
    const email = String(formData.get("email") || "");
    const password = String(formData.get("password") || "");

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false },
    });
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) redirect(`/login?err=${encodeURIComponent(error.message)}`);

    await setAuthCookies(data.session);
    redirect("/planner");
  }

  async function reset(formData: FormData) {
    "use server";
    const email = String(formData.get("email") || "");
    const origin = process.env.NEXT_PUBLIC_SITE_URL!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false },
    });
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/reset/confirm`,
    });
    redirect("/login?msg=Check your email for a reset link");
  }

  const params = (await searchParams) || {};
  const err = typeof params.err === "string" ? params.err : "";
  const msg = typeof params.msg === "string" ? params.msg : "";

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-semibold">Sign in</h1>
      {err && <p className="text-red-500 mt-2">{err}</p>}
      {msg && <p className="text-green-500 mt-2">{msg}</p>}

      <form action={signIn} className="mt-4 space-y-3">
        <input
          name="email"
          type="email"
          placeholder="you@email.com"
          required
          className="w-full rounded-lg border border-gray-600 bg-black p-2 text-white"
        />
        <input
          name="password"
          type="password"
          placeholder="••••••••"
          required
          className="w-full rounded-lg border border-gray-600 bg-black p-2 text-white"
        />
        <button
          type="submit"
          className="mt-2 rounded-lg border border-gray-300 bg-white px-3 py-2 font-semibold"
        >
          Sign in
        </button>
      </form>

      <details className="mt-4 text-sm text-gray-400">
        <summary className="cursor-pointer underline">Forgot password?</summary>
        <form action={reset} className="mt-3 space-y-2">
          <input
            name="email"
            type="email"
            placeholder="you@email.com"
            required
            className="w-full rounded-lg border border-gray-600 bg-black p-2 text-white"
          />
          <button
            type="submit"
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 font-semibold"
          >
            Send reset link
          </button>
        </form>
      </details>

      <div className="mt-4 text-sm text-gray-400">
        <Link href="/create" className="underline">
          Create account
        </Link>
      </div>
    </main>
  );
}
