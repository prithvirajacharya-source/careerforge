import type { CareerResearchRunStatus } from "./model.ts";

export type CareerResearchDecision = "approve" | "reject";

export type ReviewableResearchRun = {
  id: number;
  status: CareerResearchRunStatus;
};

export function createCareerResearchReviewUpdate(
  run: ReviewableResearchRun,
  decision: CareerResearchDecision,
  reviewerId: string,
  reviewNotes: string | null | undefined,
  reviewedAt = new Date().toISOString()
) {
  if (run.status !== "pending_review") {
    throw new Error("This research run has already been reviewed.");
  }
  if (!reviewerId.trim()) throw new Error("Reviewer identity is required.");

  const notes = reviewNotes?.trim() || null;
  if (notes && notes.length > 2_000) {
    throw new Error("Review notes cannot exceed 2,000 characters.");
  }

  return {
    status: decision === "approve" ? "approved" as const : "rejected" as const,
    reviewed_by: reviewerId,
    reviewed_at: reviewedAt,
    review_notes: notes,
    updated_at: reviewedAt,
  };
}
