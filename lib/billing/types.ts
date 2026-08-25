export type SubscriptionPlan = "free" | "pro";
export type SubscriptionStatus = "inactive" | "trialing" | "active" | "past_due" | "canceled" | "unpaid" | "incomplete" | "incomplete_expired" | "paused";
export type SubscriptionState = { userId: string; plan: SubscriptionPlan; status: SubscriptionStatus; stripeCustomerId: string; stripeSubscriptionId: string; currentPeriodEnd: string | null; cancelAtPeriodEnd: boolean; stripeEventId: string; stripeEventCreated: number };
