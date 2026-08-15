import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("authenticated value routes retain the shared dual-theme shell", () => {
  const layout = readFileSync(new URL("../app/layout.tsx", import.meta.url), "utf8");
  const toggle = readFileSync(new URL("../components/VisualThemeToggle.tsx", import.meta.url), "utf8");
  const header = readFileSync(new URL("../components/SiteHeader.tsx", import.meta.url), "utf8");
  const developerMode = readFileSync(new URL("../components/DeveloperMode.tsx", import.meta.url), "utf8");
  assert.match(layout, /data-sekur-theme="glass-uhd"/);
  assert.match(layout, /t==='original'\?'original':'glass-uhd'/);
  assert.match(toggle, />Original<|>Original<\/button>/);
  assert.match(toggle, />Glass UHD<|>Glass UHD<\/button>/);
  assert.doesNotMatch(header, /VisualThemeToggle/);
  assert.match(developerMode, /VisualThemeToggle/);
  for (const route of ["profile", "saved", "opportunity-report", "career-switch", "salary-negotiation", "pro"]) {
    const page = readFileSync(new URL(`../app/${route}/page.tsx`, import.meta.url), "utf8");
    assert.match(page, /sekur-intelligence/);
    assert.match(page, /SiteHeader/);
  }
});

test("Glass UHD shares the Original background without changing theme persistence", () => {
  const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.doesNotMatch(css, /sekur-dusk-skyline|url\("\/images\/sekur-dusk/);
  assert.match(css, /body\s*\{[\s\S]*?background:\s*#07101f;/);
  assert.match(css, /html\[data-sekur-theme="original"\] body\s*\{[\s\S]*?background:\s*#07101f;/);
  assert.match(css, /--glass-fill:\s*rgba\(5, 18, 32, 0\.18\)/);
});
