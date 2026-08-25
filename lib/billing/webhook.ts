import { subscriptionGrantsPro } from "./entitlement.ts";
import type { SubscriptionState, SubscriptionStatus } from "./types.ts";

export type StripeEvent = { id: string; type: string; created: number; data: { object: Record<string, unknown> } };
const stringValue = (value: unknown) => typeof value === "string" ? value : null;
const timestamp = (value: unknown) => typeof value === "number" && Number.isFinite(value) ? new Date(value * 1000).toISOString() : null;
const uuid = (value: string | null) => value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value) ? value : null;
export function subscriptionUpdateFromStripeEvent(event: StripeEvent): SubscriptionState | null {
  const object = event.data.object; const metadata = typeof object.metadata === "object" && object.metadata ? object.metadata as Record<string, unknown> : {}; const userId = uuid(stringValue(metadata.user_id) ?? stringValue(object.client_reference_id)); if (!userId || !Number.isSafeInteger(event.created) || event.created <= 0) return null;
  // Checkout completion is acknowledged and deduplicated, but subscription
  // lifecycle events are the only authority for paid entitlement state. This
  // prevents out-of-order checkout delivery from downgrading an active plan.
  if (event.type === "checkout.session.completed") return null;
  if (!event.type.startsWith("customer.subscription.")) return null;
  const rawStatus = event.type === "customer.subscription.deleted" ? "canceled" : stringValue(object.status) ?? "inactive"; const allowed = new Set(["inactive", "trialing", "active", "past_due", "canceled", "unpaid", "incomplete", "incomplete_expired", "paused"]); const status = (allowed.has(rawStatus) ? rawStatus : "inactive") as SubscriptionStatus;
  const stripeCustomerId = stringValue(object.customer); const stripeSubscriptionId = stringValue(object.id); if (!stripeCustomerId || !stripeSubscriptionId) return null;
  return { userId, plan: subscriptionGrantsPro(status) ? "pro" : "free", status, stripeCustomerId, stripeSubscriptionId, currentPeriodEnd: timestamp(object.current_period_end), cancelAtPeriodEnd: object.cancel_at_period_end === true, stripeEventId: event.id, stripeEventCreated: event.created };
}
