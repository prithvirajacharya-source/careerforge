import { getCareerSearchQuery } from "./careerSearchAliases.ts";
import { deduplicateJobs } from "./jobDeduplication.ts";
import { getJobProviders } from "./jobProviderRegistry.ts";
import type { JobSearchInput, JobSearchResponse } from "./types.ts";

const allowedWorkplaces = new Set(["remote", "hybrid", "on-site"]);
export function parseJobSearchParams(params: URLSearchParams): JobSearchInput {
  const clean = (key: string, max: number) => (params.get(key) ?? "").trim().slice(0, max);
  const page = Number(params.get("page") ?? 1); const limit = Number(params.get("limit") ?? 12);
  const workplace = clean("workplaceType", 20); const sort = clean("sort", 20);
  if (!Number.isInteger(page) || page < 1 || page > 100) throw new Error("page must be an integer from 1 to 100");
  if (!Number.isInteger(limit) || limit < 1 || limit > 25) throw new Error("limit must be an integer from 1 to 25");
  if (workplace && !allowedWorkplaces.has(workplace)) throw new Error("Invalid workplaceType");
  if (sort && sort !== "relevance" && sort !== "newest") throw new Error("Invalid sort");
  const career = clean("career", 80) || null; const q = clean("q", 120) || (career ? getCareerSearchQuery(career) : "");
  return { q, career, country: clean("country", 60).toLowerCase() || "sweden", location: clean("location", 100), workplaceType: (workplace || null) as JobSearchInput["workplaceType"], page, limit, sort: (sort || "relevance") as JobSearchInput["sort"] };
}

export async function searchJobs(input: JobSearchInput, providers = getJobProviders(input.country)): Promise<JobSearchResponse> {
  if (!providers.length) return { results: [], total: null, page: input.page, hasMore: false, coverageAvailable: false, providersUsed: [], providerErrors: [], fetchedAt: new Date().toISOString() };
  const settled = await Promise.allSettled(providers.map((provider) => provider.search(input)));
  const results = settled.flatMap((result) => result.status === "fulfilled" ? result.value.jobs : []);
  const providerErrors = settled.flatMap((result, i) => result.status === "rejected" ? [{ provider: providers[i].name, message: result.reason instanceof Error ? result.reason.message : "Provider unavailable" }] : []);
  const successful = settled.flatMap((result, i) => result.status === "fulfilled" ? [providers[i].name] : []);
  let jobs = deduplicateJobs(results); if (input.sort === "newest") jobs = jobs.sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""));
  const totals = settled.flatMap((r) => r.status === "fulfilled" && r.value.total !== null ? [r.value.total] : []);
  return { results: jobs, total: totals.length ? Math.max(...totals) : null, page: input.page, hasMore: settled.some((r) => r.status === "fulfilled" && r.value.hasMore), coverageAvailable: true, providersUsed: successful, providerErrors, fetchedAt: new Date().toISOString() };
}
