import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

test("header currency control uses a compact accessible menu instead of a native select", () => {
  const component = read("../components/CurrencySelector.tsx");
  assert.doesNotMatch(component, /<select|<option/);
  assert.match(component, /aria-haspopup="listbox"/);
  assert.match(component, /role="listbox"/);
  assert.match(component, /role="option"/);
  assert.match(component, /aria-selected=/);
  assert.match(component, /event\.key === "Escape"/);
  assert.match(component, /event\.key === "ArrowDown"/);
  assert.match(component, /document\.addEventListener\("pointerdown"/);
  assert.match(component, /setCurrency\(code\)/);
});

test("currency menu remains readable and bounded on desktop and mobile", () => {
  const css = read("../app/globals.css");
  assert.match(css, /\.currency-menu-list\{[^}]*width:210px[^}]*max-height:300px[^}]*overflow-y:auto[^}]*background:#fff/);
  assert.match(css, /\.currency-menu-option\{[^}]*color:var\(--sekur-text\)/);
  assert.match(css, /\.currency-menu-option\[aria-selected="true"\]\{[^}]*background:#dbeafe[^}]*color:#1e3a8a/);
  assert.match(css, /\.currency-menu-list\{position:fixed;top:64px;right:12px\}/);
});
