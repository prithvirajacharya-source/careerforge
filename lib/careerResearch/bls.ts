import type { CareerResearchCandidate, EvidenceProvenance } from "./model.ts";
import { unavailableMetric, validateCareerResearchCandidate } from "./model.ts";
import type { CareerResearchTarget } from "./registry.ts";

export const BLS_PUBLIC_DATA_API =
  "https://api.bls.gov/publicAPI/v2/timeseries/data/";

const BLS_ANNUAL_WAGE_DATATYPES = {
  low: "11",
  typical: "13",
  high: "15",
} as const;

type BlsObservation = {
  year?: string;
  period?: string;
  value?: string;
};

export type BlsOewsResponse = {
  status?: string;
  message?: string[];
  Results?: {
    series?: Array<{ seriesID?: string; data?: BlsObservation[] }>;
  };
};

export function blsOewsSeriesId(socCode: string, datatype: string) {
  const occupation = socCode.replace("-", "");
  if (!/^\d{6}$/.test(occupation) || !/^\d{2}$/.test(datatype)) {
    throw new Error("BLS OEWS series requires a valid six-digit SOC and datatype code.");
  }
  return `OEUN0000000000000${occupation}${datatype}`;
}

export function normalizeBlsOewsResponse(
  response: BlsOewsResponse,
  target: CareerResearchTarget,
  researchedAt: string
): CareerResearchCandidate {
  if (target.sourceType !== "bls-oews-api" || target.countrySlug !== "united-states") {
    throw new Error("BLS OEWS normalization requires a supported United States target.");
  }
  if (response.status !== "REQUEST_SUCCEEDED" || !Array.isArray(response.Results?.series)) {
    throw new Error(`BLS OEWS response failed: ${response.message?.join(" ") || "malformed response"}.`);
  }

  const seriesById = new Map(
    response.Results.series.map((series) => [series.seriesID, series])
  );
  const expectedIds = {
    low: blsOewsSeriesId(target.occupationCode, BLS_ANNUAL_WAGE_DATATYPES.low),
    typical: blsOewsSeriesId(target.occupationCode, BLS_ANNUAL_WAGE_DATATYPES.typical),
    high: blsOewsSeriesId(target.occupationCode, BLS_ANNUAL_WAGE_DATATYPES.high),
  };

  const observations = Object.fromEntries(
    Object.entries(expectedIds).map(([key, seriesId]) => [
      key,
      seriesById.get(seriesId)?.data?.find((item) => item.period === "A01") ?? null,
    ])
  ) as Record<keyof typeof expectedIds, BlsObservation | null>;
  const years = new Set(
    Object.values(observations).flatMap((observation) => observation?.year ? [observation.year] : [])
  );
  if (years.size === 0) throw new Error("BLS OEWS response contains no annual wage observations.");
  if (years.size !== 1) throw new Error("BLS OEWS salary metrics do not share one observation period.");

  const year = [...years][0];
  const observationPeriod = `May ${year}`;
  const sourceUrl = target.sourceUrl;
  if (!sourceUrl) throw new Error("BLS research target is missing its official source URL.");
  const provenance: EvidenceProvenance = {
    sourceName: `U.S. Bureau of Labor Statistics, Occupational Employment and Wage Statistics — ${target.careerName} (SOC ${target.occupationCode})`,
    sourceUrl,
    geography: "United States (national)",
    observationPeriod,
    retrievedAt: researchedAt,
  };

  const metric = (observation: BlsObservation | null) => {
    if (!observation) return unavailableMetric<number>();
    if (!/^\d+(?:\.\d+)?$/.test(observation.value ?? "")) {
      throw new Error("BLS OEWS response contains a malformed annual wage value.");
    }
    return { value: Number(observation.value), provenance: { ...provenance } };
  };

  const candidate: CareerResearchCandidate = {
    schemaVersion: "career-research-v1",
    careerSlug: target.careerSlug,
    countrySlug: target.countrySlug,
    researchedAt,
    salary: {
      low: metric(observations.low),
      typical: metric(observations.typical),
      high: metric(observations.high),
      sourceCurrency: "USD",
      period: "annual",
      methodology: {
        distribution: "percentiles",
        lowMeasure: "10th percentile annual wage",
        typicalMeasure: "median (50th percentile) annual wage",
        highMeasure: "90th percentile annual wage",
        sourcePeriod: "annual",
        normalization: "Official BLS OEWS national annual wage estimates; no FX or annualization applied.",
      },
      verificationStatus: "verified",
    },
    hiringOutlook: unavailableMetric<string>(),
    demand: unavailableMetric<string>(),
    employmentRisk: unavailableMetric<string>(),
    education: unavailableMetric(),
    notes: [
      `Explicit SEKUR mapping: ${target.careerName} uses BLS SOC ${target.occupationCode}.`,
      "Outlook, openings, and education remain unavailable because this OEWS API collection contains wage evidence only.",
    ],
  };

  validateCareerResearchCandidate(candidate, target.nativeCurrency);
  return candidate;
}

export async function collectBlsCareerResearch(target: CareerResearchTarget) {
  const currentYear = new Date().getUTCFullYear();
  const seriesid = Object.values(BLS_ANNUAL_WAGE_DATATYPES).map((datatype) =>
    blsOewsSeriesId(target.occupationCode, datatype)
  );
  const response = await fetch(BLS_PUBLIC_DATA_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      seriesid,
      startyear: String(currentYear - 2),
      endyear: String(currentYear),
    }),
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`BLS OEWS research failed with HTTP ${response.status}.`);
  }
  return normalizeBlsOewsResponse(
    (await response.json()) as BlsOewsResponse,
    target,
    new Date().toISOString()
  );
}
