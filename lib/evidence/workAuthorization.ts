import { assessEvidenceFreshness } from "./freshness.ts";
import type { EvidenceProvenance } from "./types.ts";

export type WorkAuthorizationEvidence = { originRegion: string; destinationCountry: string; permitRequirement: "required" | "not-required" | "conditional" | "unknown"; employerSponsorship: "required" | "relevant" | "not-generally-required" | "unknown"; jobOfferRequired: boolean | null; salaryThreshold: { amount: number; currency: string; period: "annual" | "monthly" } | null; qualificationRequirement: string | null; occupationRestrictions: string[]; processingComplexity: "low" | "medium" | "high" | null; provenance: EvidenceProvenance };
export type WorkAuthorizationAssessment = { score: number | null; derived: boolean; freshness: ReturnType<typeof assessEvidenceFreshness> | null; explanation: string; legalNotice: string };

export function assessWorkAuthorization(evidence: WorkAuthorizationEvidence | null, currentDate = new Date()): WorkAuthorizationAssessment {
  const legalNotice = "Immigration rules change. Verify current requirements with the relevant authority before acting; SEKUR is not legal advice.";
  if (!evidence || evidence.provenance.status !== "published" || evidence.permitRequirement === "unknown") return { score: null, derived: false, freshness: evidence ? assessEvidenceFreshness(evidence.provenance, currentDate, 180, 365) : null, explanation: "Verified work-authorization evidence is unavailable.", legalNotice };
  const freshness = assessEvidenceFreshness(evidence.provenance, currentDate, 180, 365);
  const base = evidence.permitRequirement === "not-required" ? 95 : evidence.permitRequirement === "conditional" ? 65 : evidence.processingComplexity === "high" ? 35 : evidence.processingComplexity === "medium" ? 50 : 60;
  return { score: Math.round(base * freshness.confidenceMultiplier), derived: true, freshness, explanation: `${evidence.permitRequirement === "not-required" ? "Published evidence indicates no permit is required for this context." : "Published evidence indicates work authorization is required or conditional."}${freshness.notice ? ` ${freshness.notice}` : ""}`, legalNotice };
}
