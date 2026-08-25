import type { CareerCountryProfile } from "./careerCountryModel.ts";
import { getCareerCatalogEntry } from "./careerCatalog.ts";
import { getCountryCatalogEntry } from "./countryCatalog.ts";

export type CareerMarketEligibility = {
  catalogAvailable: boolean;
  evidenceAvailable: boolean;
  rankEligible: boolean;
  publishable: boolean;
  coverage: "verified" | "limited" | "discoverable";
};

export function careerMarketEligibility(
  careerSlug: string,
  countrySlug: string,
  profile: CareerCountryProfile | null,
  publishable = false
): CareerMarketEligibility {
  const catalogAvailable = Boolean(getCareerCatalogEntry(careerSlug) && getCountryCatalogEntry(countrySlug));
  const salary = profile?.salary;
  const verifiedTypical = salary?.verificationStatus === "verified" && salary.typical !== null && Boolean(salary.sourceCurrency && salary.sourceName && salary.sourceUrl && salary.observationDate);
  const evidenceAvailable = Boolean(profile && (verifiedTypical || profile.hiringOutlook.value || profile.demand.value));
  const comparableMarketSignal = Boolean(profile?.hiringOutlook.value || profile?.demand.value);
  const rankEligible = Boolean(verifiedTypical && comparableMarketSignal);
  const fullRange = Boolean(salary && salary.low !== null && salary.typical !== null && salary.high !== null);
  const coverage = !evidenceAvailable ? "discoverable" : fullRange && rankEligible ? "verified" : "limited";

  return { catalogAvailable, evidenceAvailable, rankEligible, publishable: Boolean(publishable && evidenceAvailable), coverage };
}

export function publicCoverageMessage(coverage: CareerMarketEligibility["coverage"]) {
  if (coverage === "limited") return "Limited market data available.";
  if (coverage === "discoverable") return "We're still expanding data for this opportunity.";
  return null;
}
