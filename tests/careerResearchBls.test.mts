import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { blsOewsSeriesId, normalizeBlsOewsResponse } from "../lib/careerResearch/bls.ts";
import { validateCareerResearchCandidate } from "../lib/careerResearch/model.ts";
import { validateCareerResearchPublication } from "../lib/careerResearch/publishing.ts";
import {
  CAREER_RESEARCH_CAREERS,
  CAREER_RESEARCH_TARGETS,
  getCareerResearchTarget,
  isCareerResearchSupported,
} from "../lib/careerResearch/registry.ts";
import { careerCountryProfiles } from "../lib/careerCountryProfiles.ts";
import { convertCurrency } from "../lib/currency.ts";

const expectedMappings = [
  ["mechanical-engineer", "17-2141"],
  ["cybersecurity-analyst", "15-1212"],
  ["software-engineer", "15-1252"],
  ["electrical-engineer", "17-2071"],
  ["data-scientist", "15-2051"],
  ["registered-nurse", "29-1141"],
  ["accountant", "13-2011"],
] as const;

const target = getCareerResearchTarget("mechanical-engineer", "united-states")!;

function response(values: Partial<Record<"11" | "13" | "15", string>> = {
  "11": "73990",
  "13": "104110",
  "15": "164340",
}) {
  return {
    status: "REQUEST_SUCCEEDED",
    Results: {
      series: Object.entries(values).map(([datatype, value]) => ({
        seriesID: blsOewsSeriesId(target.occupationCode, datatype),
        data: [{ year: "2025", period: "A01", value }],
      })),
    },
  };
}

test("all seven United States targets have explicit defensible BLS SOC mappings", () => {
  const usTargets = CAREER_RESEARCH_TARGETS.filter((item) => item.countrySlug === "united-states");
  assert.equal(usTargets.length, 7);
  assert.equal(CAREER_RESEARCH_CAREERS.length, 7);
  assert.deepEqual(
    usTargets.map((item) => [item.careerSlug, item.occupationCode]),
    expectedMappings
  );
  assert.ok(usTargets.every((item) => item.sourceType === "bls-oews-api" && item.nativeCurrency === "USD" && item.sourceUrl?.startsWith("https://www.bls.gov/")));
});

test("BLS national annual percentiles normalize with USD provenance and May observation period", () => {
  const candidate = normalizeBlsOewsResponse(response(), target, "2026-08-10T12:00:00.000Z");
  assert.deepEqual(
    [candidate.salary.low.value, candidate.salary.typical.value, candidate.salary.high.value],
    [73_990, 104_110, 164_340]
  );
  assert.equal(candidate.salary.sourceCurrency, "USD");
  assert.equal(candidate.salary.typical.provenance?.geography, "United States (national)");
  assert.equal(candidate.salary.typical.provenance?.observationPeriod, "May 2025");
  assert.match(candidate.salary.typical.provenance?.sourceName ?? "", /SOC 17-2141/);
  assert.equal(candidate.salary.methodology.sourcePeriod, "annual");
});

test("missing BLS percentile remains null without provenance", () => {
  const candidate = normalizeBlsOewsResponse(response({ "11": "73990", "13": "104110" }), target, "2026-08-10T12:00:00.000Z");
  assert.equal(candidate.salary.high.value, null);
  assert.equal(candidate.salary.high.provenance, null);
});

test("BLS adapter rejects failed, empty, malformed, foreign-currency, and unordered evidence", () => {
  assert.throws(() => normalizeBlsOewsResponse({}, target, "2026-08-10T12:00:00.000Z"), /response failed/);
  assert.throws(() => normalizeBlsOewsResponse({ status: "REQUEST_SUCCEEDED", Results: { series: [] } }, target, "2026-08-10T12:00:00.000Z"), /no annual wage observations/);
  assert.throws(() => normalizeBlsOewsResponse(response({ "13": "not-a-number" }), target, "2026-08-10T12:00:00.000Z"), /malformed annual wage/);

  const candidate = normalizeBlsOewsResponse(response(), target, "2026-08-10T12:00:00.000Z");
  candidate.salary.sourceCurrency = "SEK";
  assert.throws(() => validateCareerResearchCandidate(candidate, "USD"), /must use USD/);
  candidate.salary.sourceCurrency = "USD";
  candidate.salary.low.value = 200_000;
  assert.throws(() => validateCareerResearchCandidate(candidate, "USD"), /low cannot exceed typical/);
});

test("Sweden stays supported, Germany stays unsupported, and collection cannot mutate live profiles", () => {
  const before = JSON.stringify(careerCountryProfiles);
  normalizeBlsOewsResponse(response(), target, "2026-08-10T12:00:00.000Z");
  assert.equal(isCareerResearchSupported("mechanical-engineer", "sweden"), true);
  assert.equal(getCareerResearchTarget("mechanical-engineer", "sweden")?.sourceType, "scb-pxweb");
  assert.equal(isCareerResearchSupported("mechanical-engineer", "germany"), false);
  assert.equal(JSON.stringify(careerCountryProfiles), before);
});

test("SEK and INR display conversion cannot alter stored native USD evidence", () => {
  const candidate = normalizeBlsOewsResponse(response(), target, "2026-08-10T12:00:00.000Z");
  const stored = structuredClone(candidate.salary);
  convertCurrency(candidate.salary.typical.value!, "USD", "SEK", { USD: 1, SEK: 10, INR: 83 });
  convertCurrency(candidate.salary.typical.value!, "USD", "INR", { USD: 1, SEK: 10, INR: 83 });
  assert.deepEqual(candidate.salary, stored);
  assert.equal(candidate.salary.sourceCurrency, "USD");
});

test("approved United States evidence may publish but pending evidence may not", () => {
  const candidate = normalizeBlsOewsResponse(response(), target, "2026-08-10T12:00:00.000Z");
  const run = {
    id: 22,
    status: "approved" as const,
    career_slug: target.careerSlug,
    country_slug: target.countrySlug,
    schema_version: candidate.schemaVersion,
    candidate_profile: candidate,
    published_at: null,
    published_by: null,
    publication_version_id: null,
  };
  assert.doesNotThrow(() => validateCareerResearchPublication(run));
  assert.throws(
    () => validateCareerResearchPublication({ ...run, status: "pending_review" }),
    /Only approved/
  );
});

test("United States publishing migration keeps atomic audit and native-market guards", () => {
  const migrationPath = fileURLToPath(new URL("../supabase/migrations/20260812_enable_us_career_market_publishing.sql", import.meta.url));
  const sql = readFileSync(migrationPath, "utf8");
  assert.match(sql, /country_slug not in \('sweden', 'united-states'\)/);
  assert.match(sql, /sourceCurrency' <> 'USD'/);
  assert.match(sql, /insert into public\.career_market_profile_versions/i);
  assert.match(sql, /insert into public\.career_market_profiles/i);
  assert.match(sql, /update public\.career_research_runs/i);
  assert.match(sql, /for update/i);
});
