import { SEKUR_MINIMUM_SCORE_COVERAGE, SEKUR_SCORE_WEIGHTS } from "./weights.ts";
import { SEKUR_SCORE_VERSION, type OpportunityScoreInput, type OpportunityScoreResult, type ScoreExplanation, type SekurConfidence, type SekurScoreKey } from "./types.ts";

const labels: Record<SekurScoreKey, string> = { careerFit: "Career fit", countryFit: "Country fit", jobMarketDemand: "Job-market demand", salaryPotential: "Salary potential", costOfLivingEfficiency: "Cost-of-living efficiency", visaRelocationFeasibility: "Visa / relocation feasibility", safety: "Safety", skillsMatch: "Skills match", experienceMatch: "Experience match", educationMatch: "Education match", languageFit: "Language fit", longTermGrowth: "Long-term growth" };
export const clampScore = (value: number) => Math.min(100, Math.max(0, Math.round(value)));
const confidenceFor = (coverage: number): SekurConfidence => coverage >= 75 ? "high" : coverage >= 50 ? "medium" : coverage >= 40 ? "low" : "insufficient";

export function calculateOpportunityScore(input: OpportunityScoreInput): OpportunityScoreResult {
  const components = (Object.keys(SEKUR_SCORE_WEIGHTS) as SekurScoreKey[]).map((key) => ({ key, label: labels[key], weight: SEKUR_SCORE_WEIGHTS[key], ...input[key], score: input[key].score === null ? null : clampScore(input[key].score) }));
  const available = components.filter((item) => item.score !== null);
  const coveredWeight = available.reduce((sum, item) => sum + item.weight, 0);
  const evidenceCoverage = Math.round(coveredWeight * 100);
  const normalized = coveredWeight ? available.reduce((sum, item) => sum + (item.score as number) * item.weight, 0) / coveredWeight : 0;
  const overallScore = evidenceCoverage < SEKUR_MINIMUM_SCORE_COVERAGE ? null : clampScore(normalized * (0.75 + 0.25 * coveredWeight));
  const explanations: ScoreExplanation[] = [
    ...available.filter((item) => (item.score as number) >= 75).sort((a, b) => (b.score as number) - (a.score as number)).slice(0, 4).map((item) => ({ kind: "positive" as const, factor: item.key, message: `${item.label}: ${item.evidence}` })),
    ...available.filter((item) => (item.score as number) <= 55).sort((a, b) => (a.score as number) - (b.score as number)).slice(0, 3).map((item) => ({ kind: "negative" as const, factor: item.key, message: `${item.label} is a weaker part of this opportunity (${item.score}/100).` })),
    ...components.filter((item) => item.score === null).slice(0, 4).map((item) => ({ kind: "missing" as const, factor: item.key, message: `${item.label} is unavailable and was not scored.` })),
  ];
  if (evidenceCoverage < 75) explanations.push({ kind: "warning", factor: "careerFit", message: `The score uses ${evidenceCoverage}% of weighted evidence; confidence is reduced.` });
  return { scoreVersion: SEKUR_SCORE_VERSION, overallScore, confidence: confidenceFor(evidenceCoverage), evidenceCoverage, components, explanations };
}
