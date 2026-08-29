import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

test("public product surfaces define accessible semantic contrast states", () => {
  const css = read("../app/globals.css");

  assert.match(css, /--sekur-warning:#78350f/);
  assert.match(css, /--sekur-success:#166534/);
  assert.match(css, /--sekur-danger:#7f1d1d/);
  assert.match(css, /--sekur-info:#1e3a8a/);
  assert.match(css, /\.product-button-primary\{[^}]*color:#fff!important/);
  assert.match(css, /\.product-button:disabled\{[^}]*color:#475569!important;opacity:1/);
});

test("critical public actions do not use legacy translucent dark controls", () => {
  const saveControl = read("../components/user/SaveIntelligenceControl.tsx");
  const billingActions = read("../components/billing/BillingActions.tsx");
  const authGate = read("../components/user/UserSessionGate.tsx");

  for (const source of [saveControl, billingActions, authGate]) {
    assert.doesNotMatch(source, /bg-black\/1[05]/);
    assert.doesNotMatch(source, /text-amber-100/);
  }
  assert.match(saveControl, /product-button-secondary/);
  assert.match(billingActions, /product-button-primary/);
  assert.match(authGate, /bg-amber-50/);
});

test("unsupported career markets retain honest coverage copy and a clear next step", () => {
  const careerPage = read("../app/careers/[slug]/page.tsx");

  assert.match(careerPage, /SEKUR will not substitute another country/);
  assert.match(careerPage, /Explore opportunities with verified data/);
  assert.match(careerPage, /border-amber-300 bg-amber-50[^\n]+text-amber-900/);
});
