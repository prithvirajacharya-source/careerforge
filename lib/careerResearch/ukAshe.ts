import { assertArchiveFileTypes, discoverOnsAsheRelease, inspectZipArchive, readXlsxSheet, selectUniqueArchiveEntry } from "./bulkRelease.ts";
import type { CareerResearchCandidate, EvidenceProvenance } from "./model.ts";
import { unavailableMetric, validateCareerResearchCandidate } from "./model.ts";
import type { CareerResearchTarget } from "./registry.ts";

export const ONS_ASHE_DATASET_URL = "https://www.ons.gov.uk/employmentandlabourmarket/peopleinwork/earningsandworkinghours/datasets/occupation4digitsoc2010ashetable14";

function salaryValue(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "" || ["x", "..", ":", "-"].includes(String(value).trim())) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) throw new Error(`Malformed ONS ASHE salary value: ${value}.`);
  return parsed;
}

export function normalizeOnsAsheWorkbook(bytes: Uint8Array, target: CareerResearchTarget, release: { year: string; downloadUrl: string }, retrievedAt: string): CareerResearchCandidate {
  const rows = readXlsxSheet(bytes, "Full-Time");
  const title = String(rows[0]?.[0] ?? "");
  if (!title.includes("Table 14.7a") || !title.includes("Annual pay - Gross") || !title.includes("United Kingdom") || !title.includes(release.year)) {
    throw new Error("ONS ASHE workbook schema changed: expected annual gross UK title was not found.");
  }
  const headers = rows[4] ?? [];
  if (headers[0] !== "Description" || headers[1] !== "Code" || headers[3] !== "Median" || Number(headers[7]) !== 10 || Number(headers[16]) !== 90) {
    throw new Error("ONS ASHE workbook schema changed: expected Code, Median, 10th and 90th percentile columns were not found.");
  }
  const row = rows.find((item) => String(item?.[1] ?? "") === target.occupationCode);
  if (!row) throw new Error(`ONS ASHE workbook is missing SOC 2020 occupation ${target.occupationCode}.`);
  const [low, typical, high] = [salaryValue(row[7]), salaryValue(row[3]), salaryValue(row[16])];
  if (low === null && typical === null && high === null) throw new Error("ONS ASHE salary distribution is unavailable for this occupation.");
  const provenance: EvidenceProvenance = { sourceName: `Office for National Statistics ASHE Table 14.7a — SOC 2020 ${target.occupationCode} ${String(row[0]).trim()}`, sourceUrl: release.downloadUrl, geography: "United Kingdom (national, full-time employee jobs, all sexes)", observationPeriod: `${release.year} provisional`, retrievedAt };
  const metric = (value: number | null) => value === null ? unavailableMetric<number>() : { value, provenance: { ...provenance } };
  const candidate: CareerResearchCandidate = { schemaVersion: "career-research-v1", careerSlug: target.careerSlug, countrySlug: target.countrySlug, researchedAt: retrievedAt, salary: { low: metric(low), typical: metric(typical), high: metric(high), sourceCurrency: "GBP", period: "annual", methodology: { distribution: "percentiles", lowMeasure: "10th percentile gross annual pay", typicalMeasure: "median gross annual pay", highMeasure: "90th percentile gross annual pay", sourcePeriod: "annual", normalization: "ONS gross annual pay retained as annual GBP evidence; suppressed cells remain unavailable." }, verificationStatus: "verified" }, hiringOutlook: unavailableMetric(), demand: unavailableMetric(), employmentRisk: unavailableMetric(), education: unavailableMetric(), notes: ["ASHE covers employee jobs and excludes self-employed workers. Full-time means more than 30 paid hours weekly, or at least 25 hours for teaching professions."] };
  validateCareerResearchCandidate(candidate, target.nativeCurrency);
  return candidate;
}

export async function collectOnsAsheCareerResearch(target: CareerResearchTarget) {
  const page = await fetch(ONS_ASHE_DATASET_URL, { next: { revalidate: 21_600 } });
  if (!page.ok) throw new Error(`ONS ASHE release discovery failed with HTTP ${page.status}.`);
  const release = discoverOnsAsheRelease(await page.text(), ONS_ASHE_DATASET_URL);
  const response = await fetch(release.downloadUrl, { next: { revalidate: 21_600 } });
  if (!response.ok) throw new Error(`ONS ASHE release download failed with HTTP ${response.status}.`);
  const archive = inspectZipArchive(new Uint8Array(await response.arrayBuffer()));
  assertArchiveFileTypes(archive, [".xlsx"]);
  const [, workbook] = selectUniqueArchiveEntry(archive, /Table 14\.7a\s+Annual pay - Gross[^/]*\.xlsx$/i);
  return normalizeOnsAsheWorkbook(workbook, target, release, new Date().toISOString());
}
