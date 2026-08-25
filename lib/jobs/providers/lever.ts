/* eslint-disable @typescript-eslint/no-explicit-any */
import { extractSkills } from "../skills.ts";
import type { JobProvider } from "../types.ts";

const strip = (html: string) => html.replace(/<[^>]*>/g, " ").replace(/&\w+;/g, " ").replace(/\s+/g, " ").trim();
export function createLeverProvider(config: { site: string; company: string; region: "global" | "eu"; countries: string[] }, fetcher: typeof fetch = fetch): JobProvider {
  const host = config.region === "eu" ? "api.eu.lever.co" : "api.lever.co";
  return { id: `lever:${config.site}`, name: `${config.company} via Lever`, countries: config.countries, async search(input) {
    const params = new URLSearchParams({ mode: "json", skip: String((input.page - 1) * input.limit), limit: String(input.limit) });
    const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), 8000);
    try { const response = await fetcher(`https://${host}/v0/postings/${encodeURIComponent(config.site)}?${params}`, { signal: controller.signal, next: { revalidate: 600 } }); if (!response.ok) throw new Error(`Lever returned ${response.status}`); const payload = await response.json();
      const jobs = (Array.isArray(payload) ? payload : []).map((job: any) => { const description = strip(`${job.descriptionPlain ?? ""} ${job.additionalPlain ?? ""}`).slice(0, 12_000); return { id: `lever:${config.site}:${job.id}`, provider: "lever", sourceName: `${config.company} via Lever`, sourceUrl: "https://github.com/lever/postings-api", title: job.text, company: config.company, countryCode: null, countryName: null, city: null, locationText: job.categories?.location ?? null, workplaceType: /remote/i.test(job.workplaceType ?? job.categories?.location ?? "") ? "remote" as const : null, employmentType: job.categories?.commitment ?? null, description, skills: extractSkills(`${job.text} ${description}`), publishedAt: job.createdAt ? new Date(job.createdAt).toISOString() : null, expiresAt: null, salaryMin: job.salaryRange?.min ?? null, salaryMax: job.salaryRange?.max ?? null, salaryCurrency: job.salaryRange?.currency ?? null, salaryPeriod: null, applyUrl: job.applyUrl || job.hostedUrl, originalUrl: job.hostedUrl, careerSlug: input.career, providerMetadata: { site: config.site, directApplication: Boolean(job.applyUrl) } }; }); return { jobs, total: null, hasMore: jobs.length === input.limit }; }
    finally { clearTimeout(timer); }
  }};
}
