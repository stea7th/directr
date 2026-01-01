import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const priceId = (body?.priceId as string | undefined) || process.env.NEXT_PUBLIC_STRIPE_PRICE_ID || "";

    if (!priceId) {
      return NextResponse.json(
        { success: false, error: "Missing priceId (set NEXT_PUBLIC_STRIPE_PRICE_ID or send in body)" },
        { status: 400 }
      );
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://directr.so";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: user.email ?? undefined,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${siteUrl}/create?upgraded=1`,
      cancel_url: `${siteUrl}/create?canceled=1`,

      // ✅ THIS is the key: webhook uses this to upgrade the exact user
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
