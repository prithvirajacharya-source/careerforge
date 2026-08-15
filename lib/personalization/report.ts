import type { CareerCountryProfile } from "../careerCountryModel.ts";
import type { CareerProfile } from "../careerModel.ts";
import type { UserCareerProfile } from "./model.ts";
import { calculateOpportunityRanking } from "./ranking.ts";

const aiRiskScore: Record<string, number> = { "Very Low": 95, Low: 85, Medium: 55, High: 20 };
const remoteScore: Record<"required" | "preferred", Record<string, number>> = {
  required: { High: 100, Medium: 50, Low: 10 },
  preferred: { High: 90, Medium: 70, Low: 30 },
};

export type OpportunityReportMarket = {
  careerSlug: string;
  countrySlug: string;
  salary: CareerCountryProfile["salary"];
  hiringOutlook: CareerCountryProfile["hiringOutlook"];
  demand: CareerCountryProfile["demand"];
  education: CareerCountryProfile["education"];
  dataOrigin: CareerCountryProfile["dataOrigin"];
  ranking: ReturnType<typeof calculateOpportunityRanking>;
  factorBreakdown: Parameters<typeof calculateOpportunityRanking>[0];
  limitations: string[];
  nextActions: string[];
};

export function generateOpportunityReport(profile: UserCareerProfile, career: CareerProfile, markets: CareerCountryProfile[]) {
  const selected = markets.filter(market => profile.targetCountries.includes(market.countrySlug));
  const results: OpportunityReportMarket[] = selected.map(market => {
    const evidence: Parameters<typeof calculateOpportunityRanking>[0] = {};
    if (profile.desiredSalary && profile.desiredSalaryCurrency === market.salary.sourceCurrency && market.salary.typical !== null) {
      evidence.salary = Math.min(100, Math.round((market.salary.typical / profile.desiredSalary) * 100));
    }
    if (aiRiskScore[career.aiRisk] !== undefined) evidence.aiRisk = aiRiskScore[career.aiRisk];
    if (profile.remotePreference !== "neutral" && remoteScore[profile.remotePreference][career.remote] !== undefined) evidence.remote = remoteScore[profile.remotePreference][career.remote];
    const limitations = [
      ...(market.hiringOutlook.value ? [] : ["Hiring outlook is unavailable for this market."]),
      ...(market.demand.value ? [] : ["Demand evidence is unavailable for this market."]),
      ...(profile.desiredSalaryCurrency !== market.salary.sourceCurrency ? ["Salary-goal fit is not scored because the goal and native market salary use different currencies."] : []),
      ...(market.education ? [] : ["Country-specific education and licensing evidence is unavailable."]),
    ];
    const nextActions = [
      `Review the ${market.salary.geography} salary source and observation period.`,
      ...(market.education?.certifications?.length ? [`Verify whether these credentials apply to you: ${market.education.certifications.join(", ")}.`] : ["Confirm qualification and licensing requirements with the responsible authority."]),
      "Validate relocation, work authorization and tax questions with qualified official or professional sources.",
    ];
    return { careerSlug: career.slug, countrySlug: market.countrySlug, salary: market.salary, hiringOutlook: market.hiringOutlook, demand: market.demand, education: market.education, dataOrigin: market.dataOrigin, ranking: calculateOpportunityRanking(evidence), factorBreakdown: evidence, limitations, nextActions };
  });
  results.sort((a, b) => (b.ranking.score ?? -1) - (a.ranking.score ?? -1) || b.ranking.coverage - a.ranking.coverage);
  return { methodologyVersion: "opportunity-ranking-v1" as const, generatedAt: new Date().toISOString(), careerSlug: career.slug, markets: results, disclaimer: "SEKUR provides career intelligence, not immigration, legal, tax, licensing or visa advice." };
}

export function opportunityRankLabel(markets: OpportunityReportMarket[], index: number) {
  if (markets[index]?.ranking.score === null) return "Insufficient evidence for ranking";
  const rank = markets.slice(0, index + 1).filter(market => market.ranking.score !== null).length;
  return `#${rank} ranked market`;
}
