import { getCareerResearchCountrySource } from "./countryRegistry.ts";
import type { CareerResearchTarget } from "./registry.ts";

export type ResearchFreshness = "fresh" | "stale" | "unknown";

export function researchFreshness(
  countrySlug: string,
  researchedAt: string | null | undefined,
  now = new Date()
): ResearchFreshness {
  const refreshDays = getCareerResearchCountrySource(countrySlug)?.refreshAfterDays;
  if (!refreshDays || !researchedAt) return "unknown";
  const researched = new Date(researchedAt);
  if (Number.isNaN(researched.getTime())) return "unknown";
  return now.getTime() - researched.getTime() > refreshDays * 86_400_000
    ? "stale"
    : "fresh";
}

export function planBulkCareerResearch(
  targets: CareerResearchTarget[],
  latestResearch: Map<string, string>,
  now = new Date()
) {
  return targets.map((target) => {
    const key = `${target.careerSlug}:${target.countrySlug}`;
    const researchedAt = latestResearch.get(key) ?? null;
    const freshness = researchFreshness(target.countrySlug, researchedAt, now);
    return {
      target,
      researchedAt,
      freshness,
      shouldRun: freshness !== "fresh",
    };
  });
}
