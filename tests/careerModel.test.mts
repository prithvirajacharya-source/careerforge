import assert from "node:assert/strict";
import test from "node:test";
import { hasCompleteSalaryRange, researchPendingSalary } from "../lib/careerModel.ts";

test("a salary range is renderable only when low, typical, high and currency exist", () => {
  assert.equal(hasCompleteSalaryRange(researchPendingSalary()), false);
  assert.equal(
    hasCompleteSalaryRange({
      low: 55_000,
      typical: 78_000,
      high: 105_000,
      sourceCurrency: "USD",
      geography: "Test geography",
      sourceName: "Test source",
      sourceUrl: "https://example.com",
      observationDate: "2026-01-01",
      methodology: "Test fixture only",
      verificationStatus: "verified",
    }),
    true
  );
});
