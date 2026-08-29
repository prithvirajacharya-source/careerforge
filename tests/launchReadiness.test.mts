import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

test("private beta legal notices are discoverable without claiming final legal review", () => {
  const layout = read("../app/layout.tsx");
  const footer = read("../components/SiteFooter.tsx");
  const privacy = read("../app/privacy/page.tsx");
  const terms = read("../app/terms/page.tsx");
  assert.match(layout, /<SiteFooter/);
  assert.match(footer, /href="\/privacy"/);
  assert.match(footer, /href="\/terms"/);
  assert.match(privacy, /private-beta implementation/i);
  assert.match(terms, /operational placeholder/i);
  assert.match(terms, /does not change hourly, monthly, or annual salary periods/i);
});

test("robots blocks private and administrative surfaces", () => {
  const robots = read("../app/robots.ts");
  for (const path of ["/admin/", "/api/", "/profile", "/saved", "/opportunity-report", "/career-switch", "/salary-negotiation"]) {
    assert.match(robots, new RegExp(path.replace("/", "\\/")));
  }
});

test("career discovery has a bounded canonical fallback", () => {
  const careers = read("../lib/careers.ts");
  assert.match(careers, /CAREER_LIST_READ_TIMEOUT_MS/);
  assert.match(careers, /AbortController/);
  assert.match(careers, /return fallbackCareers\(\)/);
  assert.match(careers, /CAREER_CATALOG\.map/);
});

test("country discovery uses the canonical beta catalog instead of rendering blank", () => {
  assert.match(read("../lib/countries.ts"), /return COUNTRY_CATALOG/);
  assert.match(read("../app/countries/page.tsx"), /Where can your career perform best/);
});
