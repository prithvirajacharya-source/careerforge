import type { CareerProfile } from "../careerModel.ts";
import type { CareerCountryProfile } from "../careerCountryModel.ts";
import { normalizeSkill } from "../jobs/skills.ts";

export type CareerAdjacency = { career: CareerProfile; score: number; sharedSkills: string[]; reasons: string[] };
export function findAdjacentCareers(current: CareerProfile, careers: CareerProfile[], limit = 5): CareerAdjacency[] {
  const sourceSkills = new Set(current.skills.map(normalizeSkill));
  return careers.filter((career) => career.slug !== current.slug).map((career) => {
    const sharedSkills = career.skills.map(normalizeSkill).filter((skill) => sourceSkills.has(skill));
    const related = current.related.some((title) => title.toLowerCase() === career.title.toLowerCase());
    const category = current.category === career.category;
    const skillScore = Math.min(70, sharedSkills.length * 14);
    const score = Math.min(100, skillScore + (category ? 20 : 0) + (related ? 20 : 0));
    return { career, score, sharedSkills, reasons: [...(sharedSkills.length ? [`Shares ${sharedSkills.join(", ")}`] : []), ...(category ? [`Same ${career.category} career family`] : []), ...(related ? ["Listed as a related SEKUR career"] : [])] };
  }).filter((item) => item.score >= 20).sort((a, b) => b.score - a.score || a.career.slug.localeCompare(b.career.slug)).slice(0, limit);
}

export function buildBoundedCandidatePairs(careers: CareerProfile[], marketsForCareer: (careerSlug: string) => CareerCountryProfile[], allowedCountries: string[], limit = 40) {
  return careers.flatMap((career) => marketsForCareer(career.slug).filter((market) => allowedCountries.includes(market.countrySlug)).map((market) => ({ career, market }))).slice(0, Math.min(40, Math.max(1, limit)));
}
