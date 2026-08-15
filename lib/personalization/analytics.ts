export const MONETIZATION_EVENTS = ["opportunity_report_started", "opportunity_report_completed", "pro_feature_viewed", "alert_enabled", "career_switch_started", "salary_negotiation_started", "save_created", "upgrade_intent"] as const;
export type MonetizationEvent = typeof MONETIZATION_EVENTS[number];
type SafeValue = string | number | boolean | null;
const SAFE_KEYS = new Set(["feature", "route", "plan", "careerSlug", "countrySlug", "itemType", "result", "coverage"]);

export function sanitizeAnalyticsPayload(payload: Record<string, unknown> = {}): Record<string, SafeValue> {
  return Object.fromEntries(Object.entries(payload).filter(([key, value]) => SAFE_KEYS.has(key) && (value === null || ["string", "number", "boolean"].includes(typeof value)))) as Record<string, SafeValue>;
}

export function trackMonetizationEvent(event: MonetizationEvent, payload: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("sekur:monetization", { detail: { event, payload: sanitizeAnalyticsPayload(payload), occurredAt: new Date().toISOString() } }));
}
