import type { CareerCountryProfile } from "../careerCountryModel.ts";
import type { CareerProfile } from "../careerModel.ts";

export type CareerSwitchInput = { currentCareerSlug: string; targetCareerSlug: string; currentCountrySlug: string; targetCountrySlug: string; skills: string[]; educationLevel: string | null; yearsExperience: number | null; timeHorizon: string };

export function buildCareerSwitchPlan(input: CareerSwitchInput, careers: CareerProfile[], markets: CareerCountryProfile[]) {
  const currentCareer = careers.find(c => c.slug === input.currentCareerSlug);
  const targetCareer = careers.find(c => c.slug === input.targetCareerSlug);
  const currentMarket = markets.find(m => m.careerSlug === input.currentCareerSlug && m.countrySlug === input.currentCountrySlug);
  const targetMarket = markets.find(m => m.careerSlug === input.targetCareerSlug && m.countrySlug === input.targetCountrySlug);
  if (!currentCareer || !targetCareer) throw new Error("Select supported careers.");
  const normalizedSkills = new Set(input.skills.map(skill => skill.trim().toLowerCase()).filter(Boolean));
  const skillGaps = targetCareer.skills.filter(skill => !normalizedSkills.has(skill.toLowerCase()));
  const sameSalaryPeriod = (currentMarket?.salary.period ?? "annual") === (targetMarket?.salary.period ?? "annual");
  const salaryDifference = sameSalaryPeriod && currentMarket?.salary.typical !== null && targetMarket?.salary.typical !== null && currentMarket?.salary.sourceCurrency === targetMarket?.salary.sourceCurrency
    ? (targetMarket?.salary.typical ?? 0) - (currentMarket?.salary.typical ?? 0) : null;
  const limitations = [
    ...(!currentMarket ? ["Current-market evidence is unavailable."] : []),
    ...(!targetMarket ? ["Target-market evidence is unavailable."] : []),
    ...(currentMarket && targetMarket && currentMarket.salary.sourceCurrency !== targetMarket.salary.sourceCurrency ? ["Salary difference is not calculated across different native currencies."] : []),
    ...(currentMarket && targetMarket && !sameSalaryPeriod ? ["Salary difference is not calculated across different evidence periods."] : []),
    ...(!targetMarket?.education ? ["Country-specific education and certification evidence is unavailable."] : []),
  ];
  return { currentCareer, targetCareer, currentMarket: currentMarket ?? null, targetMarket: targetMarket ?? null, salaryDifference, skillGaps, educationGap: targetMarket?.education?.typicalEducation ?? null, certificationGaps: targetMarket?.education?.certifications ?? [], confidence: targetMarket?.salary.verificationStatus === "verified" ? (targetMarket.education ? "medium" : "low") : "insufficient", limitations, nextSteps: [skillGaps.length ? `Prioritize evidence of: ${skillGaps.slice(0, 5).join(", ")}.` : "Document transferable skills with concrete examples.", targetMarket?.education ? "Compare your education with the published pathway evidence." : "Confirm education and licensing requirements with the responsible authority.", "Validate work authorization separately; SEKUR does not determine visa eligibility."], timeHorizon: input.timeHorizon };
}
