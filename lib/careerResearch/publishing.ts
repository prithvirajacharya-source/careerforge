import type { CareerCountryProfile } from "../careerCountryModel.ts";
import type { CareerResearchCandidate, CareerResearchRunStatus } from "./model.ts";
import { validateCareerResearchCandidate } from "./model.ts";
import { getCareerResearchTarget } from "./registry.ts";

export type PublishableResearchRun = {
  id: number;
  status: CareerResearchRunStatus;
  career_slug: string;
  country_slug: string;
  schema_version: string;
  candidate_profile: CareerResearchCandidate;
  published_at?: string | null;
  published_by?: string | null;
  publication_version_id?: number | null;
};

export function validateCareerResearchPublication(run: PublishableResearchRun) {
  if (run.status !== "approved") {
    throw new Error("Only approved career research runs may be published.");
  }
  if (run.published_at || run.published_by || run.publication_version_id) {
    throw new Error("This career research run has already been published.");
  }
  if (run.schema_version !== "career-research-v1") {
    throw new Error("Unsupported career research candidate schema.");
  }
  const candidate = run.candidate_profile;
  if (
    candidate.careerSlug !== run.career_slug ||
    candidate.countrySlug !== run.country_slug
  ) {
    throw new Error("Candidate target does not match the approved research run.");
  }

  const target = getCareerResearchTarget(run.career_slug, run.country_slug);
  if (!target?.enabled || !["sweden", "united-states"].includes(run.country_slug)) {
    throw new Error("Publishing supports only enabled career research targets.");
  }
  validateCareerResearchCandidate(candidate, target.nativeCurrency);

  const provenance = candidate.salary.typical.provenance;
  if (
    candidate.salary.typical.value === null ||
    !provenance?.sourceName ||
    !provenance.sourceUrl ||
    !provenance.geography ||
    !provenance.observationPeriod ||
    !candidate.salary.methodology ||
    !candidate.salary.verificationStatus
  ) {
    throw new Error(
      "Publication requires typical salary, source, geography, observation period, methodology and verification status."
    );
  }

  return { target, candidate };
}

export function publicationChanges(
  current: CareerCountryProfile,
  candidate: CareerResearchCandidate
) {
  const provenance = candidate.salary.typical.provenance;
  return {
    low: current.salary.low !== candidate.salary.low.value,
    typical: current.salary.typical !== candidate.salary.typical.value,
    high: current.salary.high !== candidate.salary.high.value,
    nativeCurrency: current.salary.sourceCurrency !== candidate.salary.sourceCurrency,
    geography: current.salary.geography !== provenance?.geography,
    observationPeriod: current.salary.observationDate !== provenance?.observationPeriod,
    sourceName: current.salary.sourceName !== provenance?.sourceName,
    sourceUrl: current.salary.sourceUrl !== provenance?.sourceUrl,
    verificationStatus:
      current.salary.verificationStatus !== candidate.salary.verificationStatus,
  };
}
