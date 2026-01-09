// src/app/api/checkout/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-06-20",
});

export async function POST(req: Request) {
  try {
    const supabase = await createServerClient();

    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();

    // ✅ Treat missing/invalid session as "please sign in"
    if (userErr || !user) {
      return NextResponse.json(
        { success: false, error: "signin_required", message: "Please sign in first." },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const priceId = (body as any)?.priceId as string | undefined;

    if (!priceId) {
      return NextResponse.json(
        { success: false, error: "missing_priceId", message: "Missing priceId" },
        { status: 400 }
      );
    }

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");

    if (!siteUrl) {
      return NextResponse.json(
        { success: false, error: "missing_site_url", message: "Missing NEXT_PUBLIC_SITE_URL" },
        { status: 500 }
      );
    }

    // ✅ include user_id so webhook upgrades the right profile
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: user.email ?? undefined,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${siteUrl}/pricing?success=1`,
      cancel_url: `${siteUrl}/pricing?canceled=1`,
      metadata: { user_id: user.id },
    });

    if (!session.url) {
      return NextResponse.json(
        { success: false, error: "no_session_url", message: "Stripe did not return a checkout URL." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, url: session.url });
  } catch (e: any) {
    // ✅ If Supabase ever throws "Auth session missing" (or similar), convert to 401
    const msg = e?.message || String(e);
    const lower = msg.toLowerCase();

    if (lower.includes("auth session missing") || lower.includes("jwt") || lower.includes("session")) {
      return NextResponse.json(
        { success: false, error: "signin_required", message: "Please sign in first." },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: "checkout_error", message: msg },
      { status: 500 }
    );
  }
}
