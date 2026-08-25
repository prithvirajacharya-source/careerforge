import type { ComparisonOutcome } from "./types.ts";

export type ComparableMetric = { key: string; label: string; score: number | null };
export function compareScoreRecords(left: ComparableMetric[], right: ComparableMetric[], tieThreshold = 2): ComparisonOutcome[] {
  const rightByKey = new Map(right.map((item) => [item.key, item]));
  return left.map((leftMetric) => { const rightMetric = rightByKey.get(leftMetric.key); const rightScore = rightMetric?.score ?? null; const leftScore = leftMetric.score; let winner: ComparisonOutcome["winner"] = "unavailable"; if (leftScore !== null && rightScore !== null) winner = Math.abs(leftScore - rightScore) <= tieThreshold ? "tie" : leftScore > rightScore ? "left" : "right"; return { key: leftMetric.key, label: leftMetric.label, winner, leftScore, rightScore }; });
}
