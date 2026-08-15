export type SourceHealthStatus = "healthy" | "degraded" | "failing" | "unknown";

export function sourceHealthStatus(consecutiveFailures: number, lastSuccessfulFetch?: string | null) {
  if (consecutiveFailures >= 3) return "failing" as const;
  if (consecutiveFailures > 0) return "degraded" as const;
  return lastSuccessfulFetch ? "healthy" as const : "unknown" as const;
}

export function likelySourceFormatDrift(message: string) {
  return /malformed|schema|unexpected|missing column|no annual wage observations|do not share one observation period/i.test(message);
}

export function nextExpectedRefresh(researchedAt: string | null | undefined, refreshAfterDays: number | null | undefined) {
  if (!researchedAt || !refreshAfterDays) return null;
  const researched = new Date(researchedAt);
  if (Number.isNaN(researched.getTime())) return null;
  return new Date(researched.getTime() + refreshAfterDays * 86_400_000).toISOString();
}
