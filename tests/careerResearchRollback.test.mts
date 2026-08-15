import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { validateRollbackSelection } from "../lib/careerResearch/rollback.ts";

test("rollback selection requires a matching immutable target version", () => {
  const version = { id: 4, career_slug: "mechanical-engineer", country_slug: "sweden", event_type: "publish" as const, after_profile: { salary: {} } };
  assert.equal(validateRollbackSelection(version, "mechanical-engineer", "sweden"), version);
  assert.throws(() => validateRollbackSelection(version, "accountant", "sweden"), /does not match/);
  assert.throws(() => validateRollbackSelection({ ...version, after_profile: null }, "mechanical-engineer", "sweden"), /restorable/);
});

test("rollback migration remains admin-only, append-only, and creates a new version", () => {
  const sql = readFileSync(new URL("../supabase/migrations/20260815_add_career_market_rollback.sql", import.meta.url), "utf8");
  assert.match(sql, /app_metadata[\s\S]*role[\s\S]*admin/);
  assert.match(sql, /event_type, before_profile, after_profile/);
  assert.match(sql, /'rollback'/);
  assert.match(sql, /revoke all on function.*from public, anon/);
  assert.match(sql, /grant execute on function.*to authenticated/);
  assert.doesNotMatch(sql, /delete from public\.career_market_profile_versions/i);
  assert.doesNotMatch(sql, /service_role/i);
});
