import type { EducationResearch, ResearchStatus } from "./careerModel.ts";
import type { CareerCountryProfile, SourcedMarketField } from "./careerCountryModel.ts";
import { unavailableMarketField } from "./careerCountryModel.ts";
import { getCareerCountryProfile } from "./careerCountryProfiles.ts";
import type { ResearchedMetric, SalaryMethodology } from "./careerResearch/model.ts";

export type PublishedCareerMarketProfile = {
  career_slug: string;
  country_slug: string;
  salary_low: number | null;
  salary_typical: number | null;
  salary_high: number | null;
  native_currency: string;
  salary_geography: string;
  source_name: string;
  source_url: string;
  observation_period: string;
  salary_methodology: SalaryMethodology;
  verification_status: ResearchStatus;
  hiring_outlook: ResearchedMetric<string> | null;
  demand: ResearchedMetric<string> | null;
  employment_risk: ResearchedMetric<string> | null;
  education: ResearchedMetric<EducationResearch> | null;
  notes: string[] | null;
};

export type PublishedProfileReader = (
  careerSlug: string,
  countrySlug: string
) => Promise<PublishedCareerMarketProfile | null>;

export const PUBLIC_CAREER_MARKET_PROFILE_COLUMNS = [
  "career_slug",
  "country_slug",
  "native_currency",
  "salary_low",
  "salary_typical",
  "salary_high",
  "salary_methodology",
  "salary_geography",
  "observation_period",
  "source_name",
  "source_url",
  "verification_status",
  "hiring_outlook",
  "demand",
  "employment_risk",
  "education",
  "notes",
].join(",");

function methodologyText(methodology: SalaryMethodology) {
  return `${methodology.lowMeasure} / ${methodology.typicalMeasure} / ${methodology.highMeasure}. ${methodology.normalization}`;
}

function sourcedField(metric: ResearchedMetric<string> | null): SourcedMarketField {
  if (!metric?.value || !metric.provenance) return unavailableMarketField();
  return {
    value: metric.value,
    sourceName: metric.provenance.sourceName,
    sourceUrl: metric.provenance.sourceUrl,
    observationPeriod: metric.provenance.observationPeriod,
    verificationStatus: "verified",
  };
}

export function mapPublishedCareerMarketProfile(
  row: PublishedCareerMarketProfile
): CareerCountryProfile {
  return {
    careerSlug: row.career_slug,
    countrySlug: row.country_slug,
    salary: {
      low: row.salary_low,
      typical: row.salary_typical,
      high: row.salary_high,
      sourceCurrency: row.native_currency,
      geography: row.salary_geography,
      sourceName: row.source_name,
      sourceUrl: row.source_url,
      observationDate: row.observation_period,
      methodology: methodologyText(row.salary_methodology),
      verificationStatus: row.verification_status,
    },
    hiringOutlook: sourcedField(row.hiring_outlook),
    demand: sourcedField(row.demand),
    employmentRisk: sourcedField(row.employment_risk),
    education: row.education?.value ?? null,
    notes: row.notes ?? [],
    dataOrigin: "published",
  };
}

async function readPublishedProfile(careerSlug: string, countrySlug: string) {
  const { supabase } = await import("./supabase.ts");
  const { data, error } = await supabase
    .from("career_market_profiles")
    .select(PUBLIC_CAREER_MARKET_PROFILE_COLUMNS)
    .eq("career_slug", careerSlug)
    .eq("country_slug", countrySlug)
    .maybeSingle();
  if (error) throw error;
  return data as PublishedCareerMarketProfile | null;
}

export async function resolveCareerCountryProfile(
  careerSlug: string,
  countrySlug: string,
  reader: PublishedProfileReader = readPublishedProfile
) {
  const fallback = getCareerCountryProfile(careerSlug, countrySlug);
  try {
    const published = await reader(careerSlug, countrySlug);
    return published ? mapPublishedCareerMarketProfile(published) : fallback;
  } catch {
    return fallback;
  }
}
