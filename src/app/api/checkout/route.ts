// src/app/api/checkout/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createRouteClient } from "@/lib/supabase/server";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, { apiVersion: "2024-06-20" })
  : (null as unknown as Stripe);

// LIVE price IDs you gave me
const CREATOR_PRICE_ID = "price_1SVlPD99HXHuQZvrq5b2KMgw";
const STUDIO_PRICE_ID  = "price_1SVlPZ99HXHuQZvr3b792wls";
const AGENCY_PRICE_ID  = "price_1SVlPw99HXHuQZvrnxMQPMC8";

function tierFromPrice(priceId: string): "creator" | "studio" | "agency" {
  if (priceId === CREATOR_PRICE_ID) return "creator";
  if (priceId === STUDIO_PRICE_ID) return "studio";
  return "agency";
}

export async function POST(req: NextRequest) {
  try {
    if (!stripe) {
      console.error("STRIPE_SECRET_KEY missing");
      return NextResponse.json(
        { error: "Stripe not configured" },
        { status: 500 }
      );
    }

    const { priceId } = await req.json();

    if (!priceId) {
      return NextResponse.json(
        { error: "Missing priceId" },
        { status: 400 }
      );
    }

   const supabase = createRouteClient();
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

    // Get or create profile row
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, stripe_customer_id")
      .eq("id", user.id)
      .maybeSingle();

    let customerId = profile?.stripe_customer_id ?? undefined;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email ?? undefined,
      });
      customerId = customer.id;

      const { error: upsertError } = await supabase
        .from("profiles")
        .upsert(
          {
            id: user.id,
            stripe_customer_id: customerId,
          },
          { onConflict: "id" }
        );

      if (upsertError) {
        console.error("Error upserting profile:", upsertError);
      }
    }

    const origin =
      req.headers.get("origin") ??
      process.env.NEXT_PUBLIC_SITE_URL ??
      "http://localhost:3000";

    const tier = tierFromPrice(priceId);

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing?canceled=1`,
      metadata: {
        supabase_user_id: user.id,
        tier,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Checkout error:", err);
    return NextResponse.json(
      { error: "Checkout failed" },
      { status: 500 }
    );
  }
}
