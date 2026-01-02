import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-06-20",
});

function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE || "";

  if (!url || !key) throw new Error("Missing Supabase admin env vars");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function isActiveSubStatus(status: Stripe.Subscription.Status) {
  return status === "active" || status === "trialing";
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

    // -----------------------------
    // 1) UPGRADE: checkout complete
    // -----------------------------
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      const userId = (session.metadata?.user_id as string | undefined) || undefined;
      const stripeCustomerId =
        typeof session.customer === "string" ? session.customer : session.customer?.id || null;
      const stripeSubscriptionId =
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription?.id || null;

      // If metadata missing, don't retry forever (still respond 200)
      if (!userId) {
        return NextResponse.json({ success: false, error: "missing_user_id_in_metadata" }, { status: 200 });
      }

      // Upsert profile: DO NOT reset generations_used
      // Only touch fields that you actually need.
      const { error: upsertErr } = await admin
        .from("profiles")
        .upsert(
          {
            id: userId,
            is_pro: true,
            stripe_customer_id: stripeCustomerId,
            stripe_subscription_id: stripeSubscriptionId,
          },
          { onConflict: "id" }
        );

      if (upsertErr) {
        return NextResponse.json(
          { success: false, error: "profile_upsert_failed", details: upsertErr.message },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true });
    }

    // -------------------------------------------
    // 2) DOWNGRADE: subscription deleted/canceled
    // -------------------------------------------
    if (event.type === "customer.subscription.deleted") {
      const sub = event.data.object as Stripe.Subscription;

      const subId = sub.id;

      // Downgrade by subscription id (reliable)
      const { error } = await admin
        .from("profiles")
        .update({ is_pro: false })
        .eq("stripe_subscription_id", subId);

      if (error) {
        return NextResponse.json(
          { success: false, error: "downgrade_failed", details: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true });
    }

    // ----------------------------------------------------------
    // 3) DOWNGRADE/UPGRADE: subscription updated (status changes)
    // ----------------------------------------------------------
    if (event.type === "customer.subscription.updated") {
      const sub = event.data.object as Stripe.Subscription;

      const subId = sub.id;
      const shouldBePro = isActiveSubStatus(sub.status);

      const { error } = await admin
        .from("profiles")
        .update({ is_pro: shouldBePro })
        .eq("stripe_subscription_id", subId);

      if (error) {
        return NextResponse.json(
          { success: false, error: "sub_update_sync_failed", details: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true });
    }

    // --------------------------------
    // 4) DOWNGRADE: invoice payment fail
    // --------------------------------
    if (event.type === "invoice.payment_failed") {
      const invoice = event.data.object as Stripe.Invoice;

      const customerId =
        typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id || null;

      if (!customerId) return NextResponse.json({ success: true });

      const { error } = await admin
        .from("profiles")
        .update({ is_pro: false })
        .eq("stripe_customer_id", customerId);

      if (error) {
        return NextResponse.json(
          { success: false, error: "invoice_fail_downgrade_failed", details: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true });
    }

    // default
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "webhook_handler_failed", details: err?.message || String(err) },
      { status: 500 }
    );
  }
}
