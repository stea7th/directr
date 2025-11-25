// src/app/api/checkout/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

// Log once on boot so you know if env is missing
if (!stripeSecretKey) {
  console.error(
    "❌ STRIPE_SECRET_KEY is not set. Add it in Vercel → Settings → Environment Variables."
  );
}

const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: "2024-06-20" as any,
    })
  : null;

export async function POST(req: Request) {
  try {
    if (!stripe) {
      return NextResponse.json(
        { error: "Server is missing STRIPE_SECRET_KEY." },
        { status: 500 }
      );
    }

    const body = await req.json().catch(() => ({} as any));
    const priceId = body?.priceId as string | undefined;

    if (!priceId) {
      return NextResponse.json(
        { error: "No priceId provided in request body." },
        { status: 400 }
      );
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ?? "https://directr-beta.vercel.app";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/create?checkout=success`,
      cancel_url: `${baseUrl}/pricing?checkout=cancelled`,
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Stripe did not return a checkout URL." },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (err: any) {
    console.error("❌ Checkout error:", err);
    return NextResponse.json(
      {
        error: err?.message || "Unknown server error while starting checkout.",
      },
      { status: 500 }
    );
  }
}
