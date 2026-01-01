import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-06-20",
});

function supabaseAdmin() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    "";

  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE ||
    "";

  if (!url || !key) throw new Error("Missing Supabase admin env vars");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

  if (!sig || !webhookSecret) {
    return NextResponse.json(
      { success: false, error: "missing_webhook_secret_or_signature" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    const rawBody = await req.text();
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "invalid_signature", details: err?.message || String(err) },
      { status: 400 }
    );
  }

  try {
    const admin = supabaseAdmin();

    // ✅ Upgrade on successful checkout
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      const userId =
        (session.metadata?.user_id as string | undefined) ||
        undefined;

      if (!userId) {
        return NextResponse.json(
          { success: false, error: "missing_user_id_in_metadata" },
          { status: 200 } // respond 200 so Stripe doesn't retry forever
        );
      }

      // Ensure profile row exists (without resetting counters)
      const { data: existing } = await admin
        .from("profiles")
        .select("id")
        .eq("id", userId)
        .maybeSingle();

      if (!existing) {
        await admin.from("profiles").insert({
          id: userId,
          is_pro: true,
          generations_used: 0,
        });
      } else {
        await admin
          .from("profiles")
          .update({
            is_pro: true,
          })
          .eq("id", userId);
      }

      return NextResponse.json({ success: true });
    }

    // ✅ Optional: Downgrade when subscription is canceled
    if (event.type === "customer.subscription.deleted") {
      const sub = event.data.object as Stripe.Subscription;

      // If you later store stripe_customer_id on profiles, you can map and downgrade accurately.
      // For now, we won't auto-downgrade because we don't have a guaranteed mapping here.
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "webhook_handler_failed", details: err?.message || String(err) },
      { status: 500 }
    );
  }
}
