/* eslint-disable @typescript-eslint/no-explicit-any */
import { extractSkills } from "../skills.ts";
import type { JobPosting, JobProvider, JobSearchInput, ProviderSearchResult, WorkplaceType } from "../types.ts";

type JobTechHit = Record<string, any>;
type Fetcher = typeof fetch;

function workplace(text: string): WorkplaceType {
  if (/hybrid|distans.*del|delvis.*distans/i.test(text)) return "hybrid";
  if (/remote|distansarbete|helt.*distans/i.test(text)) return "remote";
  return "on-site";
}

export function normalizeJobTechHit(hit: JobTechHit, careerSlug: string | null): JobPosting {
  const description = typeof hit.description?.text === "string" ? hit.description.text.trim().slice(0, 12_000) : null;
  const location = [hit.workplace_address?.city, hit.workplace_address?.municipality, hit.workplace_address?.region].filter(Boolean);
  const applyUrl = hit.application_details?.url || hit.webpage_url;
  const taxonomySkills = [...(hit.must_have?.skills ?? []), ...(hit.nice_to_have?.skills ?? [])].map((item: any) => item.label).filter(Boolean);
  return {
    id: `jobtech:${hit.id}`, provider: "jobtech", sourceName: "Arbetsförmedlingen JobTech", sourceUrl: "https://jobsearch.api.jobtechdev.se",
    title: hit.headline || "Untitled role", company: hit.employer?.name ?? null, countryCode: "SE", countryName: "Sweden",
    city: hit.workplace_address?.city ?? hit.workplace_address?.municipality ?? null, locationText: location.length ? [...new Set(location)].join(", ") : "Sweden",
    workplaceType: workplace(`${hit.headline ?? ""} ${description ?? ""}`), employmentType: hit.employment_type?.label ?? hit.working_hours_type?.label ?? null,
    description, skills: [...new Set([...taxonomySkills, ...extractSkills(`${hit.headline ?? ""} ${description ?? ""}`)])],
    publishedAt: hit.publication_date ?? null, expiresAt: hit.application_deadline ?? null,
    salaryMin: null, salaryMax: null, salaryCurrency: null, salaryPeriod: null,
    applyUrl, originalUrl: hit.webpage_url || applyUrl, careerSlug,
    providerMetadata: { externalId: hit.external_id ?? null, occupation: hit.occupation?.label ?? null, occupationGroup: hit.occupation_group?.label ?? null, directApplication: Boolean(hit.application_details?.url) },
  };
}

export function createJobTechProvider(fetcher: Fetcher = fetch): JobProvider {
  return {
    id: "jobtech", name: "Arbetsförmedlingen JobTech", countries: ["sweden"],
    async search(input: JobSearchInput): Promise<ProviderSearchResult> {
      const params = new URLSearchParams({ q: input.q, offset: String((input.page - 1) * input.limit), limit: String(input.limit) });
      if (input.location) params.set("q", `${input.q} ${input.location}`.trim());
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      try {
        const response = await fetcher(`https://jobsearch.api.jobtechdev.se/search?${params}`, { headers: { Accept: "application/json", "User-Agent": "SEKUR-Jobs/1.0" }, signal: controller.signal, next: { revalidate: 600 } });
        if (!response.ok) throw new Error(`JobTech returned ${response.status}`);
        const payload = await response.json();
        const jobs = (Array.isArray(payload.hits) ? payload.hits : []).map((hit: JobTechHit) => normalizeJobTechHit(hit, input.career));
        const filtered = input.workplaceType ? jobs.filter((job: JobPosting) => job.workplaceType === input.workplaceType) : jobs;
        const total = typeof payload.total?.value === "number" ? payload.total.value : null;
        return { jobs: filtered, total, hasMore: total === null ? jobs.length === input.limit : input.page * input.limit < total };
      } finally { clearTimeout(timeout); }
    },
  };
}
