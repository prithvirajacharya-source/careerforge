import test from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { readFileSync } from "node:fs";
import { getBillingConfig } from "../lib/billing/config.ts";
import { createCheckoutSession, isStripeHostedUrl, verifyStripeSignature } from "../lib/billing/stripe.ts";
import { subscriptionUpdateFromStripeEvent } from "../lib/billing/webhook.ts";
import { resolveEntitlements } from "../lib/personalization/entitlements.ts";

test("billing safely reports an unconfigured environment", () => { const previous = process.env.STRIPE_SECRET_KEY; delete process.env.STRIPE_SECRET_KEY; assert.equal(getBillingConfig().configured, false); if (previous) process.env.STRIPE_SECRET_KEY = previous; });
test("checkout requires configured price and keeps the secret server-side", async () => { assert.throws(() => createCheckoutSession({ configured: false, secretKey: null, webhookSecret: null, proPriceId: null, appUrl: "http://localhost" }, { userId: "u", email: null, customerId: null })); let authorization = ""; const fetcher = (async (_url: string | URL | Request, init?: RequestInit) => { authorization = new Headers(init?.headers).get("authorization") ?? ""; return new Response(JSON.stringify({ id: "cs_1", url: "https://checkout.stripe.com/x" }), { status: 200 }); }) as typeof fetch; const session = await createCheckoutSession({ configured: true, secretKey: "sk_test_local", webhookSecret: "whsec_local", proPriceId: "price_local", appUrl: "http://localhost" }, { userId: "u", email: "u@example.com", customerId: null }, fetcher); assert.equal(session.id, "cs_1"); assert.equal(authorization, "Bearer sk_test_local"); });
test("billing redirects accept only Stripe-hosted HTTPS destinations", () => { assert.equal(isStripeHostedUrl("https://checkout.stripe.com/c/pay/test"), true); assert.equal(isStripeHostedUrl("https://billing.stripe.com/p/session/test"), true); assert.equal(isStripeHostedUrl("https://stripe.com.evil.example/test"), false); assert.equal(isStripeHostedUrl("javascript:alert(1)"), false); });
test("webhook signatures reject tampering and expired events", () => { const payload = '{"id":"evt_1"}'; const timestamp = 1000; const signature = createHmac("sha256", "secret").update(`${timestamp}.${payload}`).digest("hex"); const header = `t=${timestamp},v1=${signature}`; assert.equal(verifyStripeSignature(payload, header, "secret", timestamp), true); assert.equal(verifyStripeSignature(`${payload}x`, header, "secret", timestamp), false); assert.equal(verifyStripeSignature(payload, header, "secret", timestamp + 301), false); });
test("subscription events grant and revoke Pro deterministically", () => {
  const active = subscriptionUpdateFromStripeEvent({
    id: "evt_1",
    type: "customer.subscription.updated",
    created: 2_000_000_000,
    data: { object: { id: "sub_1", customer: "cus_1", status: "active", metadata: { user_id: "11111111-1111-4111-8111-111111111111" }, current_period_end: 2_000_000_000 } },
  });
  const canceled = subscriptionUpdateFromStripeEvent({
    id: "evt_2",
    type: "customer.subscription.deleted",
    created: 2_000_000_100,
    data: { object: { id: "sub_1", customer: "cus_1", metadata: { user_id: "11111111-1111-4111-8111-111111111111" } } },
  });
  assert.equal(active?.plan, "pro");
  assert.equal(resolveEntitlements(active?.plan).advancedReport, true);
  assert.deepEqual([canceled?.plan, canceled?.status], ["free", "canceled"]);
});
test("all non-active Stripe states fail closed", () => {
  for (const status of ["past_due", "unpaid", "canceled", "incomplete", "incomplete_expired", "paused"] as const) {
    const update = subscriptionUpdateFromStripeEvent({ id: `evt_${status}`, type: "customer.subscription.updated", created: 2_000_000_000, data: { object: { id: "sub_1", customer: "cus_1", status, metadata: { user_id: "11111111-1111-4111-8111-111111111111" } } } });
    assert.deepEqual([update?.status, update?.plan], [status, "free"]);
  }
});
test("malformed user association cannot grant Pro", () => {
  const update = subscriptionUpdateFromStripeEvent({ id: "evt_bad", type: "customer.subscription.updated", created: 2_000_000_000, data: { object: { id: "sub_1", customer: "cus_1", status: "active", metadata: { user_id: "another-user" } } } });
  assert.equal(update, null);
});
test("checkout completion cannot overwrite authoritative subscription state", () => { assert.equal(subscriptionUpdateFromStripeEvent({ id: "evt_checkout", type: "checkout.session.completed", created: 2_000_000_000, data: { object: { client_reference_id: "11111111-1111-4111-8111-111111111111", customer: "cus_1", subscription: "sub_1" } } }), null); });
test("paid APIs enforce identity and entitlement server-side and webhooks are idempotent", () => { const reportRoute = readFileSync("app/api/opportunities/recommend/route.ts", "utf8"); const watchRoute = readFileSync("app/api/opportunity-watches/route.ts", "utf8"); const webhookRoute = readFileSync("app/api/billing/webhook/route.ts", "utf8"); assert.match(reportRoute, /authenticateRequest/); assert.match(reportRoute, /advancedReport/); assert.match(reportRoute, /accessLevel: "preview"/); assert.match(watchRoute, /opportunityMonitoring/); assert.match(watchRoute, /user_id", auth\.user\.id/); assert.match(webhookRoute, /stripe-signature/); assert.match(webhookRoute, /23505/); assert.match(webhookRoute, /status", "failed"/); assert.match(webhookRoute, /apply_billing_subscription_event/); assert.match(webhookRoute, /createServiceRoleClient/); });
test("personalized Job Match follows the centralized Pro entitlement", () => { const client = readFileSync("components/jobs/JobsSearchClient.tsx", "utf8"); assert.match(client, /resolveEntitlements/); assert.match(client, /personalizedJobMatch/); assert.match(client, /!entitlementResult\.error/); });
test("migration atomically rejects stale billing state and limits RPC execution", () => { const sql = readFileSync("supabase/migrations/20260825090000_phase2_intelligence_billing.sql", "utf8"); assert.match(sql, /security invoker/i); assert.match(sql, /excluded\.stripe_event_created > public\.user_subscriptions\.stripe_event_created/); assert.match(sql, /effective_plan := case when p_status in \('active', 'trialing'\)/); assert.match(sql, /revoke all on function .* from public, anon, authenticated/i); assert.match(sql, /grant execute on function .* to service_role/i); });
