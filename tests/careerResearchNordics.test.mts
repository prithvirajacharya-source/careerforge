import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { normalizeNorwaySalaryResponse } from "../lib/careerResearch/norway.ts";
import { normalizeFinlandSalaryResponse } from "../lib/careerResearch/finland.ts";
import { CAREER_RESEARCH_TARGETS, getCareerResearchTarget, isCareerResearchSupported } from "../lib/careerResearch/registry.ts";
import { validateCareerResearchPublication } from "../lib/careerResearch/publishing.ts";
import { getCareerResearchCountrySource } from "../lib/careerResearch/countryRegistry.ts";
import { likelySourceFormatDrift, nextExpectedRefresh, sourceHealthStatus } from "../lib/careerResearch/sourceHealth.ts";

const fixture = (name: string) => JSON.parse(readFileSync(new URL(`./fixtures/${name}`, import.meta.url), "utf8"));

test("Norway proof mappings normalize official quartiles in native NOK", () => {
  const expected: Record<string, number[]> = {
    "mechanical-engineer": [71870, 87200, 105820],
    "registered-nurse": [58180, 63810, 70030],
    "software-engineer": [63330, 77420, 93820],
    "electrical-engineer": [71630, 84580, 101070],
    accountant: [59390, 72300, 88570],
  };
  for (const [career, monthly] of Object.entries(expected)) {
    const target = getCareerResearchTarget(career, "norway")!;
    const candidate = normalizeNorwaySalaryResponse(fixture("ssb-11418-expanded-proof.json"), target, "2026-08-15T00:00:00Z");
    assert.deepEqual([candidate.salary.low.value, candidate.salary.typical.value, candidate.salary.high.value], monthly.map((value) => value * 12));
    assert.equal(candidate.salary.sourceCurrency, "NOK");
    assert.equal(candidate.salary.typical.provenance?.sourceUrl, "https://www.ssb.no/en/statbank/table/11418");
    assert.match(candidate.salary.typical.provenance?.sourceName ?? "", /Statistics Norway \(SSB\)/);
    assert.equal(candidate.salary.typical.provenance?.geography, "Norway (national, all sectors and sexes)");
    assert.equal(candidate.salary.typical.provenance?.observationPeriod, "2025");
    assert.deepEqual(candidate.salary.methodology, { distribution: "quartiles", lowMeasure: "lower quartile", typicalMeasure: "median", highMeasure: "upper quartile", sourcePeriod: "monthly", normalization: "Official monthly earnings annualized by multiplying by 12." });
  }
});

test("Finland proof mappings normalize official deciles in native EUR", () => {
  const expected: Record<string, number[]> = {
    "mechanical-engineer": [3453, 4702, 6735],
    "registered-nurse": [3631, 4198, 5150],
    "software-engineer": [3485, 5020, 7108],
    "electrical-engineer": [3464, 4820, 6958],
    accountant: [3418, 5020, 7736],
  };
  for (const [career, monthly] of Object.entries(expected)) {
    const target = getCareerResearchTarget(career, "finland")!;
    const candidate = normalizeFinlandSalaryResponse(fixture("statfin-15au-expanded-proof.json"), target, "2026-08-15T00:00:00Z");
    assert.deepEqual([candidate.salary.low.value, candidate.salary.typical.value, candidate.salary.high.value], monthly.map((value) => value * 12));
    assert.equal(candidate.salary.sourceCurrency, "EUR");
    assert.equal(candidate.salary.typical.provenance?.sourceUrl, "https://pxweb2.stat.fi/PxWeb/pxweb/en/StatFin/StatFin__pra/15au.px/");
    assert.match(candidate.salary.typical.provenance?.sourceName ?? "", /Statistics Finland/);
    assert.equal(candidate.salary.typical.provenance?.geography, "Finland (national, all sectors and sexes)");
    assert.equal(candidate.salary.typical.provenance?.observationPeriod, "2024");
    assert.deepEqual(candidate.salary.methodology, { distribution: "percentiles", lowMeasure: "1st decile", typicalMeasure: "median", highMeasure: "9th decile", sourcePeriod: "monthly", normalization: "Official monthly total earnings of full-time wage and salary earners annualized by multiplying by 12." });
  }
});

