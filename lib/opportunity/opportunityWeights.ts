import type { OpportunityFactorKey } from "./types.ts";

export const OPPORTUNITY_WEIGHTS: Record<OpportunityFactorKey, number> = {
  careerFit: 0.25, jobMatch: 0.15, liveJobs: 0.1, hiring: 0.15, salaryFit: 0.1,
  safety: 0.08, costOfLiving: 0.06, visaResidency: 0.06, healthcare: 0.05,
};
export const OPPORTUNITY_MINIMUM_COVERAGE = 45;
