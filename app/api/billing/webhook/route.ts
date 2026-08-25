import { NextResponse } from "next/server";
import { getBillingConfig } from "@/lib/billing/config";
import { verifyStripeSignature } from "@/lib/billing/stripe";
import { subscriptionUpdateFromStripeEvent, type StripeEvent } from "@/lib/billing/webhook";
import { createServiceRoleClient } from "@/lib/supabaseServer";

export async function POST(request: Request) {
  const payload = await request.text(); const config = getBillingConfig();
  if (!verifyStripeSignature(payload, request.headers.get("stripe-signature"), config.webhookSecret)) return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
  let event: StripeEvent; try { event = JSON.parse(payload) as StripeEvent; } catch { return NextResponse.json({ error: "Invalid webhook payload." }, { status: 400 }); }
  if (typeof event.id !== "string" || !event.id || event.id.length > 255 || typeof event.type !== "string" || !event.type || event.type.length > 255 || !Number.isSafeInteger(event.created) || event.created <= 0 || !event.data || typeof event.data.object !== "object" || event.data.object === null || Array.isArray(event.data.object)) return NextResponse.json({ error: "Invalid webhook event." }, { status: 400 });
  let service; try { service = createServiceRoleClient(); } catch { return NextResponse.json({ error: "Trusted billing persistence is not configured." }, { status: 503 }); }
  const { error: claimError } = await service.from("billing_webhook_events").insert({ event_id: event.id, event_type: event.type, event_created: event.created, status: "processing" });
  if (claimError?.code === "23505") {
    const { data: reclaimed, error: reclaimError } = await service.from("billing_webhook_events").update({ status: "processing" }).eq("event_id", event.id).eq("status", "failed").select("event_id").maybeSingle();
    if (reclaimError) return NextResponse.json({ error: "Webhook event could not be reclaimed." }, { status: 503 });
    if (!reclaimed) return NextResponse.json({ received: true, duplicate: true });
  }
  if (claimError && claimError.code !== "23505") return NextResponse.json({ error: "Webhook event could not be claimed." }, { status: 503 });
  try {
    const update = subscriptionUpdateFromStripeEvent(event);
    if (update) {
      const { error: subscriptionError } = await service.rpc("apply_billing_subscription_event", { p_user_id: update.userId, p_status: update.status, p_stripe_customer_id: update.stripeCustomerId, p_stripe_subscription_id: update.stripeSubscriptionId, p_current_period_end: update.currentPeriodEnd, p_cancel_at_period_end: update.cancelAtPeriodEnd, p_stripe_event_id: update.stripeEventId, p_stripe_event_created: update.stripeEventCreated });
      if (subscriptionError) throw subscriptionError;
    }
    await service.from("billing_webhook_events").update({ status: "processed", processed_at: new Date().toISOString() }).eq("event_id", event.id);
    return NextResponse.json({ received: true });
  } catch {
    await service.from("billing_webhook_events").update({ status: "failed" }).eq("event_id", event.id);
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }
}
