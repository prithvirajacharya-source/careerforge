import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("production headers and crawler boundaries protect private surfaces", () => {
  const config = readFileSync(new URL("../next.config.ts", import.meta.url), "utf8");
  const robots = readFileSync(new URL("../app/robots.ts", import.meta.url), "utf8");
  const adminLayout = readFileSync(new URL("../app/admin/layout.tsx", import.meta.url), "utf8");
  for (const header of ["X-Content-Type-Options", "X-Frame-Options", "Referrer-Policy", "Permissions-Policy"]) {
    assert.match(config, new RegExp(header));
  }
  for (const path of ["/admin/", "/api/", "/profile", "/saved", "/opportunity-report", "/career-switch", "/salary-negotiation"]) {
    assert.match(robots, new RegExp(path.replace("/", "\\/")));
  }
  assert.match(adminLayout, /index: false/);
  assert.match(adminLayout, /follow: false/);
});
