export type WorkplaceType = "remote" | "hybrid" | "on-site" | null;
export type SalaryPeriod = "hour" | "month" | "year" | null;

export type JobPosting = {
  id: string;
  provider: string;
  sourceName: string;
  sourceUrl: string;
  title: string;
  company: string | null;
  countryCode: string | null;
  countryName: string | null;
  city: string | null;
  locationText: string | null;
  workplaceType: WorkplaceType;
  employmentType: string | null;
  description: string | null;
  skills: string[];
  publishedAt: string | null;
  expiresAt: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string | null;
  salaryPeriod: SalaryPeriod;
  applyUrl: string;
  originalUrl: string;
  careerSlug: string | null;
  providerMetadata: Record<string, unknown>;
};

export type JobSearchInput = {
  q: string;
  career: string | null;
  country: string;
  location: string;
  workplaceType: Exclude<WorkplaceType, null> | null;
  page: number;
  limit: number;
  sort: "relevance" | "newest";
};

export type ProviderSearchResult = {
  jobs: JobPosting[];
  total: number | null;
  hasMore: boolean;
};

export interface JobProvider {
  id: string;
  name: string;
  countries: string[];
  search(input: JobSearchInput): Promise<ProviderSearchResult>;
}

export type JobSearchResponse = {
  results: JobPosting[];
  total: number | null;
  page: number;
  hasMore: boolean;
  coverageAvailable: boolean;
  providersUsed: string[];
  providerErrors: { provider: string; message: string }[];
  fetchedAt: string;
};
