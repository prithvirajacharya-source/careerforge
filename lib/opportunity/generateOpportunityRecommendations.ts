import { careerProfiles } from "../careerProfiles.ts";
import { getCareerCountryProfiles } from "../careerCountryProfiles.ts";
import { getAllCountryIntelligence } from "../intelligence/service.ts";
import { parseJobSearchParams, searchJobs } from "../jobs/searchJobs.ts";
import { getCareerSearchQuery } from "../jobs/careerSearchAliases.ts";
import { buildBoundedCandidatePairs, findAdjacentCareers } from "./careerAdjacency.ts";
import { rankOpportunities, scoreOpportunity } from "./opportunityEngine.ts";
import type { OpportunityProfile, OpportunityResponse } from "./types.ts";
import { SEKUR_SCORE_VERSION } from "../scoring/types.ts";

const COUNTRIES: Record<string, { name: string; code: string }> = { "united-states": { name: "United States", code: "US" }, sweden: { name: "Sweden", code: "SE" }, germany: { name: "Germany", code: "DE" } };
export type OpportunityRequest = { profile: OpportunityProfile | null; career?: string | null; countries?: string[]; limit?: number; includeJobs?: boolean };

export async function generateOpportunityRecommendations(request: OpportunityRequest): Promise<OpportunityResponse> {
  const allCareers = Object.values(careerProfiles);
  const requestedCareer = request.career ? careerProfiles[request.career] : null;
  const current = requestedCareer ?? (request.profile?.currentCareer ? careerProfiles[request.profile.currentCareer] : null);
  const careers = current ? [current, ...findAdjacentCareers(current, allCareers, 5).map((item) => item.career)] : allCareers;
  const allowedCountries = (request.countries?.length ? request.countries : request.profile?.targetCountries.length ? request.profile.targetCountries : Object.keys(COUNTRIES)).filter((slug) => COUNTRIES[slug]);
  const pool = buildBoundedCandidatePairs(careers, getCareerCountryProfiles, allowedCountries, 40);
  const countryIntelligence: Awaited<ReturnType<typeof getAllCountryIntelligence>> = await getAllCountryIntelligence().catch(() => ({}));
  const swedenCareers = [...new Set(pool.filter((item) => item.market.countrySlug === "sweden").map((item) => item.career.slug))].slice(0, 4);
  const jobEvidence = new Map<string, Awaited<ReturnType<typeof searchJobs>>>();
  if (request.includeJobs !== false) await Promise.all(swedenCareers.map(async (careerSlug) => {
    const params = new URLSearchParams({ career: careerSlug, q: getCareerSearchQuery(careerSlug), country: "sweden", limit: "8" });
    const input = parseJobSearchParams(params); const result = await searchJobs(input).catch(() => null); if (result) jobEvidence.set(careerSlug, result);
  }));
  const candidates = pool.map(({ career, market }) => { const country = COUNTRIES[market.countrySlug]; const jobs = market.countrySlug === "sweden" ? jobEvidence.get(career.slug) : null; return scoreOpportunity({ profile: request.profile, career, market, countryName: country.name, countryCode: country.code, countryRows: countryIntelligence[market.countrySlug]?.rows ?? [], jobs: jobs?.results ?? [], liveJobTotal: jobs?.total ?? null }); });
  return { methodologyVersion: "sekur-opportunity-v2", scoreVersion: SEKUR_SCORE_VERSION, generatedAt: new Date().toISOString(), personalized: Boolean(request.profile?.currentCareer || request.profile?.skills.length), candidatesConsidered: candidates.length, recommendations: rankOpportunities(candidates, Math.min(10, Math.max(1, request.limit ?? 5))) };
}
