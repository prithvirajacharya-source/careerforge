import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { calculateOpportunityRanking } from "../lib/personalization/ranking.ts";

test("opportunity ranking exposes coverage and avoids false precision", () => {
  const incomplete = calculateOpportunityRanking({ salary: 80 });
  assert.equal(incomplete.score, null);
  assert.equal(incomplete.confidence, "insufficient");
  assert.equal(incomplete.coverage, 30);

  const ranked = calculateOpportunityRanking({ salary: 80, demand: 70, hiringOutlook: 90 });
  assert.equal(ranked.score, 80);
  assert.equal(ranked.coverage, 70);
  assert.equal(ranked.confidence, "medium");
  assert.deepEqual(ranked.missingFactors, ["aiRisk", "remote", "educationFit"]);
  assert.throws(() => calculateOpportunityRanking({ salary: 101 }), /0 to 100/);
});

test("personalization migration keeps user intelligence private and pricing configurable", () => {
  const sql = readFileSync(new URL("../supabase/migrations/20260815_create_user_career_intelligence.sql", import.meta.url), "utf8");
  assert.match(sql, /user_id = auth\.uid\(\)/);
  assert.match(sql, /enable row level security/g);
  assert.match(sql, /revoke all privileges[\s\S]*from public, anon/);
  assert.match(sql, /plan_key text not null default 'free'/);
  assert.doesNotMatch(sql, /price|stripe|service_role/i);
});
