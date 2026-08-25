import type { SubscriptionStatus } from "./types.ts";
export const subscriptionGrantsPro = (status: SubscriptionStatus | string | null | undefined) => status === "active" || status === "trialing";
