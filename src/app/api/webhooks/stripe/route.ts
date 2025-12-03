// src/app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY!;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

const stripe = new Stripe(stripeSecretKey, { apiVersion: "2024-06-20" });

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  if (!sig || !webhookSecret) {
    return new NextResponse("Missing signature or webhook secret", {
      status: 400,
    });
  }

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err: any) {
    console.error("Stripe webhook signature error:", err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.mode !== "subscription") break;

        const subId = session.subscription as string | undefined;
        const customerId = session.customer as string | undefined;
        const userId = session.metadata?.supabase_user_id as string | undefined;
        const tier = session.metadata?.tier as
          | "creator"
          | "studio"
          | "agency"
          | undefined;

        if (!subId || !customerId || !userId || !tier) break;

        const subscription = await stripe.subscriptions.retrieve(subId);

        const currentPeriodEnd = subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000).toISOString()
          : null;

        const { error } = await supabaseAdmin.from("profiles").upsert(
          {
            id: userId,
            stripe_customer_id: customerId,
            subscription_tier: tier,
            subscription_status: subscription.status,
            current_period_end: currentPeriodEnd,
          },
          { onConflict: "id" }
        );

        if (error) {
          console.error("Supabase upsert error (checkout.completed):", error);
        }

        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string | undefined;
        if (!customerId) break;

        const tier =
          (sub.items.data[0]?.price.metadata?.tier as
            | "creator"
            | "studio"
            | "agency"
            | undefined) ?? undefined;

        const currentPeriodEnd = sub.current_period_end
          ? new Date(sub.current_period_end * 1000).toISOString()
          : null;

        // Find user by stripe_customer_id
        const { data: profiles, error: lookupError } = await supabaseAdmin
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .limit(1);

        if (lookupError || !profiles || profiles.length === 0) break;

        const userId = profiles[0].id as string;

        const { error: updateError } = await supabaseAdmin
          .from("profiles")
          .update({
            subscription_status: sub.status,
            subscription_tier: tier ?? null,
            current_period_end: currentPeriodEnd,
          })
          .eq("id", userId);

        if (updateError) {
          console.error(
            "Supabase update error (subscription updated/deleted):",
            updateError
          );
        }

        break;
      }

      default:
        // Ignore the rest for now
        break;
    }

    return new NextResponse("ok", { status: 200 });
  } catch (err: any) {
    console.error("Unhandled webhook error:", err);
    return new NextResponse("Webhook handler error", { status: 500 });
  }
}
