import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { getCareerCountryProfile } from "../lib/careerCountryProfiles.ts";
import {
  PUBLIC_CAREER_MARKET_PROFILE_COLUMNS,
  resolveCareerCountryProfile,
  type PublishedCareerMarketProfile,
} from "../lib/careerMarketProfiles.ts";
import { validateCareerResearchPublication } from "../lib/careerResearch/publishing.ts";
import { CAREER_RESEARCH_TARGETS } from "../lib/careerResearch/registry.ts";
import { normalizeScbSalaryResponse } from "../lib/careerResearch/scb.ts";

const target = CAREER_RESEARCH_TARGETS[0];
const candidate = normalizeScbSalaryResponse({
  id: ["Sektor", "Yrke2012", "Kon", "ContentsCode", "Tid"],
  size: [1, 1, 1, 3, 1],
  dimension: {
    Yrke2012: { category: { index: { "2144": 0 }, label: { "2144": "Mechanical engineering" } } },
    ContentsCode: { category: { index: { "000007CE": 0, "000007CF": 1, "000007CI": 2 } } },
    Tid: { category: { index: { "2025": 0 } } },
  },
  value: [52_000, 41_000, 70_000],
}, target, "2026-08-10T12:00:00.000Z");

function run(overrides = {}) {
  return {
    id: 7,
    status: "approved" as const,
    career_slug: "mechanical-engineer",
    country_slug: "sweden",
    schema_version: "career-research-v1",
    candidate_profile: structuredClone(candidate),
    published_at: null,
    published_by: null,
    publication_version_id: null,
    ...overrides,
  };
}

function publishedRow(): PublishedCareerMarketProfile {
  return {
    career_slug: "mechanical-engineer",
    country_slug: "sweden",
    salary_low: 492_000,
    salary_typical: 624_000,
    salary_high: 840_000,
    native_currency: "SEK",
    salary_geography: "Sweden (national, all sectors and sexes)",
    source_name: "Statistics Sweden (SCB)",
    source_url: "https://www.scb.se",
    observation_period: "2025",
    salary_methodology: candidate.salary.methodology,
    verification_status: "verified",
    hiring_outlook: null,
    demand: null,
    employment_risk: null,
    education: null,
    notes: ["Published evidence"],
  };
}

test("only an approved, unpublished proof-target run may publish", () => {
  assert.doesNotThrow(() => validateCareerResearchPublication(run()));
  assert.throws(() => validateCareerResearchPublication(run({ status: "pending_review" })), /Only approved/);
  assert.throws(() => validateCareerResearchPublication(run({ status: "rejected" })), /Only approved/);
  assert.throws(() => validateCareerResearchPublication(run({ published_at: "2026-08-10T13:00:00Z" })), /already been published/);
  assert.throws(() => validateCareerResearchPublication(run({ career_slug: "software-engineer" })), /only Mechanical Engineer/);
});

test("publication rejects foreign currency, invalid ordering, and missing provenance", () => {
  const foreign = run();
  foreign.candidate_profile.salary.sourceCurrency = "USD";
  assert.throws(() => validateCareerResearchPublication(foreign), /must use SEK/);

  const unordered = run();
  unordered.candidate_profile.salary.low.value = 900_000;
  assert.throws(() => validateCareerResearchPublication(unordered), /low cannot exceed typical/);

  const unprovenanced = run();
  unprovenanced.candidate_profile.salary.typical.provenance = null;
  assert.throws(() => validateCareerResearchPublication(unprovenanced), /source provenance/);
});

test("public resolution falls back before publication and prefers a published row afterward", async () => {
  const fallback = getCareerCountryProfile("mechanical-engineer", "sweden");
  const before = await resolveCareerCountryProfile("mechanical-engineer", "sweden", async () => null);
  assert.strictEqual(before, fallback);

  const after = await resolveCareerCountryProfile("mechanical-engineer", "sweden", async () => publishedRow());
  assert.equal(after?.salary.typical, 624_000);
  assert.equal(after?.salary.sourceCurrency, "SEK");
  assert.equal(after?.salary.sourceName, "Statistics Sweden (SCB)");
});

test("a resolver failure leaves unrelated TypeScript profiles unchanged", async () => {
  const germany = getCareerCountryProfile("accountant", "germany");
  const resolved = await resolveCareerCountryProfile("accountant", "germany", async () => { throw new Error("database unavailable"); });
  assert.strictEqual(resolved, germany);
});

test("migration performs version insert, live upsert and run audit in one security-definer RPC", () => {
  const migrationPath = fileURLToPath(new URL("../supabase/migrations/20260810_create_career_market_publishing.sql", import.meta.url));
  const sql = readFileSync(migrationPath, "utf8");
  assert.match(sql, /security definer/i);
  assert.match(sql, /insert into public\.career_market_profile_versions/i);
  assert.match(sql, /insert into public\.career_market_profiles/i);
  assert.match(sql, /update public\.career_research_runs/i);
  assert.match(sql, /for update/i);
  assert.match(sql, /revoke all on function public\.publish_career_market_research/i);
});

test("corrective migration grants only public live-profile columns", () => {
  const migrationPath = fileURLToPath(new URL("../supabase/migrations/20260810_grant_public_career_market_profile_read.sql", import.meta.url));
  const sql = readFileSync(migrationPath, "utf8");
  assert.match(sql, /revoke all privileges on table public\.career_market_profiles from anon, authenticated/i);
  assert.match(sql, /grant select \([\s\S]*career_slug[\s\S]*notes[\s\S]*\) on table public\.career_market_profiles to anon, authenticated/i);
  assert.match(sql, /published_at is not null[\s\S]*published_from_run_id is not null/i);
  assert.match(sql, /revoke all privileges on table public\.career_market_profile_versions from anon/i);
  assert.doesNotMatch(sql, /grant select on table public\.career_market_profiles/i);
  assert.doesNotMatch(PUBLIC_CAREER_MARKET_PROFILE_COLUMNS, /published_by|published_from_run_id|publication_version_id|metric_provenance|researched_at/);
});
