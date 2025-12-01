// src/app/api/checkout/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  console.warn(
    "⚠️ STRIPE_SECRET_KEY is not set. /api/checkout will return 500 until you add it."
  );
}

const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey)
  : (null as unknown as Stripe);

export async function POST(request: Request) {
  try {
    if (!stripeSecretKey || !stripe) {
      return NextResponse.json(
        { error: "Stripe not configured on server." },
        { status: 500 }
      );
    }

    const { priceId } = await request.json();

    if (!priceId || typeof priceId !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid priceId." },
        { status: 400 }
      );
    }

    const origin = new URL(request.url).origin;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${origin}/create?checkout=success`,
      cancel_url: `${origin}/pricing?checkout=cancelled`,
      billing_address_collection: "auto",
      allow_promotion_codes: true,
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "No checkout URL returned from Stripe." },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (err: any) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json(
      { error: err?.message || "Unexpected server error." },
      { status: 500 }
    );
  }
}
