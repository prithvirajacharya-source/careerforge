import type { CareerResearchCandidate, EvidenceProvenance } from "./model.ts";
import { unavailableMetric, validateCareerResearchCandidate } from "./model.ts";
import type { CareerResearchTarget } from "./registry.ts";
import { parseDelimitedRows } from "./csv.ts";

export const CANADA_WAGE_CSV = "https://open.canada.ca/data/dataset/adad580f-76b0-4502-bd05-20c125de9116/resource/9da94d63-b178-4a64-aeb3-b6a3bd721ad2/download/2a71-das-wage2025opendata-esdc-all-19nov2025-vf.csv";
export const CANADA_WAGE_SOURCE = "https://open.canada.ca/data/en/dataset/adad580f-76b0-4502-bd05-20c125de9116";

export function normalizeCanadaWageCsv(text: string, target: CareerResearchTarget, retrievedAt: string): CareerResearchCandidate {
  const row = parseDelimitedRows(text).find((item) => item.NOC_CNP === target.occupationCode && item.prov === "NAT" && item.ER_Code_Code_RE === "ER00");
  if (!row) throw new Error(`Canada wage CSV is missing national evidence for ${target.occupationCode}.`);
  if (row.Annual_Wage_Flag_Salaire_annuel !== "0") throw new Error("Canada wage period changed unexpectedly; hourly evidence was expected.");
  const value = (column: string) => {
    const raw = row[column]?.trim();
    if (!raw) return null;
    const parsed = Number(raw);
    if (!Number.isFinite(parsed)) throw new Error(`Malformed Canada wage CSV ${column} value.`);
    return parsed;
  };
  const provenance: EvidenceProvenance = { sourceName: `Government of Canada Job Bank open wage data — ${row.NOC_Title_eng}`, sourceUrl: CANADA_WAGE_SOURCE, geography: "Canada (national)", observationPeriod: row.Reference_Period, retrievedAt };
  const metric = (amount: number | null) => amount === null ? unavailableMetric<number>() : { value: amount, provenance: { ...provenance } };
  const [low, typical, high] = [value("Low_Wage_Salaire_Minium"), value("Median_Wage_Salaire_Median"), value("High_Wage_Salaire_Maximal")];
  if (low === null && typical === null && high === null) throw new Error("Malformed Canada wage CSV: salary distribution missing.");
  const candidate: CareerResearchCandidate = { schemaVersion: "career-research-v1", careerSlug: target.careerSlug, countrySlug: target.countrySlug, researchedAt: retrievedAt, salary: { low: metric(low), typical: metric(typical), high: metric(high), sourceCurrency: "CAD", period: "hourly", methodology: { distribution: "percentiles", lowMeasure: "low wage (normally 10th percentile)", typicalMeasure: "median hourly wage", highMeasure: "high wage (normally 90th percentile)", sourcePeriod: "hourly", normalization: "Official hourly wages retained as hourly evidence; no annualization applied." }, verificationStatus: "verified" }, hiringOutlook: unavailableMetric(), demand: unavailableMetric(), employmentRisk: unavailableMetric(), education: unavailableMetric(), notes: ["Hourly evidence is never converted into annual salary without an authoritative conversion basis."] };
  validateCareerResearchCandidate(candidate, target.nativeCurrency);
  return candidate;
}

export async function collectCanadaCareerResearch(target: CareerResearchTarget) {
  const response = await fetch(CANADA_WAGE_CSV, { next: { revalidate: 21_600 } });
  if (!response.ok) throw new Error(`Canada wage research failed with HTTP ${response.status}.`);
  return normalizeCanadaWageCsv(await response.text(), target, new Date().toISOString());
}
