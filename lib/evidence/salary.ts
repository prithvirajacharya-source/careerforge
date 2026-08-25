import type { SalaryPeriod } from "../careerModel.ts";
import type { EvidenceProvenance } from "./types.ts";

export type SalaryEvidenceV2 = { minimum: number | null; maximum: number | null; median: number | null; mean: number | null; percentiles: Record<string, number>; period: SalaryPeriod; grossNet: "gross" | "net" | "unspecified"; nativeCurrency: string; geographicScope: string; occupationClassification: string | null; seniority: string | null; provenance: EvidenceProvenance };
export type NormalizedSalary = { nativeValue: number; nativeCurrency: string; normalizedValue: number | null; normalizedCurrency: string | null; fxRate: number | null; fxTimestamp: string | null; fxSource: string | null };

export function normalizeSalary(value: number, nativeCurrency: string, targetCurrency: string | null, fx: { rate: number; timestamp: string; source: string } | null): NormalizedSalary {
  if (!targetCurrency || targetCurrency === nativeCurrency) return { nativeValue: value, nativeCurrency, normalizedValue: value, normalizedCurrency: nativeCurrency, fxRate: 1, fxTimestamp: null, fxSource: null };
  if (!fx || !Number.isFinite(fx.rate) || fx.rate <= 0) return { nativeValue: value, nativeCurrency, normalizedValue: null, normalizedCurrency: targetCurrency, fxRate: null, fxTimestamp: null, fxSource: null };
  return { nativeValue: value, nativeCurrency, normalizedValue: Math.round(value * fx.rate * 100) / 100, normalizedCurrency: targetCurrency, fxRate: fx.rate, fxTimestamp: fx.timestamp, fxSource: fx.source };
}
