import { createJobTechProvider } from "./providers/jobtech.ts";
import { createAdzunaProviders, type AdzunaCredentials } from "./providers/adzuna.ts";
import type { JobProvider } from "./types.ts";

// ATS adapters are ready for verified board configurations. No employer token is fabricated here.
export function getJobProviders(country: string, adzunaCredentials: AdzunaCredentials | null = process.env.ADZUNA_APP_ID && process.env.ADZUNA_APP_KEY ? { appId: process.env.ADZUNA_APP_ID, appKey: process.env.ADZUNA_APP_KEY } : null): JobProvider[] {
  const providers = [createJobTechProvider(), ...(adzunaCredentials ? createAdzunaProviders(adzunaCredentials) : [])];
  return country === "all" ? providers : providers.filter((provider) => provider.countries.includes(country));
}

export const LIVE_JOB_COUNTRIES = ["sweden"] as const;
