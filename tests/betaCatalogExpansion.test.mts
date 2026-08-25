import assert from "node:assert/strict";
import test from "node:test";
import { CAREER_CATALOG, CAREER_CATEGORIES } from "../lib/careerCatalog.ts";
import { COUNTRY_CATALOG } from "../lib/countryCatalog.ts";
import { careerMarketEligibility, publicCoverageMessage } from "../lib/careerEvidenceEligibility.ts";
import { getCareerCountryProfile } from "../lib/careerCountryProfiles.ts";
import { CAREER_RESEARCH_TARGETS, PRIORITY_CAREER_MAPPINGS, getCareerResearchTarget } from "../lib/careerResearch/registry.ts";
import { isCareerResearchPublishingSupported } from "../lib/careerResearch/publishing.ts";

test("beta catalogs expose exactly 44 careers in ten categories and 29 countries", () => {
  assert.equal(CAREER_CATALOG.length, 44);
  assert.equal(new Set(CAREER_CATALOG.map((career) => career.slug)).size, 44);
  assert.equal(CAREER_CATEGORIES.length, 10);
  assert.deepEqual(new Set(CAREER_CATALOG.map((career) => career.category)), new Set(CAREER_CATEGORIES));
  assert.equal(COUNTRY_CATALOG.length, 29);
  assert.equal(new Set(COUNTRY_CATALOG.map((country) => country.slug)).size, 29);
  assert.equal(COUNTRY_CATALOG.some((country) => country.name === "South America"), false);
});

test("difficult careers remain discoverable without acquiring evidence or ranking eligibility", () => {
  for (const slug of ["doctor", "cloud-devops-engineer", "business-analyst", "logistics-coordinator", "project-manager", "university-lecturer", "warehouse-worker"]) {
    assert.equal(CAREER_CATALOG.find((career) => career.slug === slug)?.catalogAvailable, true);
    const eligibility = careerMarketEligibility(slug, "germany", null);
    assert.deepEqual(eligibility, { catalogAvailable: true, evidenceAvailable: false, rankEligible: false, publishable: false, coverage: "discoverable" });
    assert.equal(publicCoverageMessage(eligibility.coverage), "We're still expanding data for this opportunity.");
  }
});

test("validated priority mappings add 136 targets without weak ambiguous mappings", () => {
  assert.equal(PRIORITY_CAREER_MAPPINGS.length, 20);
  assert.equal(CAREER_RESEARCH_TARGETS.length, 178);
  assert.equal(getCareerResearchTarget("construction-manager", "sweden"), null);
  assert.equal(getCareerResearchTarget("physiotherapist", "finland"), null);
  assert.equal(getCareerResearchTarget("chemical-engineer", "united-kingdom"), null);
  assert.equal(getCareerResearchTarget("industrial-engineer", "united-kingdom"), null);
  assert.equal(getCareerResearchTarget("plumber", "sweden")?.occupationCode, "7125");
  assert.equal(getCareerResearchTarget("pharmacist", "sweden")?.occupationCode, "2281");
  assert.equal(getCareerResearchTarget("architect", "canada")?.occupationCode, "NOC_21200");
  assert.equal(getCareerResearchTarget("architect", "united-kingdom")?.occupationCode, "2451");
});

test("new research mappings cannot silently become publishable or mutate existing live evidence", () => {
  const before = JSON.stringify(getCareerCountryProfile("mechanical-engineer", "sweden"));
  assert.equal(isCareerResearchPublishingSupported("mechanical-engineer", "sweden"), true);
  assert.equal(isCareerResearchPublishingSupported("civil-engineer", "sweden"), false);
  assert.equal(isCareerResearchPublishingSupported("civil-engineer", "united-states"), false);
  assert.equal(getCareerCountryProfile("civil-engineer", "sweden"), null);
  assert.equal(JSON.stringify(getCareerCountryProfile("mechanical-engineer", "sweden")), before);
});

test("verified, limited and discoverable coverage remain separate from catalog availability", () => {
  const verifiedProfile = getCareerCountryProfile("mechanical-engineer", "united-states")!;
  const limitedProfile = getCareerCountryProfile("accountant", "sweden")!;
  const verified = careerMarketEligibility("mechanical-engineer", "united-states", verifiedProfile, true);
  const limited = careerMarketEligibility("accountant", "sweden", limitedProfile, true);
  assert.equal(verified.catalogAvailable, true);
  assert.equal(verified.evidenceAvailable, true);
  assert.equal(verified.rankEligible, true);
  assert.equal(verified.publishable, true);
  assert.equal(limited.evidenceAvailable, true);
  assert.equal(limited.rankEligible, false);
  assert.equal(limited.coverage, "limited");
});
