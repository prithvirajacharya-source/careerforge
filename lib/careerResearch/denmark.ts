import type { CareerResearchCandidate, EvidenceProvenance } from "./model.ts";
import { unavailableMetric, validateCareerResearchCandidate } from "./model.ts";
import type { CareerResearchTarget } from "./registry.ts";
import { parseDelimitedRows } from "./csv.ts";

export const DENMARK_SALARY_API = "https://api.statbank.dk/v1/data";
export const DENMARK_SALARY_TABLE = "https://www.statbank.dk/LONS20";

async function latestDenmarkPeriod() {
  const response = await fetch("https://api.statbank.dk/v1/tableinfo/LONS20?lang=en", { cache: "no-store" });
  if (!response.ok) throw new Error(`Statistics Denmark metadata failed with HTTP ${response.status}.`);
  const metadata = await response.json() as { variables?: Array<{ id: string; values: Array<{ id: string }> }> };
  const periods = metadata.variables?.find(({ id }) => id === "Tid")?.values ?? [];
  const latest = periods.at(-1)?.id;
  if (!latest) throw new Error("Malformed Statistics Denmark metadata: latest period missing.");
  return latest;
}

export function normalizeDenmarkSalaryCsv(text: string, target: CareerResearchTarget, retrievedAt: string): CareerResearchCandidate {
  const rows = parseDelimitedRows(text, ";");
  const valueFor = (label: string) => {
    const row = rows.find((item) => item.ARBF?.startsWith(target.occupationCode) && item["LØNMÅL"]?.toLowerCase().startsWith(label));
    if (!row) return null;
    const value = Number(row.INDHOLD);
    if (!Number.isFinite(value)) throw new Error("Malformed Statistics Denmark hourly wage value.");
    return value;
  };
  const observationPeriod = rows.find((item) => item.ARBF?.startsWith(target.occupationCode))?.TID;
  if (!observationPeriod) throw new Error("Malformed Statistics Denmark response: occupation or period missing.");
  const provenance: EvidenceProvenance = { sourceName: `Statistics Denmark StatBank LONS20 — DISCO-08 ${target.occupationCode}`, sourceUrl: DENMARK_SALARY_TABLE, geography: "Denmark (national, all sectors and sexes)", observationPeriod, retrievedAt };
  const metric = (value: number | null) => value === null ? unavailableMetric<number>() : { value, provenance: { ...provenance } };
  const [low, typical, high] = [valueFor("lower quartile"), valueFor("median"), valueFor("upper quartile")];
  if (low === null && typical === null && high === null) throw new Error("Malformed Statistics Denmark response: salary distribution missing.");
  const candidate: CareerResearchCandidate = { schemaVersion: "career-research-v1", careerSlug: target.careerSlug, countrySlug: target.countrySlug, researchedAt: retrievedAt, salary: { low: metric(low), typical: metric(typical), high: metric(high), sourceCurrency: "DKK", period: "hourly", methodology: { distribution: "quartiles", lowMeasure: "lower quartile hourly earnings", typicalMeasure: "median hourly earnings", highMeasure: "upper quartile hourly earnings", sourcePeriod: "hourly", normalization: "Official hourly earnings retained as hourly evidence; no annualization applied." }, verificationStatus: "verified" }, hiringOutlook: unavailableMetric(), demand: unavailableMetric(), employmentRisk: unavailableMetric(), education: unavailableMetric(), notes: ["Hourly evidence is never converted into annual salary without an authoritative conversion basis."] };
  validateCareerResearchCandidate(candidate, target.nativeCurrency);
  return candidate;
}

export async function collectDenmarkCareerResearch(target: CareerResearchTarget) {
  const latestPeriod = await latestDenmarkPeriod();
  const response = await fetch(DENMARK_SALARY_API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ table: "LONS20", format: "CSV", lang: "en", variables: [{ code: "ARBF", values: [target.occupationCode] }, { code: "SEKTOR", values: ["1000"] }, { code: "AFLOEN", values: ["TIFA"] }, { code: "LONGRP", values: ["LTOT"] }, { code: "LØNMÅL", values: ["NEDRE", "MEDIAN", "OVRE"] }, { code: "KØN", values: ["MOK"] }, { code: "Tid", values: [latestPeriod] }] }), cache: "no-store" });
  if (!response.ok) throw new Error(`Statistics Denmark salary research failed with HTTP ${response.status}.`);
  return normalizeDenmarkSalaryCsv(await response.text(), target, new Date().toISOString());
}
