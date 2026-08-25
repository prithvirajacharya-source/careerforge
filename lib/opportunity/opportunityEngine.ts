import type { CareerProfile } from "../careerModel.ts";
import type { CareerCountryProfile } from "../careerCountryModel.ts";
import type { CountryIntelligenceRow } from "../intelligence/service.ts";
import type { JobPosting } from "../jobs/types.ts";
import { calculateJobMatch } from "../jobs/jobMatching.ts";
import { normalizeSkill } from "../jobs/skills.ts";
import { recommendForMissingSkills } from "../learning/recommendStudyResources.ts";
import { OPPORTUNITY_WEIGHTS } from "./opportunityWeights.ts";
import type { OpportunityCandidate, OpportunityFactor, OpportunityFactorKey, OpportunityProfile } from "./types.ts";
import { calculateOpportunityScore } from "../scoring/opportunityScore.ts";
import type { OpportunityScoreInput } from "../scoring/types.ts";
import { calculateLanguageFit, type LanguageEvidence } from "../evidence/language.ts";
import { assessWorkAuthorization, type WorkAuthorizationEvidence } from "../evidence/workAuthorization.ts";

const labels: Record<OpportunityFactorKey, string> = { careerFit: "Career fit", jobMatch: "Job match", liveJobs: "Live jobs", hiring: "Hiring market", salaryFit: "Salary fit", safety: "Safety", costOfLiving: "Cost of living", visaResidency: "Visa / residency", healthcare: "Healthcare" };
const marketScore = (value: string | null) => { if (!value) return null; const text = value.toLowerCase(); if (/very strong|large opportunities|much faster/.test(text)) return 95; if (/strong|increase|faster/.test(text)) return 85; if (/good/.test(text)) return 75; if (/stable|average/.test(text)) return 65; if (/weak|decline|limited/.test(text)) return 35; return null; };
const factorRow = (rows: CountryIntelligenceRow[], keys: string[]) => rows.find((row) => keys.includes(row.factor_key));
const factor = (key: OpportunityFactorKey, score: number | null, explanation: string): OpportunityFactor => ({ key, label: labels[key], score, weight: OPPORTUNITY_WEIGHTS[key], explanation, sourceAvailable: score !== null });
const median = (values: number[]) => { const sorted = [...values].sort((a, b) => a - b); return sorted.length ? sorted[Math.floor(sorted.length / 2)] : null; };
const educationRank = (value: string | null | undefined) => { const text = value?.toLowerCase() ?? ""; if (/doctor|phd/.test(text)) return 4; if (/master/.test(text)) return 3; if (/bachelor|degree/.test(text)) return 2; if (/secondary|high school|diploma/.test(text)) return 1; return null; };

