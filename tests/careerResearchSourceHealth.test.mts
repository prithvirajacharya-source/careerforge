import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { likelySourceFormatDrift, nextExpectedRefresh, sourceHealthStatus } from "../lib/careerResearch/sourceHealth.ts";

test("source health degrades predictably and detects likely format drift", () => {
  assert.equal(sourceHealthStatus(0, "2026-08-15T00:00:00.000Z"), "healthy");
  assert.equal(sourceHealthStatus(1, null), "degraded");
  assert.equal(sourceHealthStatus(3, null), "failing");
  assert.equal(sourceHealthStatus(0, null), "unknown");
  assert.equal(likelySourceFormatDrift("BLS response contains a malformed annual wage value"), true);
  assert.equal(likelySourceFormatDrift("HTTP 503"), false);
});

test("freshness exposes the next expected refresh without inventing dates", () => {
  assert.equal(nextExpectedRefresh("2025-05-01T00:00:00.000Z", 365), "2026-05-01T00:00:00.000Z");
  assert.equal(nextExpectedRefresh(null, 365), null);
  assert.equal(nextExpectedRefresh("invalid", 365), null);
});

test("source-health migration remains admin-only", () => {
  const sql = readFileSync(new URL("../supabase/migrations/20260815_add_career_research_source_health.sql", import.meta.url), "utf8");
  assert.match(sql, /enable row level security/);
  assert.match(sql, /app_metadata[\s\S]*role[\s\S]*admin/);
  assert.match(sql, /revoke all privileges[\s\S]*from public, anon/);
  assert.doesNotMatch(sql, /service_role/i);
});
