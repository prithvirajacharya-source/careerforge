import { createJobTechProvider } from "./providers/jobtech.ts";
import type { JobProvider } from "./types.ts";

// ATS adapters are ready for verified board configurations. No employer token is fabricated here.
export function getJobProviders(country: string): JobProvider[] {
  return country === "sweden" ? [createJobTechProvider()] : [];
}

export const LIVE_JOB_COUNTRIES = ["sweden"] as const;
