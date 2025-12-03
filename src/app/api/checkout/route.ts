import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createRouteClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const { priceId } = await request.json();
    if (!priceId) {
      return NextResponse.json({ error: "Missing priceId" }, { status: 400 });
    }

    const supabase = await createRouteClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Not signed in" },
        { status: 401 }
      );
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY!;
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2024-06-20",
    });

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: user.email!,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing?success=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing?cancelled=1`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json(
      { error: "Checkout failed" },
      { status: 500 }
    );
  }
}
