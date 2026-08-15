export type EntitlementFeature = "basicProfile" | "savedIntelligence" | "basicReport" | "advancedReport" | "alerts" | "advancedComparisons" | "careerSwitchPlanner" | "salaryNegotiationReport" | "deepFactorBreakdown";

const FREE_FEATURES: Record<EntitlementFeature, boolean> = {
  basicProfile: true,
  savedIntelligence: true,
  basicReport: true,
  advancedReport: false,
  alerts: false,
  advancedComparisons: false,
  careerSwitchPlanner: false,
  salaryNegotiationReport: false,
  deepFactorBreakdown: false,
};

export function resolveEntitlements(planKey: string | null | undefined, overrides: Record<string, unknown> = {}) {
  const base = planKey === "pro"
    ? Object.fromEntries(Object.keys(FREE_FEATURES).map((key) => [key, true])) as Record<EntitlementFeature, boolean>
    : { ...FREE_FEATURES };
  for (const key of Object.keys(base) as EntitlementFeature[]) {
    if (typeof overrides[key] === "boolean") base[key] = overrides[key] as boolean;
  }
  return base;
}
