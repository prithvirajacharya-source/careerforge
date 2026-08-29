import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("career value routes retain the shared product shell", () => {
  const layout = readFileSync(new URL("../app/layout.tsx", import.meta.url), "utf8");
  const header = readFileSync(new URL("../components/SiteHeader.tsx", import.meta.url), "utf8");
  assert.match(layout, /SiteFooter/);
  assert.doesNotMatch(layout, /data-sekur-theme|sekur-visual-theme/);
  assert.match(header, /site-header/);
  for (const route of ["profile", "saved", "opportunity-report", "career-switch", "salary-negotiation", "pro"]) {
    const page = readFileSync(new URL(`../app/${route}/page.tsx`, import.meta.url), "utf8");
    assert.match(page, /sekur-intelligence/);
    assert.match(page, /SiteHeader/);
  }
});

test("the professional design foundation uses restrained shared tokens", () => {
  const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(css, /--sekur-navy:#071a35/);
  assert.match(css, /--sekur-blue:#2563eb/);
  assert.match(css, /--sekur-indigo:#4f46e5/);
  assert.match(css, /--sekur-bg:#f6f8fc/);
  assert.doesNotMatch(css, /backdrop-filter:blur\([1-9]/);
  assert.doesNotMatch(css, /sekur-dusk-skyline|url\("\/images\/sekur-dusk/);
});
