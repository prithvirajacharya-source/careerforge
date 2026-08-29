import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

test("public navigation follows the career decision journey", () => {
  const header = `${read("../components/SiteHeader.tsx")}\n${read("../components/SiteNavigation.tsx")}`;
  for (const destination of ["Overview", "My Career", "Opportunities", "Jobs", "Explore", "Compare", "Saved", "Pro"]) assert.match(header, new RegExp(destination));
  assert.doesNotMatch(header, />Countries<|>Intelligence</);
  assert.match(header, /aria-current={active \? "page"/);
  assert.match(header, /path\.startsWith\("\/countries"\)/);
  assert.doesNotMatch(header, /href="\/profile">Overview/);
});

test("homepage centers career and country selection on one action", () => {
  const home = read("../app/page.tsx");
  const search = read("../components/HomeCareerSearch.tsx");
  assert.match(home, /Your Career/);
  assert.match(home, /Planned\. Powered/);
  assert.match(search, /\n\s*Career\n/);
  assert.match(search, /\n\s*Country\n/);
  assert.match(search, /View Career Opportunity/);
  assert.match(search, /disabled={!career \|\| !country}/);
  assert.match(home, /Explore Careers/);
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
  assert.match(read("../components/user/ProfileClient.tsx"), />My Career</);
  assert.match(read("../components/user/ProfileClient.tsx"), /Your career profile shapes SEKUR/);
  assert.match(read("../components/user/ProfileClient.tsx"), /Highest-value missing information/);
  assert.match(read("../components/user/SavedIntelligenceClient.tsx"), /one private library/);
  const pro = read("../app/pro/page.tsx");
  assert.match(pro, /Make better career decisions/);
  assert.doesNotMatch(pro, /capabilit|entitlement/i);
});

test("Overview is a distinct evidence-backed career command center", () => {
  const overview = read("../components/user/OverviewClient.tsx");
  for (const section of ["Your strongest opportunity", "Next best action", "Profile strength", "High-match jobs", "Saved opportunities"]) assert.match(overview, new RegExp(section));
  assert.match(overview, /calculateProfileCompleteness/);
  assert.match(overview, /\/api\/opportunities\/recommend/);
  assert.match(overview, /representativeJobs/);
  assert.doesNotMatch(overview, /Opportunity Score 84|Battery Systems Engineer/);
});

test("opportunity summary separates typical salary from the low-high range", () => {
  const salary = read("../components/MarketSalary.tsx");
  const page = read("../app/careers/[slug]/page.tsx");
  assert.match(salary, /return <MarketSalaryValue amount={salary\.typical}/);
  assert.match(salary, /amount={salary\.low}/);
  assert.match(salary, /amount={salary\.high}/);
  assert.match(page, />Salary range</);
  assert.match(page, /Currently unavailable/);
  assert.doesNotMatch(page, /Not published/);
});

test("signed-out saving preserves a safe return path and explains the next step", () => {
  const save = read("../components/user/SaveIntelligenceControl.tsx");
  const session = read("../components/user/UserSessionGate.tsx");
  assert.match(save, />Sign in to save</);
  assert.match(save, /returnTo=/);
  assert.match(save, /Signed in\. Select \$\{label\} to finish/);
  assert.match(session, /returnTo\.startsWith\("\/"\)/);
  assert.match(session, /!returnTo\.startsWith\("\/\/"\)/);
  assert.match(session, /router\.replace\(returnTo\)/);
});

test("Compare uses customer language and hides unfinished concepts", () => {
  const page = `${read("../app/compare/page.tsx")}\n${read("../app/compare/CompareClient.tsx")}`;
  assert.match(page, /Compare career opportunities/);
  for (const phrase of ["live SEKUR Intelligence Engine", "Personal Intelligence", "Personal assessment coming soon", "Prototype intelligence data"]) assert.doesNotMatch(page, new RegExp(phrase, "i"));
});
