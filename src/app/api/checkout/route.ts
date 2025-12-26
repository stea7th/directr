// src/app/api/checkout/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createRouteClient } from "@/lib/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-06-20",
});

export async function POST(req: Request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { success: false, error: "Missing STRIPE_SECRET_KEY" },
        { status: 500 }
      );
    }
    if (!process.env.NEXT_PUBLIC_SITE_URL) {
      return NextResponse.json(
        { success: false, error: "Missing NEXT_PUBLIC_SITE_URL" },
        { status: 500 }
      );
    }

    // ✅ Next 15: createRouteClient is async, MUST await
    const supabase = await createRouteClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Read body (optional). We’ll accept either { priceId } or { plan } etc.
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const priceId =
      body?.priceId ||
      body?.price_id ||
      process.env.STRIPE_PRICE_ID ||
      "";

    if (!priceId) {
      return NextResponse.json(
        { success: false, error: "Missing Stripe priceId (or STRIPE_PRICE_ID env)" },
        { status: 400 }
      );
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, "");
    const successUrl = `${siteUrl}/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${siteUrl}/cancel`;

    // If you store stripe customer id in Supabase, you can fetch it here.
    // For now we just create a checkout session tied to the authenticated email.
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: user.email || undefined,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
    });

    return NextResponse.json({
      success: true,
      url: session.url,
      id: session.id,
    });
  } catch (err: any) {
    console.error("Checkout error:", err);
    return NextResponse.json(
      { success: false, error: "Checkout failed", details: err?.message || String(err) },
      { status: 500 }
    );
  }
}
