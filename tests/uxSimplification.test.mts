import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

test("public navigation presents one small, plain-language information architecture", () => {
  const header = read("../components/SiteHeader.tsx");
  for (const destination of ["Explore", "Compare", "Saved", "Account"]) assert.match(header, new RegExp(destination));
  assert.doesNotMatch(header, />Careers<|>Countries<|>Intelligence</);
});

test("homepage centers career and country selection on one action", () => {
  const home = read("../app/page.tsx");
  const search = read("../components/HomeCareerSearch.tsx");
  assert.match(home, /Make smarter/);
  assert.match(search, /What job are you interested in/);
  assert.match(search, /Where do you want to work/);
  assert.match(search, /Show opportunities/);
  assert.doesNotMatch(search, /AI risk level|Experience level|Apply filters/);
});

test("career evidence and secondary tools use progressive disclosure", () => {
  const page = read("../app/careers/[slug]/page.tsx");
  assert.match(page, /Sources &amp; methodology/);
  assert.match(page, /More labour-market detail/);
  assert.match(page, /Build my Opportunity Report/);
  assert.match(page, /Get updates when this changes/);
  assert.doesNotMatch(page, /Save career/);
  assert.doesNotMatch(page, /Save market/);
});

test("profile, saved, and Pro describe user outcomes instead of internal structures", () => {
  assert.match(read("../components/user/ProfileClient.tsx"), /Tell SEKUR about yourself/);
  assert.match(read("../components/user/SavedIntelligenceClient.tsx"), /one private library/);
  const pro = read("../app/pro/page.tsx");
  assert.match(pro, /Move from information to a decision/);
  assert.doesNotMatch(pro, /capabilit|entitlement/i);
});
