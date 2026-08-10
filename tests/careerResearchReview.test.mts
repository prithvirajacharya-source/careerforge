import assert from "node:assert/strict";
import test from "node:test";
import { assertCareerResearchAdmin } from "../lib/careerResearch/auth.ts";
import { createCareerResearchReviewUpdate } from "../lib/careerResearch/review.ts";
import { careerCountryProfiles } from "../lib/careerCountryProfiles.ts";

const reviewerId = "8a2f1030-5168-4e49-a1ad-6c62d0a8f552";
const reviewedAt = "2026-08-10T16:30:00.000Z";

test("career research review requires an authenticated admin role", () => {
  assert.doesNotThrow(() => assertCareerResearchAdmin({ app_metadata: { role: "admin" } }));
  assert.throws(() => assertCareerResearchAdmin(null), /Authenticated admin session required/);
  assert.throws(
    () => assertCareerResearchAdmin({ app_metadata: { role: "member" } }),
    /SEKUR admin access required/
  );
});

test("approval creates only approved review-state and audit fields", () => {
  assert.deepEqual(
    createCareerResearchReviewUpdate(
      { id: 14, status: "pending_review" },
      "approve",
      reviewerId,
      "Official SCB evidence checked.",
      reviewedAt
    ),
    {
      status: "approved",
      reviewed_by: reviewerId,
      reviewed_at: reviewedAt,
      review_notes: "Official SCB evidence checked.",
      updated_at: reviewedAt,
    }
  );
});

test("rejection records rejected state and preserves optional null notes", () => {
  const update = createCareerResearchReviewUpdate(
    { id: 15, status: "pending_review" },
    "reject",
    reviewerId,
    "   ",
    reviewedAt
  );
  assert.equal(update.status, "rejected");
  assert.equal(update.review_notes, null);
  assert.equal(update.reviewed_by, reviewerId);
  assert.equal(update.reviewed_at, reviewedAt);
});

test("approved and rejected runs cannot be reviewed twice", () => {
  assert.throws(
    () => createCareerResearchReviewUpdate({ id: 16, status: "approved" }, "reject", reviewerId, null),
    /already been reviewed/
  );
  assert.throws(
    () => createCareerResearchReviewUpdate({ id: 17, status: "rejected" }, "approve", reviewerId, null),
    /already been reviewed/
  );
});

test("approval update cannot contain live-profile or candidate mutations", () => {
  const before = JSON.stringify(careerCountryProfiles);
  const update = createCareerResearchReviewUpdate(
    { id: 18, status: "pending_review" },
    "approve",
    reviewerId,
    null,
    reviewedAt
  );
  assert.deepEqual(Object.keys(update).sort(), [
    "review_notes",
    "reviewed_at",
    "reviewed_by",
    "status",
    "updated_at",
  ]);
  assert.equal(JSON.stringify(careerCountryProfiles), before);
});