test("validated Nordic targets are enabled while unresolved mappings and publishing stay disabled", () => {
  assert.equal(CAREER_RESEARCH_TARGETS.filter(({ countrySlug }) => ["norway", "finland"].includes(countrySlug)).length, 49);
  assert.equal(isCareerResearchSupported("software-engineer", "norway"), true);
  assert.equal(isCareerResearchSupported("accountant", "finland"), true);
  assert.equal(isCareerResearchSupported("cybersecurity-analyst", "norway"), false);
  assert.equal(isCareerResearchSupported("data-scientist", "finland"), false);
  assert.equal(isCareerResearchSupported("physiotherapist", "finland"), false);
  const target = getCareerResearchTarget("mechanical-engineer", "norway")!;
  const candidate = normalizeNorwaySalaryResponse(fixture("ssb-11418-expanded-proof.json"), target, "2026-08-15T00:00:00Z");
  assert.throws(() => validateCareerResearchPublication({ id: 1, status: "approved", career_slug: target.careerSlug, country_slug: target.countrySlug, schema_version: "career-research-v1", candidate_profile: candidate }), /Publishing supports only/);
});

test("Nordic adapters preserve missing values and reject malformed salary ordering", () => {
  const norwayFixture = fixture("ssb-11418-expanded-proof.json");
  norwayFixture.value[10] = null;
  const norwayTarget = getCareerResearchTarget("mechanical-engineer", "norway")!;
  const incomplete = normalizeNorwaySalaryResponse(norwayFixture, norwayTarget, "2026-08-15T00:00:00Z");
  assert.equal(incomplete.salary.high.value, null);
  assert.equal(incomplete.salary.high.provenance, null);

  const finlandFixture = fixture("statfin-15au-expanded-proof.json");
  finlandFixture.value[0] = 9000;
  const finlandTarget = getCareerResearchTarget("mechanical-engineer", "finland")!;
  assert.throws(() => normalizeFinlandSalaryResponse(finlandFixture, finlandTarget, "2026-08-15T00:00:00Z"), /cannot exceed/);
});

test("Nordic research cannot contaminate source currency or unrelated markets", () => {
  for (const country of ["norway", "finland"]) {
    for (const career of ["mechanical-engineer", "registered-nurse", "software-engineer", "electrical-engineer", "accountant"]) {
      const target = getCareerResearchTarget(career, country)!;
      assert.equal(target.nativeCurrency, country === "norway" ? "NOK" : "EUR");
      assert.equal(target.countrySlug, country);
    }
  }
  assert.equal(getCareerResearchTarget("mechanical-engineer", "denmark")?.nativeCurrency, "DKK");
  assert.equal(getCareerResearchTarget("mechanical-engineer", "canada")?.nativeCurrency, "CAD");
  assert.equal(getCareerResearchTarget("mechanical-engineer", "united-kingdom")?.nativeCurrency, "GBP");
  assert.equal(getCareerResearchTarget("mechanical-engineer", "netherlands"), null);
});

test("all Nordic targets share deterministic source-health and annual freshness behavior", () => {
  for (const country of ["norway", "finland"]) {
    const source = getCareerResearchCountrySource(country)!;
    assert.equal(source.automationStatus, "automated");
    assert.equal(source.refreshAfterDays, 365);
    assert.equal(nextExpectedRefresh("2026-08-15T00:00:00.000Z", source.refreshAfterDays), "2027-08-15T00:00:00.000Z");
  }
  assert.equal(sourceHealthStatus(0, "2026-08-15T00:00:00.000Z"), "healthy");
  assert.equal(sourceHealthStatus(1, "2026-08-15T00:00:00.000Z"), "degraded");
  assert.equal(sourceHealthStatus(3, "2026-08-15T00:00:00.000Z"), "failing");
  assert.equal(likelySourceFormatDrift("unexpected schema missing column"), true);
  assert.equal(likelySourceFormatDrift("HTTP 503"), false);
});

test("research storage is pending-review only and cannot mutate or publish live Nordic evidence", () => {
  const route = readFileSync(new URL("../app/api/research/career-market/route.ts", import.meta.url), "utf8");
  assert.match(route, /\.insert\(\{[\s\S]*status:\s*"pending_review"/);
  assert.match(route, /liveDataChanged:\s*false[\s\S]*publishAvailable:\s*false/);
  assert.match(route, /Successful candidates are pending review; nothing was published/);
  assert.doesNotMatch(route, /status:\s*"approved"[\s\S]*collectAndStoreResearch/);
});
