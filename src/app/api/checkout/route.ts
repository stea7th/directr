// src/app/api/checkout/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs"; // ensure Node runtime for Stripe

// Make sure STRIPE_SECRET_KEY is set in Vercel env
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  console.warn(
    "⚠️ STRIPE_SECRET_KEY is not set. Checkout route will return 500 until you add it in Vercel env."
  );
}

const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: "2024-06-20",
    })
  : null;

export async function POST(req: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json(
        { error: "Stripe not configured on server." },
        { status: 500 }
      );
    }

    const body = (await req.json()) as { priceId?: string };

    const priceId = body.priceId?.trim();
    if (!priceId) {
      return NextResponse.json(
        { error: "Missing priceId in request body." },
        { status: 400 }
      );
    }

    const successUrl =
      process.env.STRIPE_SUCCESS_URL ||
      "https://directr.so/pricing?checkout=success";
    const cancelUrl =
      process.env.STRIPE_CANCEL_URL ||
      "https://directr.so/pricing?checkout=cancelled";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      // You can also attach metadata / customer email later
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Stripe did not return a checkout URL." },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (err: any) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error." },
      { status: 500 }
    );
  }
}
