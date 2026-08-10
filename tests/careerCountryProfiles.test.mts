import assert from "node:assert/strict";
import test from "node:test";
import {
  getCareerCountryProfile,
  getCareerCountryProfiles,
} from "../lib/careerCountryProfiles.ts";

test("v1 contains exactly three markets for each supported career", () => {
  assert.deepEqual(
    getCareerCountryProfiles("mechanical-engineer").map((profile) => profile.countrySlug),
    ["united-states", "sweden", "germany"]
  );
  assert.deepEqual(
    getCareerCountryProfiles("cybersecurity-analyst").map((profile) => profile.countrySlug),
    ["united-states", "sweden", "germany"]
  );
});

test("each labour market retains its native salary currency", () => {
  for (const careerSlug of ["mechanical-engineer", "cybersecurity-analyst"]) {
    assert.equal(getCareerCountryProfile(careerSlug, "united-states")?.salary.sourceCurrency, "USD");
    assert.equal(getCareerCountryProfile(careerSlug, "sweden")?.salary.sourceCurrency, "SEK");
    assert.equal(getCareerCountryProfile(careerSlug, "germany")?.salary.sourceCurrency, "EUR");
  }
});

test("German censored upper quartiles are not converted into invented high values", () => {
  assert.equal(getCareerCountryProfile("mechanical-engineer", "germany")?.salary.high, null);
  assert.equal(getCareerCountryProfile("cybersecurity-analyst", "germany")?.salary.high, null);
});
