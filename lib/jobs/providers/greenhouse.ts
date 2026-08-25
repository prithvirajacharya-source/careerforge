/* eslint-disable @typescript-eslint/no-explicit-any */
import { extractSkills } from "../skills.ts";
import type { JobProvider } from "../types.ts";

const plainText = (html: string) => html.replace(/<[^>]*>/g, " ").replace(/&(?:nbsp|amp|lt|gt|quot|#39);/g, " ").replace(/\s+/g, " ").trim();

export function createGreenhouseProvider(config: { boardToken: string; company: string; countries: string[] }, fetcher: typeof fetch = fetch): JobProvider {
  return { id: `greenhouse:${config.boardToken}`, name: `${config.company} via Greenhouse`, countries: config.countries, async search(input) {
    const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetcher(`https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(config.boardToken)}/jobs?content=true`, { signal: controller.signal, next: { revalidate: 600 } });
      if (!response.ok) throw new Error(`Greenhouse returned ${response.status}`);
      const payload = await response.json(); const needle = `${input.q} ${input.location}`.trim().toLowerCase();
      const all = (payload.jobs ?? []).map((job: any) => { const description = plainText(job.content ?? "").slice(0, 12_000); return { id: `greenhouse:${config.boardToken}:${job.id}`, provider: "greenhouse", sourceName: `${config.company} via Greenhouse`, sourceUrl: "https://developers.greenhouse.io/job-board", title: job.title, company: config.company, countryCode: null, countryName: null, city: null, locationText: job.location?.name ?? null, workplaceType: /remote/i.test(job.location?.name ?? "") ? "remote" as const : null, employmentType: null, description, skills: extractSkills(`${job.title} ${description}`), publishedAt: job.updated_at ?? null, expiresAt: null, salaryMin: null, salaryMax: null, salaryCurrency: null, salaryPeriod: null, applyUrl: job.absolute_url, originalUrl: job.absolute_url, careerSlug: input.career, providerMetadata: { boardToken: config.boardToken, directApplication: true } }; }).filter((job: any) => !needle || `${job.title} ${job.description} ${job.locationText}`.toLowerCase().includes(needle));
      const start = (input.page - 1) * input.limit; return { jobs: all.slice(start, start + input.limit), total: all.length, hasMore: start + input.limit < all.length };
    } finally { clearTimeout(timer); }
  }};
}