export function scoreOpportunity(input: { profile: OpportunityProfile | null; career: CareerProfile; market: CareerCountryProfile; countryName: string; countryCode: string; countryRows?: CountryIntelligenceRow[]; jobs?: JobPosting[]; liveJobTotal?: number | null; languageEvidence?: LanguageEvidence | null; workAuthorizationEvidence?: WorkAuthorizationEvidence | null }): OpportunityCandidate {
  const { profile, career, market, countryRows = [], jobs = [], liveJobTotal = null } = input;
  const personalized = Boolean(profile?.currentCareer || profile?.skills.length);
  const known = new Set((profile?.skills ?? []).map(normalizeSkill)); const careerSkills = career.skills.map(normalizeSkill);
  const existingSkills = careerSkills.filter((skill) => known.has(skill)); const missingCareerSkills = careerSkills.filter((skill) => !known.has(skill));
  let careerFit: number | null = career.score;
  if (profile?.currentCareer || known.size) { const careerIdentity = profile?.currentCareer === career.slug ? 55 : 20; const overlap = careerSkills.length && known.size ? 45 * existingSkills.length / careerSkills.length : 0; careerFit = Math.round(careerIdentity + overlap); }
  const matches = jobs.map((job) => calculateJobMatch(job, { careerSlug: profile?.currentCareer, skills: profile?.skills, countryCode: input.countryCode, workplaceType: profile?.remotePreference === "required" ? "remote" : null })).filter((match) => match.score !== null);
  const jobMatch = median(matches.map((match) => match.score as number));
  const commonMissing = [...new Set(matches.flatMap((match) => match.missingSkills))].slice(0, 6);
  const hiringValues = [marketScore(market.hiringOutlook.value), marketScore(market.demand.value)].filter((value): value is number => value !== null);
  const hiring = hiringValues.length ? Math.round(hiringValues.reduce((a, b) => a + b, 0) / hiringValues.length) : null;
  const salaryFit = profile?.desiredSalary && profile.desiredSalaryCurrency === market.salary.sourceCurrency && market.salary.typical !== null && (market.salary.period ?? "annual") === "annual" ? Math.min(100, Math.round(market.salary.typical / profile.desiredSalary * 100)) : null;
  const liveJobs = liveJobTotal === null ? null : Math.min(100, Math.round(35 + Math.log10(liveJobTotal + 1) * 25));
  const safetyRow = factorRow(countryRows, ["safety"]); const costRow = factorRow(countryRows, ["cost_of_living", "cost-of-living"]); const visaRow = factorRow(countryRows, ["visa", "visa_residency", "visa-and-residency"]); const healthcareRow = factorRow(countryRows, ["healthcare"]);
  const factors = [
    factor("careerFit", careerFit, personalized ? `${existingSkills.length} of ${careerSkills.length} mapped career skills are present in your profile.` : `General SEKUR career quality: ${career.score}/100.`),
    factor("jobMatch", jobMatch, jobMatch === null ? "No defensible profile-to-job aggregate is available." : `Median deterministic match across ${matches.length} sampled live jobs.`),
    factor("liveJobs", liveJobs, liveJobTotal === null ? "Trusted live-job coverage is unavailable for this market." : `${liveJobTotal} current results reported by the trusted provider for this search.`),
    factor("hiring", hiring, hiring === null ? "Verified hiring and demand evidence is unavailable." : "Derived from published SEKUR hiring and demand evidence."),
    factor("salaryFit", salaryFit, salaryFit === null ? "Salary fit is unavailable without a same-currency annual goal." : "Verified typical salary compared with your same-currency annual goal."),
    factor("safety", safetyRow?.score ?? null, safetyRow ? "Current published SEKUR Safety factor." : "Published Safety evidence is unavailable."),
    factor("costOfLiving", costRow?.score ?? null, costRow ? "Current published SEKUR cost-of-living factor." : "Cost-of-living evidence is unavailable."),
    factor("visaResidency", visaRow?.score ?? null, visaRow ? "Current published SEKUR visa/residency factor." : "Visa/residency evidence is unavailable."),
    factor("healthcare", healthcareRow?.score ?? null, healthcareRow ? "Current published SEKUR healthcare factor." : "Healthcare evidence is unavailable."),
  ];
  const missingSkills = commonMissing.length ? commonMissing : missingCareerSkills.slice(0, 6);
  const countryFit = !profile ? null : profile.targetCountries.includes(market.countrySlug) ? 95 : profile.currentCountry === market.countrySlug ? 85 : profile.relocationWillingness === "no" ? 20 : profile.relocationWillingness === "yes" ? 70 : 55;
  const skillsMatch = !known.size || !careerSkills.length ? null : Math.round(existingSkills.length / careerSkills.length * 100);
  const profileEducationRank = educationRank(profile?.educationLevel); const requiredEducationRank = educationRank(market.education?.typicalEducation ?? career.education?.typicalEducation); const educationMatch = profileEducationRank === null || requiredEducationRank === null ? null : profileEducationRank >= requiredEducationRank ? 100 : 40;
  const demandScore = marketScore(market.hiringOutlook.value);
  const growthScore = marketScore(market.demand.value);
  const jobMarketDemand = demandScore !== null && liveJobs !== null ? Math.round((demandScore + liveJobs) / 2) : demandScore ?? liveJobs;
  const languageFit = calculateLanguageFit(profile?.languages ?? [], input.languageEvidence ?? null);
  const workAuthorization = assessWorkAuthorization(input.workAuthorizationEvidence ?? null);
  const scoreInput: OpportunityScoreInput = {
    careerFit: { score: careerFit, evidence: personalized ? `${existingSkills.length} of ${careerSkills.length} mapped skills align with this career.` : "General published SEKUR career quality." },
    countryFit: { score: countryFit, evidence: countryFit === null ? "Profile country preferences are unavailable." : profile?.targetCountries.includes(market.countrySlug) ? "This country is one of your selected targets." : profile?.currentCountry === market.countrySlug ? "This opportunity is in your current country." : "This market is outside your selected targets." },
    jobMarketDemand: { score: jobMarketDemand, evidence: demandScore !== null && liveJobs !== null ? "Published hiring outlook combined with current trusted-provider availability." : demandScore !== null ? "Published SEKUR hiring outlook." : liveJobs !== null ? "Current trusted-provider job availability." : "Demand evidence is unavailable." },
    salaryPotential: { score: salaryFit, evidence: salaryFit === null ? "A same-currency annual salary goal is required." : "Verified native-market salary compared with your annual goal." },
    costOfLivingEfficiency: { score: costRow?.score ?? null, evidence: costRow ? "Current published SEKUR cost-of-living factor." : "Cost-of-living evidence is unavailable.", sourceName: costRow?.source_name, sourceUrl: costRow?.source_url },
    visaRelocationFeasibility: { score: workAuthorization.score ?? visaRow?.score ?? null, evidence: workAuthorization.score !== null ? `${workAuthorization.explanation} ${workAuthorization.legalNotice}` : visaRow ? "Current published SEKUR visa/residency factor. Verify rules with the relevant authority before acting." : "Visa/residency evidence is unavailable.", sourceName: input.workAuthorizationEvidence?.provenance.sourceName ?? visaRow?.source_name, sourceUrl: input.workAuthorizationEvidence?.provenance.sourceUrl ?? visaRow?.source_url },
    safety: { score: safetyRow?.score ?? null, evidence: safetyRow ? "Current published SEKUR Safety factor." : "Published Safety evidence is unavailable.", sourceName: safetyRow?.source_name, sourceUrl: safetyRow?.source_url },
    skillsMatch: { score: skillsMatch, evidence: skillsMatch === null ? "Profile skills are insufficient for a skills score." : `${existingSkills.length} of ${careerSkills.length} mapped career skills align.` },
    experienceMatch: { score: null, evidence: "No verified role-level experience requirement is available." },
    educationMatch: { score: educationMatch, evidence: educationMatch === null ? "No safely comparable profile-to-role education requirement is available." : educationMatch === 100 ? "Your stated education meets the published typical level." : "Your stated education is below the published typical level." },
    languageFit: { score: languageFit.score, evidence: languageFit.explanation, sourceName: input.languageEvidence?.provenance.sourceName, sourceUrl: input.languageEvidence?.provenance.sourceUrl },
    longTermGrowth: { score: growthScore, evidence: growthScore === null ? "Long-term demand evidence is unavailable." : "Derived from published SEKUR demand evidence." },
  };
  const scoreBreakdown = calculateOpportunityScore(scoreInput);
  const scoreStrengths = scoreBreakdown.explanations.filter((item) => item.kind === "positive").map((item) => item.message);
  const scoreTradeoffs = scoreBreakdown.explanations.filter((item) => item.kind === "negative" || item.kind === "warning").map((item) => item.message);
  const actionPlan = [
    { horizon: "immediate" as const, action: "Review the evidence gaps in this report and complete the highest-value missing profile field." },
    ...(missingSkills.length ? [{ horizon: "next-30-days" as const, action: `Build demonstrable evidence of ${missingSkills.slice(0, 3).join(", ")}.` }] : []),
    { horizon: "next-3-months" as const, action: `Compare ${career.title} in ${input.countryName} with the next ranked market and track meaningful evidence changes.` },
    ...(liveJobTotal !== null ? [{ horizon: "before-applying" as const, action: "Review current job postings and verify every employer-specific requirement on the source." }] : []),
    { horizon: "before-relocation" as const, action: "Verify current language, work-authorization and qualification rules with the relevant authorities." },
  ];
  return { countrySlug: market.countrySlug, countryName: input.countryName, countryCode: input.countryCode, careerSlug: career.slug, careerName: career.title, opportunityScore: scoreBreakdown.overallScore, confidence: scoreBreakdown.confidence === "insufficient" ? "limited" : scoreBreakdown.confidence, evidenceCoverage: scoreBreakdown.evidenceCoverage, personalized, ranking: null, factors, strengths: scoreStrengths.slice(0, 4), tradeoffs: [...scoreTradeoffs, ...factors.filter((item) => item.score === null).slice(0, 2).map((item) => item.explanation)].slice(0, 4), missingData: scoreBreakdown.components.filter((item) => item.score === null).map((item) => item.label), existingSkills: existingSkills.slice(0, 6), missingSkills, nextActions: actionPlan.map((item) => item.action), actionPlan, liveJobCount: liveJobTotal, representativeJobs: jobs.slice(0, 3), studyRecommendations: recommendForMissingSkills(missingSkills, 3), scoreBreakdown, comparisonToTop: null };
}

export function rankOpportunities(candidates: OpportunityCandidate[], limit = 5) {
  const sorted = [...candidates].sort((a, b) => (b.opportunityScore ?? -1) - (a.opportunityScore ?? -1) || b.evidenceCoverage - a.evidenceCoverage || `${a.countrySlug}:${a.careerSlug}`.localeCompare(`${b.countrySlug}:${b.careerSlug}`)).slice(0, limit);
  const top = sorted[0];
  return sorted.map((candidate, index) => { const comparisonToTop = index === 0 || !top ? null : { improves: candidate.scoreBreakdown.components.filter((item) => { const topScore = top.scoreBreakdown.components.find((other) => other.key === item.key)?.score; return item.score !== null && topScore !== null && topScore !== undefined && item.score >= topScore + 5; }).map((item) => item.label).slice(0, 2), worsens: candidate.scoreBreakdown.components.filter((item) => { const topScore = top.scoreBreakdown.components.find((other) => other.key === item.key)?.score; return item.score !== null && topScore !== null && topScore !== undefined && item.score <= topScore - 5; }).map((item) => item.label).slice(0, 2) }; return { ...candidate, ranking: candidate.opportunityScore === null ? null : index + 1, comparisonToTop }; });
}
