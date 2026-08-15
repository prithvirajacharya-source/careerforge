import type { OpportunityEvidence, OpportunityFactor, OpportunityRanking } from "./model.ts";

export const OPPORTUNITY_FACTOR_WEIGHTS: Record<OpportunityFactor, number> = {
  salary: 0.3,
  demand: 0.2,
  hiringOutlook: 0.2,
  aiRisk: 0.1,
  remote: 0.1,
  educationFit: 0.1,
};

export function calculateOpportunityRanking(evidence: OpportunityEvidence): OpportunityRanking {
  const factors = Object.keys(OPPORTUNITY_FACTOR_WEIGHTS) as OpportunityFactor[];
  const supportedFactors = factors.filter((factor) => Number.isFinite(evidence[factor]));
  const missingFactors = factors.filter((factor) => !supportedFactors.includes(factor));
  const coveredWeight = supportedFactors.reduce((sum, factor) => sum + OPPORTUNITY_FACTOR_WEIGHTS[factor], 0);
  const coverage = Math.round(coveredWeight * 100);
  const valid = supportedFactors.every((factor) => (evidence[factor] ?? -1) >= 0 && (evidence[factor] ?? 101) <= 100);
  if (!valid) throw new Error("Opportunity evidence factors must be normalized from 0 to 100.");
  const score = coveredWeight >= 0.5
    ? Math.round(supportedFactors.reduce((sum, factor) => sum + (evidence[factor] ?? 0) * OPPORTUNITY_FACTOR_WEIGHTS[factor], 0) / coveredWeight)
    : null;
  const confidence = coverage >= 90 ? "high" : coverage >= 70 ? "medium" : coverage >= 50 ? "low" : "insufficient";
  return { score, confidence, coverage, supportedFactors, missingFactors, methodologyVersion: "opportunity-ranking-v1" };
}
