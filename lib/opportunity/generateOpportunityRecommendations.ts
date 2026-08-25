import { careerProfiles } from "../careerProfiles.ts";
import { getCareerCountryProfiles } from "../careerCountryProfiles.ts";
import { getAllCountryIntelligence, type CountryIntelligenceData } from "../intelligence/service.ts";
import { parseJobSearchParams, searchJobs } from "../jobs/searchJobs.ts";
import { getCareerSearchQuery } from "../jobs/careerSearchAliases.ts";
import { buildBoundedCandidatePairs, findAdjacentCareers } from "./careerAdjacency.ts";
import { rankOpportunities, scoreOpportunity } from "./opportunityEngine.ts";
import type { OpportunityProfile, OpportunityResponse } from "./types.ts";
import { SEKUR_SCORE_VERSION } from "../scoring/types.ts";
import { getPublishedOpportunityEvidence } from "../evidence/service.ts";

const COUNTRIES: Record<string, { name: string; code: string }> = { "united-states": { name: "United States", code: "US" }, sweden: { name: "Sweden", code: "SE" }, germany: { name: "Germany", code: "DE" } };
export type OpportunityRequest = { profile: OpportunityProfile | null; career?: string | null; countries?: string[]; limit?: number; includeJobs?: boolean };
const withTimeout = <T>(promise: Promise<T>, fallback: T, milliseconds: number) => Promise.race([promise.catch(() => fallback), new Promise<T>((resolve) => setTimeout(() => resolve(fallback), milliseconds))]);

export async function generateOpportunityRecommendations(request: OpportunityRequest): Promise<OpportunityResponse> {
  const allCareers = Object.values(careerProfiles);
  const requestedCareer = request.career ? careerProfiles[request.career] : null;
  const current = requestedCareer ?? (request.profile?.currentCareer ? careerProfiles[request.profile.currentCareer] : null);
  const careers = current ? [current, ...findAdjacentCareers(current, allCareers, 5).map((item) => item.career)] : allCareers;
  const allowedCountries = (request.countries?.length ? request.countries : request.profile?.targetCountries.length ? request.profile.targetCountries : Object.keys(COUNTRIES)).filter((slug) => COUNTRIES[slug]);
  const pool = buildBoundedCandidatePairs(careers, getCareerCountryProfiles, allowedCountries, 40);
  const [countryIntelligence, publishedEvidence] = await Promise.all([withTimeout(getAllCountryIntelligence(), {} as Record<string, CountryIntelligenceData>, 4_000), withTimeout(getPublishedOpportunityEvidence(), { languages: [], workAuthorization: [] }, 4_000)]);
  const swedenCareers = [...new Set(pool.filter((item) => item.market.countrySlug === "sweden").map((item) => item.career.slug))].slice(0, 4);
  const jobEvidence = new Map<string, Awaited<ReturnType<typeof searchJobs>>>();
  if (request.includeJobs !== false) await Promise.all(swedenCareers.map(async (careerSlug) => {
    const params = new URLSearchParams({ career: careerSlug, q: getCareerSearchQuery(careerSlug), country: "sweden", limit: "8" });
    const input = parseJobSearchParams(params); const result = await withTimeout(searchJobs(input), null, 6_000); if (result) jobEvidence.set(careerSlug, result);
  }));
  const candidates = pool.map(({ career, market }) => { const country = COUNTRIES[market.countrySlug]; const jobs = market.countrySlug === "sweden" ? jobEvidence.get(career.slug) : null; const languageEvidence = publishedEvidence.languages.find((item) => item.countrySlug === market.countrySlug && item.careerSlug === career.slug)?.evidence ?? publishedEvidence.languages.find((item) => item.countrySlug === market.countrySlug && item.careerSlug === null)?.evidence ?? null; const workAuthorizationEvidence = request.profile?.citizenshipRegion ? publishedEvidence.workAuthorization.find((item) => item.countrySlug === market.countrySlug && item.originRegion === request.profile?.citizenshipRegion)?.evidence ?? null : null; return scoreOpportunity({ profile: request.profile, career, market, countryName: country.name, countryCode: country.code, countryRows: countryIntelligence[market.countrySlug]?.rows ?? [], jobs: jobs?.results ?? [], liveJobTotal: jobs?.total ?? null, languageEvidence, workAuthorizationEvidence }); });
  return { methodologyVersion: "sekur-opportunity-v2", scoreVersion: SEKUR_SCORE_VERSION, generatedAt: new Date().toISOString(), personalized: Boolean(request.profile?.currentCareer || request.profile?.skills.length), candidatesConsidered: candidates.length, recommendations: rankOpportunities(candidates, Math.min(10, Math.max(1, request.limit ?? 5))) };
}
