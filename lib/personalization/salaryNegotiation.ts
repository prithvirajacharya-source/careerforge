import type { CareerCountryProfile } from "../careerCountryModel.ts";

export function buildSalaryNegotiationReport(market: CareerCountryProfile | null, offerNative: number) {
  if (!market || market.salary.verificationStatus !== "verified" || !market.salary.sourceCurrency) return { status: "insufficient" as const, market: market ?? null, position: null, discussionRange: null, confidence: "insufficient" as const };
  const { low, typical, high } = market.salary;
  const position = typical === null ? null : offerNative < (low ?? typical) ? "below available market range" : offerNative < typical ? "between the low benchmark and typical value" : high !== null && offerNative > high ? "above the available market range" : offerNative > typical ? "between the typical and high benchmarks" : "at the typical benchmark";
  const discussionRange = typical !== null && high !== null ? { low: typical, high } : null;
  return { status: "ready" as const, market, position, discussionRange, confidence: low !== null && typical !== null && high !== null ? "high" as const : typical !== null ? "medium" as const : "low" as const };
}
