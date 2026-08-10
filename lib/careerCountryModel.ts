import type {
  EducationResearch,
  ResearchStatus,
  SalaryResearch,
} from "./careerModel.ts";

export type SourcedMarketField = {
  value: string | null;
  sourceName: string | null;
  sourceUrl: string | null;
  observationPeriod: string | null;
  verificationStatus: ResearchStatus;
};

export type CareerCountryProfile = {
  careerSlug: string;
  countrySlug: string;
  salary: SalaryResearch;
  hiringOutlook: SourcedMarketField;
  demand: SourcedMarketField;
  employmentRisk: SourcedMarketField;
  education: EducationResearch | null;
  notes: string[];
};

export type CareerCountryMarket = {
  slug: string;
  name: string;
  code: string;
  currency: string | null;
};

export function unavailableMarketField(): SourcedMarketField {
  return {
    value: null,
    sourceName: null,
    sourceUrl: null,
    observationPeriod: null,
    verificationStatus: "needs-research",
  };
}

export function careerCountryKey(careerSlug: string, countrySlug: string) {
  return `${careerSlug}:${countrySlug}`;
}
