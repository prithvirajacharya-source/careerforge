import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { salaryPeriodUnit } from "../lib/careerModel.ts";
import { normalizeDenmarkSalaryCsv } from "../lib/careerResearch/denmark.ts";
import { normalizeCanadaWageCsv } from "../lib/careerResearch/canada.ts";
import { CAREER_RESEARCH_TARGETS, getCareerResearchTarget } from "../lib/careerResearch/registry.ts";
import { validateCareerResearchPublication } from "../lib/careerResearch/publishing.ts";
import { convertCurrency } from "../lib/currency.ts";
import { nextExpectedRefresh, sourceHealthStatus } from "../lib/careerResearch/sourceHealth.ts";

const fixture = (name: string) => readFileSync(new URL(`./fixtures/${name}`, import.meta.url), "utf8");

test("salary periods are explicit with annual backward compatibility", () => {
  assert.equal(salaryPeriodUnit(undefined), "year");
  assert.equal(salaryPeriodUnit("annual"), "year");
  assert.equal(salaryPeriodUnit("hourly"), "hour");
});

test("all Denmark mappings preserve official hourly DKK evidence", () => {
  const text = fixture("statbank-lons20-proof.csv");
  const expected = {
    "mechanical-engineer": ["2144", 398.82, 480.93, 570.64],
    "registered-nurse": ["2221", 327.98, 364.87, 414.8],
    "software-engineer": ["2512", 390.75, 478.76, 583.5],
    "electrical-engineer": ["2151", 408.86, 495.94, 579.26],
    accountant: ["2411", 373.41, 467.24, 587.95],
  } as const;
  for (const [career, [code, low, typical, high]] of Object.entries(expected)) {
    const target = getCareerResearchTarget(career, "denmark")!;
    assert.equal(target.occupationCode, code);
    const candidate = normalizeDenmarkSalaryCsv(text, getCareerResearchTarget(career, "denmark")!, "2026-08-15T00:00:00Z");
    assert.deepEqual([candidate.salary.low.value, candidate.salary.typical.value, candidate.salary.high.value], [low, typical, high]);
    assert.equal(candidate.salary.sourceCurrency, "DKK");
    assert.equal(candidate.salary.period, "hourly");
    assert.equal(candidate.salary.typical.provenance?.observationPeriod, "2024");
    assert.equal(candidate.salary.typical.provenance?.geography, "Denmark (national, all sectors and sexes)");
  }
});

test("all Canada mappings preserve official hourly CAD evidence", () => {
  const text = fixture("canada-jobbank-proof.csv");
  const proofSlugs = new Set(["mechanical-engineer", "registered-nurse", "software-engineer", "electrical-engineer", "accountant", "cybersecurity-analyst", "data-scientist"]);
  const targets = CAREER_RESEARCH_TARGETS.filter(({ countrySlug, careerSlug }) => countrySlug === "canada" && proofSlugs.has(careerSlug));
  assert.equal(targets.length, 7);
  for (const target of targets) {
    const candidate = normalizeCanadaWageCsv(text, target, "2026-08-15T00:00:00Z");
    assert.equal(candidate.salary.sourceCurrency, "CAD");
    assert.equal(candidate.salary.period, "hourly");
    assert.equal(candidate.salary.typical.provenance?.geography, "Canada (national)");
    assert.equal(candidate.salary.typical.provenance?.observationPeriod, "2023-2024");
    assert.ok((candidate.salary.low.value ?? 0) <= (candidate.salary.typical.value ?? 0));
    assert.ok((candidate.salary.typical.value ?? 0) <= (candidate.salary.high.value ?? 0));
  }
});

test("currency conversion changes amount only and preserves the hourly evidence period", () => {
  const cad = normalizeCanadaWageCsv(fixture("canada-jobbank-proof.csv"), getCareerResearchTarget("mechanical-engineer", "canada")!, "2026-08-15T00:00:00Z");
  const dkk = normalizeDenmarkSalaryCsv(fixture("statbank-lons20-proof.csv"), getCareerResearchTarget("mechanical-engineer", "denmark")!, "2026-08-15T00:00:00Z");
  assert.equal(convertCurrency(cad.salary.typical.value!, "CAD", "SEK", { USD: 1, CAD: 1.25, SEK: 10 }), 365.36);
  assert.equal(convertCurrency(dkk.salary.typical.value!, "DKK", "INR", { USD: 1, DKK: 7, INR: 84 }), 5771.16);
  assert.equal(salaryPeriodUnit(cad.salary.period), "hour");
  assert.equal(salaryPeriodUnit(dkk.salary.period), "hour");
});

test("new hourly collectors use deterministic annual source-health cadence", () => {
  assert.equal(sourceHealthStatus(0, "2026-08-15T00:00:00.000Z"), "healthy");
  assert.equal(nextExpectedRefresh("2026-08-15T00:00:00.000Z", 365), "2027-08-15T00:00:00.000Z");
});

test("hourly research remains unpublishable for Denmark and Canada", () => {
  for (const country of ["denmark", "canada"]) {
    const target = getCareerResearchTarget("mechanical-engineer", country)!;
    const candidate = country === "denmark" ? normalizeDenmarkSalaryCsv(fixture("statbank-lons20-proof.csv"), target, "2026-08-15T00:00:00Z") : normalizeCanadaWageCsv(fixture("canada-jobbank-proof.csv"), target, "2026-08-15T00:00:00Z");
    assert.throws(() => validateCareerResearchPublication({ id: 1, status: "approved", career_slug: target.careerSlug, country_slug: target.countrySlug, schema_version: "career-research-v1", candidate_profile: candidate }), /Publishing supports only/);
  }
});

test("malformed or changed-period source rows fail closed", () => {
  const target = getCareerResearchTarget("mechanical-engineer", "canada")!;
  assert.throws(() => normalizeCanadaWageCsv(fixture("canada-jobbank-proof.csv").replace(",0\n", ",1\n"), target, "2026-08-15T00:00:00Z"), /period changed unexpectedly/);
  assert.throws(() => normalizeDenmarkSalaryCsv("ARBF;TID\n2144 Mechanical engineers;2024", getCareerResearchTarget("mechanical-engineer", "denmark")!, "2026-08-15T00:00:00Z"), /Malformed/);
});

test("Canada missing wage cells remain unavailable rather than becoming zero", () => {
  const target = getCareerResearchTarget("mechanical-engineer", "canada")!;
  const candidate = normalizeCanadaWageCsv(
    fixture("canada-jobbank-proof.csv").replace("30,45.67,72.49", ",45.67,72.49"),
    target,
    "2026-08-15T00:00:00Z",
  );
  assert.equal(candidate.salary.low.value, null);
  assert.equal(candidate.salary.low.provenance, null);
  assert.equal(candidate.salary.typical.value, 45.67);
});
