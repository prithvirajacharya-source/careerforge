import type { SekurScoreKey } from "./types.ts";

export const SEKUR_SCORE_WEIGHTS: Record<SekurScoreKey, number> = {
  careerFit: 0.16,
  countryFit: 0.08,
  jobMarketDemand: 0.12,
  salaryPotential: 0.10,
  costOfLivingEfficiency: 0.08,
  visaRelocationFeasibility: 0.08,
  safety: 0.08,
  skillsMatch: 0.12,
  experienceMatch: 0.06,
  educationMatch: 0.06,
  languageFit: 0.03,
  longTermGrowth: 0.03,
};

export const SEKUR_MINIMUM_SCORE_COVERAGE = 40;
