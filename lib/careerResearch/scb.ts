import type { CareerResearchCandidate, EvidenceProvenance } from "./model.ts";
import { unavailableMetric, validateCareerResearchCandidate } from "./model.ts";
import type { CareerResearchTarget } from "./registry.ts";

export const SCB_SALARY_API =
  "https://api.scb.se/OV0104/v1/doris/sv/ssd/AM/AM0110/AM0110A/LoneSpridSektYrk4AN";
export const SCB_SALARY_TABLE =
  "https://www.statistikdatabasen.scb.se/goto/sv/ssd/LoneSpridSektYrk4AN";

type JsonStatDimension = {
  category?: { index?: Record<string, number>; label?: Record<string, string> };
};

type ScbJsonStat = {
  id?: string[];
  size?: number[];
  dimension?: Record<string, JsonStatDimension>;
  value?: Array<number | null>;
};

export function normalizeScbSalaryResponse(
  dataset: ScbJsonStat,
  target: CareerResearchTarget,
  researchedAt: string
): CareerResearchCandidate {
  const occupationIndex = dataset.dimension?.Yrke2012?.category?.index?.[target.occupationCode];
  const contentIndex = dataset.dimension?.ContentsCode?.category?.index;
  const values = dataset.value;

  if (occupationIndex === undefined || !contentIndex || !values) {
    throw new Error("SCB response is missing the requested occupation or salary dimensions.");
  }

  const contentSize = dataset.size?.[3];
  if (!contentSize) {
    throw new Error("SCB response does not declare its salary-content dimension.");
  }

  const readMonthly = (code: string) => {
    const measureIndex = contentIndex[code];
    if (measureIndex === undefined) return null;
    const value = values[occupationIndex * contentSize + measureIndex];
    return typeof value === "number" && Number.isFinite(value) ? value : null;
  };

  const lowMonthly = readMonthly("000007CF");
  const typicalMonthly = readMonthly("000007CE");
  const highMonthly = readMonthly("000007CI");
  const observationPeriod =
    Object.keys(dataset.dimension?.Tid?.category?.index ?? {})[0] ?? "Unknown";
  const occupationLabel =
    dataset.dimension?.Yrke2012?.category?.label?.[target.occupationCode] ??
    `SSYK ${target.occupationCode}`;

  const provenance: EvidenceProvenance = {
    sourceName: `Statistics Sweden (SCB) / Medlingsinstitutet — ${occupationLabel}`,
    sourceUrl: SCB_SALARY_TABLE,
    geography: "Sweden (national, all sectors and sexes)",
    observationPeriod,
    retrievedAt: researchedAt,
  };

  const annualMetric = (monthly: number | null) =>
    monthly === null
      ? unavailableMetric<number>()
      : { value: monthly * 12, provenance: { ...provenance } };

  const candidate: CareerResearchCandidate = {
    schemaVersion: "career-research-v1",
    careerSlug: target.careerSlug,
    countrySlug: target.countrySlug,
    researchedAt,
    salary: {
      low: annualMetric(lowMonthly),
      typical: annualMetric(typicalMonthly),
      high: annualMetric(highMonthly),
      sourceCurrency: target.nativeCurrency,
      methodology: {
        distribution: "percentiles",
        lowMeasure: "10th percentile",
        typicalMeasure: "median (50th percentile)",
        highMeasure: "90th percentile",
        sourcePeriod: "monthly",
        normalization: "Monthly full-time-equivalent values annualized by multiplying by 12.",
      },
      verificationStatus: "verified",
    },
    hiringOutlook: unavailableMetric<string>(),
    demand: unavailableMetric<string>(),
    employmentRisk: unavailableMetric<string>(),
    education: unavailableMetric(),
    notes: [
      "No unsupported outlook, demand, risk, or education values were inferred from salary evidence.",
    ],
  };

  validateCareerResearchCandidate(candidate, target.nativeCurrency);
  return candidate;
}

export async function collectScbCareerResearch(target: CareerResearchTarget) {
  const response = await fetch(SCB_SALARY_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: [
        { code: "Sektor", selection: { filter: "item", values: ["0"] } },
        { code: "Yrke2012", selection: { filter: "item", values: [target.occupationCode] } },
        { code: "Kon", selection: { filter: "item", values: ["1+2"] } },
        { code: "ContentsCode", selection: { filter: "item", values: ["000007CF", "000007CE", "000007CI"] } },
        { code: "Tid", selection: { filter: "top", values: ["1"] } },
      ],
      response: { format: "json-stat2" },
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`SCB salary research failed with HTTP ${response.status}.`);
  }

  return normalizeScbSalaryResponse(
    (await response.json()) as ScbJsonStat,
    target,
    new Date().toISOString()
  );
}
