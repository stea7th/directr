// src/app/api/checkout/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-06-20",
});

export async function POST(req: Request) {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "signin_required", message: "Please sign in first." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const priceId = body?.priceId as string | undefined;

    if (!priceId) {
      return NextResponse.json({ success: false, error: "Missing priceId" }, { status: 400 });
    }

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");

    if (!siteUrl) {
      return NextResponse.json(
        { success: false, error: "Missing NEXT_PUBLIC_SITE_URL" },
        { status: 500 }
      );
    }

    // IMPORTANT: include user_id so webhook can upgrade the right user
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: user.email ?? undefined,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${siteUrl}/pricing?success=1`,
      cancel_url: `${siteUrl}/pricing?canceled=1`,
      metadata: {
        user_id: user.id,
      },
    });

    return NextResponse.json({ success: true, url: session.url });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e?.message ?? "Checkout error" },
      { status: 500 }
    );
  }
}
