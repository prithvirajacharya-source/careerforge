import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

test("SEKUR uses the shared light visual foundation and geometric brand mark", () => {
  const css = read("../app/globals.css");
  const header = read("../components/SiteHeader.tsx");
  const mark = read("../components/brand/SekurMark.tsx");
  assert.match(css, /--sekur-surface-subtle:#f1f5f9/);
  assert.match(css, /--sekur-focus:#2563eb/);
  assert.match(css, /\.site-header\{[^}]*background:rgba\(255,255,255/);
  assert.match(header, /<SekurMark/);
  assert.match(mark, /viewBox="0 0 48 48"/);
  assert.match(read("../app/icon.svg"), /#1d4ed8/);
});

test("vector art is restrained to identity and decision-context surfaces", () => {
  const usages = [
    read("../app/page.tsx"),
    read("../app/careers/CareersClient.tsx"),
    read("../app/countries/page.tsx"),
    read("../app/pro/page.tsx"),
    read("../components/user/OverviewClient.tsx"),
    read("../components/user/OpportunityReportClient.tsx"),
    read("../components/user/SavedIntelligenceClient.tsx"),
  ];
  assert.ok(usages.every(source => source.includes("CareerPathArt")));
  assert.doesNotMatch(read("../app/compare/CompareClient.tsx"), /CareerPathArt/);
  assert.doesNotMatch(read("../components/jobs/JobCard.tsx"), /CareerPathArt/);
});

test("major browse routes no longer declare a dark legacy page shell", () => {
  for (const path of ["../app/careers/CareersClient.tsx", "../app/careers/[slug]/page.tsx", "../app/countries/page.tsx", "../app/countries/[slug]/page.tsx", "../app/compare/page.tsx"]) {
    assert.doesNotMatch(read(path), /min-h-screen bg-\[#07101f\] text-white/);
  }
});
