import assert from "node:assert/strict";
import test from "node:test";
import {
  CAREER_RESEARCH_TARGETS,
  getCareerResearchTarget,
  isCareerResearchSupported,
} from "../lib/careerResearch/registry.ts";
import { normalizeScbSalaryResponse } from "../lib/careerResearch/scb.ts";
import { validateCareerResearchCandidate } from "../lib/careerResearch/model.ts";
import { careerCountryProfiles } from "../lib/careerCountryProfiles.ts";

const target = getCareerResearchTarget("mechanical-engineer", "sweden")!;
const researchedAt = "2026-08-10T12:00:00.000Z";
const fixture = {
  id: ["Sektor", "Yrke2012", "Kon", "ContentsCode", "Tid"],
  size: [1, 1, 1, 3, 1],
  dimension: {
    Yrke2012: { category: { index: { "2144": 0 }, label: { "2144": "Civilingenjörsyrken inom maskinteknik" } } },
    ContentsCode: { category: { index: { "000007CE": 0, "000007CF": 1, "000007CI": 2 } } },
    Tid: { category: { index: { "2025": 0 } } },
  },
  value: [51_800, 40_200, 69_900],
};

test("registry retains all seven existing Swedish SCB targets", () => {
  const swedenTargets = CAREER_RESEARCH_TARGETS.filter((item) => item.countrySlug === "sweden");
  assert.equal(CAREER_RESEARCH_TARGETS.length, 24);
  assert.equal(swedenTargets.length, 7);
  assert.equal(target.careerSlug, "mechanical-engineer");
  assert.equal(target.countrySlug, "sweden");
  assert.deepEqual(
    swedenTargets.map((item) => [item.careerSlug, item.countrySlug, item.occupationCode]),
    [
      ["mechanical-engineer", "sweden", "2144"],
      ["cybersecurity-analyst", "sweden", "2516"],
      ["software-engineer", "sweden", "2512"],
      ["electrical-engineer", "sweden", "2143"],
      ["data-scientist", "sweden", "2122"],
      ["registered-nurse", "sweden", "2221"],
      ["accountant", "sweden", "3313"],
    ]
  );
});

test("target selection distinguishes supported and unsupported markets", () => {
  assert.equal(getCareerResearchTarget("software-engineer", "sweden")?.nativeCurrency, "SEK");
  assert.equal(isCareerResearchSupported("registered-nurse", "sweden"), true);
  assert.equal(isCareerResearchSupported("registered-nurse", "united-states"), true);
  assert.equal(getCareerResearchTarget("mechanical-engineer", "germany"), null);
});

test("SCB percentiles normalize to annual native SEK with metric provenance", () => {
  const candidate = normalizeScbSalaryResponse(fixture, target, researchedAt);
  assert.deepEqual(
    [candidate.salary.low.value, candidate.salary.typical.value, candidate.salary.high.value],
    [482_400, 621_600, 838_800]
  );
  assert.equal(candidate.salary.sourceCurrency, "SEK");
  assert.equal(candidate.salary.methodology.distribution, "percentiles");
  assert.equal(candidate.salary.typical.provenance?.observationPeriod, "2025");
  assert.equal(candidate.salary.low.provenance?.retrievedAt, researchedAt);
});

test("missing source values remain null and do not acquire provenance", () => {
  const candidate = normalizeScbSalaryResponse({ ...fixture, value: [51_800, 40_200, null] }, target, researchedAt);
  assert.equal(candidate.salary.high.value, null);
  assert.equal(candidate.salary.high.provenance, null);
});

test("validation rejects converted foreign currency as local Swedish evidence", () => {
  const candidate = normalizeScbSalaryResponse(fixture, target, researchedAt);
  candidate.salary.sourceCurrency = "USD";
  assert.throws(() => validateCareerResearchCandidate(candidate, "SEK"), /Local salary evidence must use SEK/);
});

test("research architecture does not replace the 21 existing live profiles", () => {
  const before = JSON.stringify(careerCountryProfiles);
  normalizeScbSalaryResponse(fixture, target, researchedAt);
  assert.equal(Object.keys(careerCountryProfiles).length, 21);
  assert.equal(JSON.stringify(careerCountryProfiles), before);
});
