export type EvidenceConfidence = "high" | "medium" | "low";
export type EvidenceAuthority = "government" | "national-statistics" | "public-employment" | "recognized-institution" | "employer";
export type EvidenceStatus = "draft" | "review" | "published" | "retired";

export type EvidenceProvenance = {
  sourceName: string;
  sourceUrl: string;
  authority: EvidenceAuthority;
  retrievedAt: string;
  effectiveFrom: string | null;
  referencePeriod: string | null;
  geography: string;
  careerSlug: string | null;
  confidence: EvidenceConfidence;
  status: EvidenceStatus;
};

export type FreshnessAssessment = { state: "current" | "aging" | "stale" | "unknown"; ageDays: number | null; confidenceMultiplier: number; notice: string | null };
