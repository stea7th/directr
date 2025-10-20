import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(req: Request) {
  const { access_token, refresh_token } = await req.json();

  // Prepare a response we can attach cookies to
  const res = NextResponse.json({ ok: true });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      get(name: string) {
        // no-op for this exchange
        return undefined as any;
      },
      set(name: string, value: string, options: any) {
        res.cookies.set(name, value, options);
      },
      remove(name: string, options: any) {
        res.cookies.set(name, "", { ...options, maxAge: 0 });
      },
    },
  });

  // Write the auth cookies on the server
  await supabase.auth.setSession({ access_token, refresh_token });

  return res;
}
