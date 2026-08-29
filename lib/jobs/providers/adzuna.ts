/* eslint-disable @typescript-eslint/no-explicit-any */
import { extractSkills } from "../skills.ts";
import type { JobPosting, JobProvider, JobSearchInput, ProviderSearchResult, WorkplaceType } from "../types.ts";

type Fetcher = typeof fetch;
export type AdzunaCredentials = { appId: string; appKey: string };

export const ADZUNA_MARKETS = [
  { slug: "united-states", apiCode: "us", countryCode: "US", countryName: "United States", currency: "USD" },
  { slug: "united-kingdom", apiCode: "gb", countryCode: "GB", countryName: "United Kingdom", currency: "GBP" },
  { slug: "germany", apiCode: "de", countryCode: "DE", countryName: "Germany", currency: "EUR" },
  { slug: "netherlands", apiCode: "nl", countryCode: "NL", countryName: "Netherlands", currency: "EUR" },
  { slug: "canada", apiCode: "ca", countryCode: "CA", countryName: "Canada", currency: "CAD" },
  { slug: "australia", apiCode: "au", countryCode: "AU", countryName: "Australia", currency: "AUD" },
] as const;

type AdzunaMarket = (typeof ADZUNA_MARKETS)[number];

const text = (value: unknown) => typeof value === "string" ? value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() : "";
const number = (value: unknown) => typeof value === "number" && Number.isFinite(value) ? value : null;
function workplace(value: string): WorkplaceType {
  if (/\bhybrid\b/i.test(value)) return "hybrid";
  if (/\bremote\b|work from home/i.test(value)) return "remote";
  return null;
}

export function normalizeAdzunaJob(raw: Record<string, any>, market: AdzunaMarket, careerSlug: string | null): JobPosting | null {
  const title = text(raw.title); const redirectUrl = text(raw.redirect_url);
  if (!raw.id || !title || !redirectUrl.startsWith("http")) return null;
  const description = text(raw.description).slice(0, 12_000) || null;
  const locationText = text(raw.location?.display_name) || null;
  return {
    id: `adzuna:${market.apiCode}:${raw.id}`, provider: "adzuna", sourceName: "Adzuna", sourceUrl: "https://developer.adzuna.com/",
    title, company: text(raw.company?.display_name) || null, countryCode: market.countryCode, countryName: market.countryName,
    city: null, locationText, workplaceType: workplace(`${title} ${description ?? ""} ${locationText ?? ""}`), employmentType: text(raw.contract_type || raw.contract_time) || null,
    description, skills: extractSkills(`${title} ${description ?? ""}`), publishedAt: text(raw.created) || null, expiresAt: null,
    salaryMin: number(raw.salary_min), salaryMax: number(raw.salary_max), salaryCurrency: number(raw.salary_min) !== null || number(raw.salary_max) !== null ? market.currency : null, salaryPeriod: number(raw.salary_min) !== null || number(raw.salary_max) !== null ? "year" : null,
    applyUrl: redirectUrl, originalUrl: redirectUrl, careerSlug,
    providerMetadata: { countryMarket: market.apiCode, category: text(raw.category?.label) || null, salaryIsPredicted: raw.salary_is_predicted === 1, directApplication: false },
  };
}

export function createAdzunaProvider(market: AdzunaMarket, credentials: AdzunaCredentials, fetcher: Fetcher = fetch): JobProvider {
  return {
    id: `adzuna-${market.apiCode}`, name: `Adzuna ${market.countryName}`, countries: [market.slug],
    async search(input: JobSearchInput): Promise<ProviderSearchResult> {
      const params = new URLSearchParams({ app_id: credentials.appId, app_key: credentials.appKey, results_per_page: String(input.limit), what: input.q, "content-type": "application/json" });
      if (input.location) params.set("where", input.location);
      if (input.sort === "newest") params.set("sort_by", "date");
      const controller = new AbortController(); const timeout = setTimeout(() => controller.abort(), 8000);
      try {
        const response = await fetcher(`https://api.adzuna.com/v1/api/jobs/${market.apiCode}/search/${input.page}?${params}`, { headers: { Accept: "application/json", "User-Agent": "SEKUR-Jobs/1.0" }, signal: controller.signal, next: { revalidate: 600 } });
        if (!response.ok) throw new Error(`Adzuna ${market.countryName} returned ${response.status}`);
        const payload = await response.json();
        const jobs = (Array.isArray(payload.results) ? payload.results : []).map((raw: Record<string, any>) => normalizeAdzunaJob(raw, market, input.career)).filter((job: JobPosting | null): job is JobPosting => job !== null);
        const filtered = input.workplaceType ? jobs.filter((job: JobPosting) => job.workplaceType === input.workplaceType) : jobs;
        const total = number(payload.count);
        return { jobs: filtered, total, hasMore: total === null ? jobs.length === input.limit : input.page * input.limit < total };
      } finally { clearTimeout(timeout); }
    },
  };
}

export function createAdzunaProviders(credentials: AdzunaCredentials, fetcher: Fetcher = fetch) {
  return ADZUNA_MARKETS.map((market) => createAdzunaProvider(market, credentials, fetcher));
}
