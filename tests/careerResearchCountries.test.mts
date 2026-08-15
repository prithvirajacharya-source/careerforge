import assert from "node:assert/strict";
import test from "node:test";
import { CAREER_RESEARCH_COUNTRY_SOURCES, getCareerResearchCountrySource } from "../lib/careerResearch/countryRegistry.ts";
import { planBulkCareerResearch, researchFreshness } from "../lib/careerResearch/freshness.ts";
import { CAREER_RESEARCH_TARGETS, getCareerResearchTarget } from "../lib/careerResearch/registry.ts";

test("first-iteration registry models thirteen countries and Scotland as a UK region", () => {
  assert.equal(CAREER_RESEARCH_COUNTRY_SOURCES.length, 13);
  const scotland = getCareerResearchCountrySource("scotland");
  assert.equal(scotland?.marketType, "region");
  assert.equal(scotland?.parentCountrySlug, "united-kingdom");
  assert.match(scotland?.disabledReason ?? "", /UK-wide evidence must not be relabeled Scotland/);
});

test("country registry preserves native currencies and authoritative sources", () => {
  const expected = {
    sweden: "SEK", norway: "NOK", denmark: "DKK", finland: "EUR",
    poland: "PLN", germany: "EUR", switzerland: "CHF", netherlands: "EUR",
    ireland: "EUR", "united-kingdom": "GBP", scotland: "GBP", canada: "CAD",
    "united-states": "USD",
  };
  assert.deepEqual(
    Object.fromEntries(CAREER_RESEARCH_COUNTRY_SOURCES.map((country) => [country.slug, country.nativeCurrency])),
    expected
  );
  assert.ok(CAREER_RESEARCH_COUNTRY_SOURCES.every((country) => country.sourceUrl.startsWith("https://")));
});

test("automation includes only validated source-system targets", () => {
  const automatedCountries = ["sweden", "united-states", "norway", "finland", "denmark", "canada", "united-kingdom"];
  assert.equal(CAREER_RESEARCH_TARGETS.length, 42);
  assert.ok(CAREER_RESEARCH_TARGETS.every((target) => automatedCountries.includes(target.countrySlug)));
  assert.equal(getCareerResearchTarget("mechanical-engineer", "norway")?.occupationCode, "2144");
  assert.equal(getCareerResearchTarget("registered-nurse", "finland")?.occupationCode, "2221");
  for (const country of CAREER_RESEARCH_COUNTRY_SOURCES.filter((item) => !automatedCountries.includes(item.slug))) {
    assert.equal(getCareerResearchTarget("mechanical-engineer", country.slug), null);
    assert.ok(country.disabledReason);
  }
});

test("freshness uses source cadence and does not repeatedly plan fresh targets", () => {
  const now = new Date("2026-08-10T00:00:00Z");
  assert.equal(researchFreshness("sweden", "2026-01-01T00:00:00Z", now), "fresh");
  assert.equal(researchFreshness("sweden", "2024-01-01T00:00:00Z", now), "stale");
  assert.equal(researchFreshness("germany", "2026-01-01T00:00:00Z", now), "unknown");
  const first = CAREER_RESEARCH_TARGETS[0];
  const latest = new Map([[`${first.careerSlug}:${first.countrySlug}`, "2026-01-01T00:00:00Z"]]);
  const plan = planBulkCareerResearch([first, CAREER_RESEARCH_TARGETS.at(-1)!], latest, now);
  assert.equal(plan[0].shouldRun, false);
  assert.equal(plan[1].shouldRun, true);
});
