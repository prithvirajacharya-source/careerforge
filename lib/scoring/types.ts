export const SEKUR_SCORE_VERSION = "1.1" as const;

export type SekurScoreKey = "careerFit" | "countryFit" | "jobMarketDemand" | "salaryPotential" | "costOfLivingEfficiency" | "visaRelocationFeasibility" | "safety" | "skillsMatch" | "experienceMatch" | "educationMatch" | "languageFit" | "longTermGrowth";
export type SekurConfidence = "high" | "medium" | "low" | "insufficient";
export type ScoreValue = { score: number | null; evidence: string; sourceName?: string | null; sourceUrl?: string | null };
export type OpportunityScoreInput = Record<SekurScoreKey, ScoreValue>;
export type ScoreExplanation = { kind: "positive" | "negative" | "warning" | "missing" | "action"; factor: SekurScoreKey; message: string };
export type OpportunityScoreResult = { scoreVersion: typeof SEKUR_SCORE_VERSION; overallScore: number | null; confidence: SekurConfidence; evidenceCoverage: number; components: Array<ScoreValue & { key: SekurScoreKey; label: string; weight: number }>; explanations: ScoreExplanation[] };
export type ComparisonOutcome = { key: string; label: string; winner: "left" | "right" | "tie" | "unavailable"; leftScore: number | null; rightScore: number | null };
