import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

// Stripe instance (server-only)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-06-20",
});

// Supabase ADMIN client (service role — bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const body = await req.text();

    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // ✅ Payment completed
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const userId =
      session.metadata?.user_id ||
      session.client_reference_id ||
      null;

    if (!userId) {
      console.error("No user_id found on session");
      return NextResponse.json({ received: true });
    }

    // ✅ Flip user to PRO
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({
        is_pro: true,
      })
      .eq("id", userId);

    if (error) {
      console.error("Failed to update profile to pro:", error);
      return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
