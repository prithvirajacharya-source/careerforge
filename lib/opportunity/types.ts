import type { JobPosting } from "../jobs/types.ts";
import type { StudyRecommendation } from "../learning/types.ts";
import type { OpportunityScoreResult } from "../scoring/types.ts";

export type OpportunityFactorKey = "careerFit" | "jobMatch" | "liveJobs" | "hiring" | "salaryFit" | "safety" | "costOfLiving" | "visaResidency" | "healthcare";
export type OpportunityConfidence = "very-high" | "high" | "medium" | "low" | "limited";
export type OpportunityFactor = { key: OpportunityFactorKey; label: string; score: number | null; weight: number; explanation: string; sourceAvailable: boolean };
export type OpportunityProfile = { currentCareer: string | null; skills: string[]; currentCountry: string | null; targetCountries: string[]; desiredSalary: number | null; desiredSalaryCurrency: string | null; remotePreference: "required" | "preferred" | "neutral"; yearsExperience?: number | null; educationLevel?: string | null; relocationWillingness?: "yes" | "maybe" | "no"; languages?: string[]; citizenshipRegion?: string | null; workAuthorizationStatus?: "authorized" | "requires-permit" | "unknown" };
export type OpportunityCandidate = {
  countrySlug: string; countryName: string; countryCode: string; careerSlug: string; careerName: string;
  opportunityScore: number | null; confidence: OpportunityConfidence; evidenceCoverage: number; personalized: boolean; ranking: number | null;
  factors: OpportunityFactor[]; strengths: string[]; tradeoffs: string[]; missingData: string[]; existingSkills: string[]; missingSkills: string[];
  nextActions: string[]; liveJobCount: number | null; representativeJobs: JobPosting[]; studyRecommendations: StudyRecommendation[];
  scoreBreakdown: OpportunityScoreResult; comparisonToTop: { improves: string[]; worsens: string[] } | null;
  actionPlan: { horizon: "immediate" | "next-30-days" | "next-3-months" | "before-applying" | "before-relocation"; action: string }[];
};
export type OpportunityResponse = { methodologyVersion: "sekur-opportunity-v2"; scoreVersion: "1.1"; accessLevel?: "preview" | "pro"; generatedAt: string; personalized: boolean; candidatesConsidered: number; recommendations: OpportunityCandidate[] };
