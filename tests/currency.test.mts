import assert from "node:assert/strict";
import test from "node:test";
import { formatCurrency } from "../lib/currency.ts";

test("INR uses Indian grouping for full values", () => {
  assert.equal(formatCurrency(1_250_000, "INR"), "\u20B912,50,000");
});

test("INR compact values switch from lakh to crore", () => {
  assert.equal(formatCurrency(85_000, "INR", { compact: true }), "\u20B985,000");
  assert.equal(formatCurrency(2_500_000, "INR", { compact: true }), "\u20B925 lakh");
  assert.equal(formatCurrency(19_710_000, "INR", { compact: true }), "\u20B91.97 crore");
});
