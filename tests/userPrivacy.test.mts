import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const sql = readFileSync(new URL("../supabase/migrations/20260815_create_user_career_intelligence.sql", import.meta.url), "utf8");

test("personalization tables enforce per-user RLS and deny anonymous access", () => {
  assert.match(sql, /enable row level security/g);
  assert.match(sql, /using \(user_id = auth\.uid\(\)\)/);
  assert.match(sql, /with check \(user_id = auth\.uid\(\)\)/);
  assert.match(sql, /revoke all privileges[\s\S]+from public, anon;/);
});

test("opportunity reports are private snapshots and cannot be updated by users", () => {
  assert.match(sql, /career_opportunity_reports for select to authenticated using \(user_id = auth\.uid\(\)\)/);
  assert.match(sql, /career_opportunity_reports for insert to authenticated with check \(user_id = auth\.uid\(\)\)/);
  assert.match(sql, /grant select, insert on table public\.career_opportunity_reports to authenticated/);
  assert.doesNotMatch(sql, /grant select, insert, update[^;]+career_opportunity_reports/i);
  assert.doesNotMatch(sql, /service_role/i);
});
