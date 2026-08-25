import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolveEntitlements } from "../lib/personalization/entitlements.ts";
import { savedTargetKey, validateUserCareerProfile } from "../lib/personalization/validation.ts";

const profile = { currentCountry: null, targetCountries: ["sweden"], currentCareer: null, yearsExperience: 4, educationLevel: null, skills: [], desiredSalary: 500000, desiredSalaryCurrency: "SEK", remotePreference: "neutral" as const, relocationWillingness: "maybe" as const, careerGoals: null };

test("profile validation rejects invalid private inputs", () => {
  assert.equal(validateUserCareerProfile(profile), profile);
  assert.throws(() => validateUserCareerProfile({ ...profile, yearsExperience: -1 }), /between 0 and 80/);
  assert.throws(() => validateUserCareerProfile({ ...profile, desiredSalaryCurrency: "SE" }), /three-letter currency/);
});

test("saved targets support career, country, and unique career-market shapes", () => {
  assert.equal(savedTargetKey({ itemType: "career", careerSlug: "accountant" }), "career:accountant");
  assert.equal(savedTargetKey({ itemType: "country", countrySlug: "sweden" }), "country:sweden");
  assert.equal(savedTargetKey({ itemType: "career_market", careerSlug: "accountant", countrySlug: "sweden" }), "career_market:accountant:sweden");
  assert.throws(() => savedTargetKey({ itemType: "career", careerSlug: "accountant", countrySlug: "sweden" }), /invalid/);
});

test("Free and Pro entitlements remain configurable without pricing", () => {
  assert.equal(resolveEntitlements("free").basicReport, true);
  assert.equal(resolveEntitlements("free").alerts, false);
  assert.equal(resolveEntitlements("pro").alerts, true);
  assert.equal(resolveEntitlements("free", { alerts: true }).alerts, true);
});

test("corrective migration closes duplicate-save and shape gaps", () => {
  const sql = readFileSync(new URL("../supabase/migrations/20260816090000_correct_user_career_intelligence.sql", import.meta.url), "utf8");
  assert.match(sql, /item_type in \('career', 'country', 'career_market'\)/);
  assert.match(sql, /create unique index saved_career_markets_user_target_uidx/);
  assert.match(sql, /saved_career_markets_shape_check/);
  assert.match(sql, /saved_career_comparisons_user_key_uidx/);
  assert.doesNotMatch(sql, /drop table|delete from/i);
});
