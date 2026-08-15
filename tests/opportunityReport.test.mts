import test from "node:test";
import assert from "node:assert/strict";
import { generateOpportunityReport, opportunityRankLabel } from "../lib/personalization/report.ts";
import { getCareerCountryProfiles } from "../lib/careerCountryProfiles.ts";
import type { CareerProfile } from "../lib/careerModel.ts";

const career = { slug: "mechanical-engineer", aiRisk: "Low", remote: "Medium" } as CareerProfile;
const baseProfile = { currentCountry: "sweden", targetCountries: ["sweden", "united-states"], currentCareer: career.slug, yearsExperience: 5, educationLevel: "Bachelor's degree", skills: [], desiredSalary: 600000, desiredSalaryCurrency: "SEK", remotePreference: "required" as const, relocationWillingness: "yes" as const, careerGoals: null };

test("opportunity report uses existing evidence and preserves missing data", () => {
  const report = generateOpportunityReport(baseProfile, career, getCareerCountryProfiles(career.slug));
  assert.equal(report.methodologyVersion, "opportunity-ranking-v1");
  assert.equal(report.markets.length, 2);
  const sweden = report.markets.find(market => market.countrySlug === "sweden")!;
  const us = report.markets.find(market => market.countrySlug === "united-states")!;
  assert.equal(sweden.salary.sourceCurrency, "SEK");
  assert.equal(sweden.ranking.coverage, 50);
  assert.deepEqual(sweden.factorBreakdown, { salary: 100, aiRisk: 85, remote: 50 });
  assert.equal(us.ranking.coverage, 20);
  assert.equal(us.ranking.score, null);
  assert.match(us.limitations.join(" "), /different currencies/);
});

test("insufficient markets never receive a numeric rank", () => {
  const report = generateOpportunityReport(baseProfile, career, getCareerCountryProfiles(career.slug));
  const validIndex = report.markets.findIndex(market => market.ranking.score !== null);
  const insufficientIndex = report.markets.findIndex(market => market.ranking.score === null);
  assert.match(opportunityRankLabel(report.markets, validIndex), /^#1 ranked market$/);
  assert.equal(opportunityRankLabel(report.markets, insufficientIndex), "Insufficient evidence for ranking");
});

test("missing target evidence produces no fabricated market", () => {
  const report = generateOpportunityReport({ ...baseProfile, targetCountries: ["canada"] }, career, getCareerCountryProfiles(career.slug));
  assert.deepEqual(report.markets, []);
  assert.match(report.disclaimer, /not immigration/);
});
