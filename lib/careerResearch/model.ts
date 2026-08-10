import type { EducationResearch, ResearchStatus } from "../careerModel.ts";

export type EvidenceProvenance = {
  sourceName: string;
  sourceUrl: string;
  geography: string;
  observationPeriod: string;
  retrievedAt: string;
};

export type ResearchedMetric<T> = {
  value: T | null;
  provenance: EvidenceProvenance | null;
};

export type SalaryMethodology = {
  distribution: "percentiles" | "quartiles" | "other";
  lowMeasure: string;
  typicalMeasure: string;
  highMeasure: string;
  sourcePeriod: "annual" | "monthly";
  normalization: string;
};

export type CareerResearchCandidate = {
  schemaVersion: "career-research-v1";
  careerSlug: string;
  countrySlug: string;
  researchedAt: string;
  salary: {
    low: ResearchedMetric<number>;
    typical: ResearchedMetric<number>;
    high: ResearchedMetric<number>;
    sourceCurrency: string;
    methodology: SalaryMethodology;
    verificationStatus: ResearchStatus;
  };
  hiringOutlook: ResearchedMetric<string>;
  demand: ResearchedMetric<string>;
  employmentRisk: ResearchedMetric<string>;
  education: ResearchedMetric<EducationResearch>;
  notes: string[];
};

export type CareerResearchRunStatus =
  | "pending_review"
  | "approved"
  | "rejected"
  | "failed";

export function unavailableMetric<T>(): ResearchedMetric<T> {
  return { value: null, provenance: null };
}

export function validateCareerResearchCandidate(
  candidate: CareerResearchCandidate,
  expectedCurrency: string
) {
  if (candidate.salary.sourceCurrency !== expectedCurrency) {
    throw new Error(
      `Local salary evidence must use ${expectedCurrency}; received ${candidate.salary.sourceCurrency}.`
    );
  }

  const values = [
    candidate.salary.low,
    candidate.salary.typical,
    candidate.salary.high,
  ];

  for (const metric of values) {
    if (metric.value === null) {
      if (metric.provenance !== null) {
        throw new Error("Unavailable salary values cannot carry invented provenance.");
      }
      continue;
    }

    if (!Number.isFinite(metric.value) || metric.value < 0) {
      throw new Error("Salary values must be finite non-negative numbers.");
    }

    if (!metric.provenance?.sourceUrl || !metric.provenance.sourceName) {
      throw new Error("Every salary value must retain source provenance.");
    }
  }

  const low = candidate.salary.low.value;
  const typical = candidate.salary.typical.value;
  const high = candidate.salary.high.value;

  if (low !== null && typical !== null && low > typical) {
    throw new Error("Salary low cannot exceed typical salary.");
  }

  if (typical !== null && high !== null && typical > high) {
    throw new Error("Typical salary cannot exceed salary high.");
  }
}
