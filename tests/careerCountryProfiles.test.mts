import assert from "node:assert/strict";
import test from "node:test";
import {
  getCareerCountryProfile,
  getCareerCountryProfiles,
} from "../lib/careerCountryProfiles.ts";

const supportedCareerSlugs = [
  "mechanical-engineer",
  "cybersecurity-analyst",
  "software-engineer",
  "electrical-engineer",
  "data-scientist",
  "registered-nurse",
  "accountant",
];

test("each supported career contains exactly the three launch markets", () => {
  for (const careerSlug of supportedCareerSlugs) {
    assert.deepEqual(
      getCareerCountryProfiles(careerSlug).map((profile) => profile.countrySlug),
      ["united-states", "sweden", "germany"]
    );
  }
});

test("each labour market retains its native salary currency", () => {
  for (const careerSlug of supportedCareerSlugs) {
    assert.equal(getCareerCountryProfile(careerSlug, "united-states")?.salary.sourceCurrency, "USD");
    assert.equal(getCareerCountryProfile(careerSlug, "sweden")?.salary.sourceCurrency, "SEK");
    assert.equal(getCareerCountryProfile(careerSlug, "germany")?.salary.sourceCurrency, "EUR");
  }
});

test("German censored upper quartiles are not converted into invented high values", () => {
  assert.equal(getCareerCountryProfile("mechanical-engineer", "germany")?.salary.high, null);
  assert.equal(getCareerCountryProfile("cybersecurity-analyst", "germany")?.salary.high, null);
  assert.equal(getCareerCountryProfile("electrical-engineer", "germany")?.salary.high, null);
  assert.equal(getCareerCountryProfile("data-scientist", "germany")?.salary.high, null);
});

test("all expansion profiles use verified native-market salary evidence", () => {
  for (const careerSlug of supportedCareerSlugs.slice(2)) {
    for (const profile of getCareerCountryProfiles(careerSlug)) {
      assert.equal(profile.salary.verificationStatus, "verified");
      assert.ok(profile.salary.sourceUrl);
      assert.ok(profile.salary.methodology);
      assert.ok(profile.salary.observationDate);
      assert.ok(profile.salary.low);
      assert.ok(profile.salary.typical);
    }
  }
});
