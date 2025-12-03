// src/app/api/checkout/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createRouteClient } from "@/lib/supabase/server";

// Read the secret key from env
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

// Create Stripe client only if key exists
let stripe: Stripe | null = null;
if (stripeSecretKey) {
  stripe = new Stripe(stripeSecretKey, {
    apiVersion: "2024-06-20",
  });
} else {
  console.error("STRIPE_SECRET_KEY is not set at build time");
}

export async function POST(req: Request) {
  try {
    // If there is still no key at runtime, bail
    if (!stripe) {
      console.error("Checkout error: STRIPE_SECRET_KEY missing");
      return NextResponse.json(
        { error: "Server misconfigured – Stripe key missing." },
        { status: 500 }
      );
    }

    // Make sure user is signed in
    const supabase = await createRouteClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Not signed in" },
        { status: 401 }
      );
    }

    // Read priceId from the request body
    const body = await req.json();
    const priceId = body?.priceId as string | undefined;

    if (!priceId) {
      return NextResponse.json(
        { error: "Missing priceId" },
        { status: 400 }
      );
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ?? "https://directr-beta.vercel.app";

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/create?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/pricing`,
      customer_email: user.email ?? undefined,
    });

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (err: any) {
    console.error("Checkout error:", err);
    return NextResponse.json(
      { error: "Something went wrong starting checkout." },
      { status: 500 }
    );
  }
}
