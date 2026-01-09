// src/app/api/checkout/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const stripeSecret = process.env.STRIPE_SECRET_KEY || "";

const stripe = new Stripe(stripeSecret, {
  apiVersion: "2024-06-20",
});

export async function POST(req: Request) {
  try {
    if (!stripeSecret) {
      return NextResponse.json(
        { success: false, error: "stripe_key_missing", message: "Stripe is not configured." },
        { status: 500 }
      );
    }

    const supabase = await createServerClient();
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();

    if (userErr) {
      return NextResponse.json(
        { success: false, error: "auth_getUser_failed", message: userErr.message },
        { status: 500 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: "signin_required", message: "Please sign in first." },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const priceId = (body?.priceId as string | undefined) || "";

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
        { success: false, error: "site_url_missing", message: "Missing NEXT_PUBLIC_SITE_URL" },
        { status: 500 }
      );
    }

    // Send them back somewhere that *visibly* reflects upgrade
    const successUrl = `${siteUrl}/create?upgraded=1`;
    const cancelUrl = `${siteUrl}/pricing?canceled=1`;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: user.email ?? undefined,
      line_items: [{ price: priceId, quantity: 1 }],

      success_url: successUrl,
      cancel_url: cancelUrl,

      // ✅ easiest to debug in Stripe + webhook mapping
      client_reference_id: user.id,

      // ✅ keep this too (belt + suspenders)
      metadata: {
        user_id: user.id,
      },
    });

    return NextResponse.json({ success: true, url: session.url });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: "checkout_error", message: e?.message ?? "Checkout error" },
      { status: 500 }
    );
  }
}
