import type { EvidenceProvenance, FreshnessAssessment } from "./types.ts";

export function assessEvidenceFreshness(provenance: Pick<EvidenceProvenance, "retrievedAt">, currentDate = new Date(), currentDays = 365, staleDays = 730): FreshnessAssessment {
  const retrieved = new Date(provenance.retrievedAt);
  if (!Number.isFinite(retrieved.getTime())) return { state: "unknown", ageDays: null, confidenceMultiplier: 0.75, notice: "Evidence retrieval date is unavailable." };
  const ageDays = Math.max(0, Math.floor((currentDate.getTime() - retrieved.getTime()) / 86_400_000));
  if (ageDays <= currentDays) return { state: "current", ageDays, confidenceMultiplier: 1, notice: null };
  if (ageDays <= staleDays) return { state: "aging", ageDays, confidenceMultiplier: 0.9, notice: "Evidence is aging and should be reverified." };
  return { state: "stale", ageDays, confidenceMultiplier: 0.75, notice: "Evidence is stale; verify the current rule or market condition before acting." };
}
