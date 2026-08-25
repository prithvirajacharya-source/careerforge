import test from "node:test";
import assert from "node:assert/strict";
import { normalizeJobTechHit, createJobTechProvider } from "../lib/jobs/providers/jobtech.ts";
import { deduplicateJobs } from "../lib/jobs/jobDeduplication.ts";
import { parseJobSearchParams, searchJobs } from "../lib/jobs/searchJobs.ts";
import { extractSkills } from "../lib/jobs/skills.ts";
import { calculateJobMatch } from "../lib/jobs/jobMatching.ts";
import { recommendForMissingSkills, recommendStudyResources } from "../lib/learning/recommendStudyResources.ts";
import type { JobProvider } from "../lib/jobs/types.ts";

const hit = { id: "123", webpage_url: "https://arbetsformedlingen.se/jobs/123", headline: "Mechanical Engineer", description: { text: "Use Python, CATIA and finite element analysis." }, employer: { name: "Example AB" }, workplace_address: { city: "Göteborg", region: "Västra Götaland" }, employment_type: { label: "Permanent" }, publication_date: "2026-08-01T10:00:00Z", application_deadline: "2026-09-01", application_details: { url: "https://example.com/apply" }, must_have: { skills: [] }, nice_to_have: { skills: [] } };
const job = normalizeJobTechHit(hit, "mechanical-engineer");

test("JobTech normalization preserves source data and extracts skills", () => { assert.equal(job.company, "Example AB"); assert.equal(job.city, "Göteborg"); assert.equal(job.applyUrl, "https://example.com/apply"); assert.deepEqual(job.skills.sort(), ["CATIA", "FEA", "Python"].sort()); });
test("deduplication prefers richer duplicate", () => { const sparse = { ...job, description: null, skills: [] }; assert.deepEqual(deduplicateJobs([sparse, job]), [job]); });
test("search parameter validation bounds upstream work", () => { assert.throws(() => parseJobSearchParams(new URLSearchParams("limit=100")), /limit/); assert.equal(parseJobSearchParams(new URLSearchParams("career=mechanical-engineer&country=sweden")).q, "mechanical engineer"); });
test("skill extraction is case insensitive and synonym aware", () => { assert.deepEqual(extractSkills("Experience with python and FEM is required."), ["Python", "FEA"]); });
test("job matching is deterministic and transparent", () => { const match = calculateJobMatch(job, { careerSlug: "mechanical-engineer", skills: ["Python", "CATIA"] }); assert.equal(typeof match.score, "number"); assert.deepEqual(match.matchedSkills.sort(), ["CATIA", "Python"]); assert.deepEqual(match.missingSkills, ["FEA"]); assert.ok(match.reasons.some((reason) => reason.includes("FEA"))); });
test("insufficient profile data does not manufacture a score", () => { assert.equal(calculateJobMatch(job, {}).score, null); });
test("title relevance alone cannot manufacture a high match", () => { assert.equal(calculateJobMatch(job, { careerSlug: "mechanical-engineer" }).score, null); });
test("missing advertised skills materially reduce a match", () => { const strong = calculateJobMatch(job, { careerSlug: "mechanical-engineer", skills: ["Python", "CATIA", "FEA"] }); const weak = calculateJobMatch(job, { careerSlug: "mechanical-engineer", skills: ["Python"] }); assert.equal(strong.score, 100); assert.ok((weak.score ?? 100) < 75); });
test("study resources map only to relevant skills", () => { const results = recommendStudyResources(["Python"], 5); assert.ok(results.length > 0); assert.ok(results.every((item) => item.matchedSkills.includes("Python"))); });
test("missing skill maps to verified learning resource", () => { const results = recommendForMissingSkills(["FEA"]); assert.equal(results[0].resource.provider, "Ansys"); });
test("one provider failure does not discard another provider", async () => { const good: JobProvider = { id: "good", name: "Good", countries: ["sweden"], async search() { return { jobs: [job], total: 1, hasMore: false }; } }; const bad: JobProvider = { id: "bad", name: "Bad", countries: ["sweden"], async search() { throw new Error("offline"); } }; const input = parseJobSearchParams(new URLSearchParams("q=engineer")); const result = await searchJobs(input, [bad, good]); assert.equal(result.results.length, 1); assert.equal(result.providerErrors[0].provider, "Bad"); });
test("JobTech provider handles mocked official response", async () => { const provider = createJobTechProvider(async () => new Response(JSON.stringify({ total: { value: 1 }, hits: [hit] }), { status: 200 })) as JobProvider; const result = await provider.search(parseJobSearchParams(new URLSearchParams("q=engineer&limit=1"))); assert.equal(result.jobs[0].id, "jobtech:123"); });
