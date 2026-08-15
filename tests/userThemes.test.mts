import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("authenticated value routes retain the shared dual-theme shell", () => {
  const layout = readFileSync(new URL("../app/layout.tsx", import.meta.url), "utf8");
  const toggle = readFileSync(new URL("../components/VisualThemeToggle.tsx", import.meta.url), "utf8");
  assert.match(layout, /data-sekur-theme="glass-uhd"/);
  assert.match(layout, /t==='original'\?'original':'glass-uhd'/);
  assert.match(toggle, />Original<|>Original<\/button>/);
  assert.match(toggle, />Glass UHD<|>Glass UHD<\/button>/);
  for (const route of ["profile", "saved", "opportunity-report"]) {
    const page = readFileSync(new URL(`../app/${route}/page.tsx`, import.meta.url), "utf8");
    assert.match(page, /sekur-intelligence/);
    assert.match(page, /SiteHeader/);
  }
});
