// src/app/api/checkout/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createRouteClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const { priceId } = await request.json();

    if (!priceId) {
      console.error("Checkout error: missing priceId");
      return NextResponse.json(
        { error: "Missing priceId" },
        { status: 400 }
      );
    }

    const supabase = await createRouteClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("Checkout error: not signed in", authError);
      return NextResponse.json(
        { error: "Not signed in" },
        { status: 401 }
      );
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      console.error("Checkout error: STRIPE_SECRET_KEY missing");
      return NextResponse.json(
        { error: "Stripe not configured" },
        { status: 500 }
      );
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2024-06-20",
    });

    // Use the current request URL as base (no NEXT_PUBLIC_SITE_URL needed)
    const url = new URL(request.url);
    const baseUrl = url.origin;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: user.email ?? undefined,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/pricing?success=1`,
      cancel_url: `${baseUrl}/pricing?cancelled=1`,
    });

    if (!session.url) {
      console.error("Checkout error: no session URL returned");
      return NextResponse.json(
        { error: "Failed to create checkout session" },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Checkout error (exception):", err);
    return NextResponse.json(
      { error: "Checkout failed" },
      { status: 500 }
    );
  }
}
