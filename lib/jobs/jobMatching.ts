import type { JobPosting } from "./types.ts";
import { normalizeSkill } from "./skills.ts";

export type JobMatchProfile = { careerSlug?: string | null; skills?: string[]; countryCode?: string | null; workplaceType?: string | null };
export type JobMatch = { score: number | null; matchedSkills: string[]; missingSkills: string[]; reasons: string[]; breakdown: { skillsMatch: number | null; careerRelevance: number | null; locationFit: number | null; workplaceFit: number | null; experienceMatch: null; educationMatch: null }; positiveFactors: string[]; negativeFactors: string[] };

export function calculateJobMatch(job: JobPosting, profile: JobMatchProfile): JobMatch {
  const known = new Set((profile.skills ?? []).map(normalizeSkill));
  const required = [...new Set(job.skills.map(normalizeSkill))];
  const breakdown = { skillsMatch: required.length && known.size ? Math.round(required.filter((skill) => known.has(skill)).length / required.length * 100) : null, careerRelevance: profile.careerSlug && job.careerSlug ? (profile.careerSlug === job.careerSlug ? 100 : 0) : null, locationFit: profile.countryCode && job.countryCode ? (profile.countryCode === job.countryCode ? 100 : 0) : null, workplaceFit: profile.workplaceType && job.workplaceType ? (profile.workplaceType === job.workplaceType ? 100 : 0) : null, experienceMatch: null, educationMatch: null };
  if (!profile.careerSlug && known.size === 0 && !profile.countryCode && !profile.workplaceType) return { score: null, matchedSkills: [], missingSkills: required, reasons: [], breakdown, positiveFactors: [], negativeFactors: [] };
  const matchedSkills = required.filter((skill) => known.has(skill));
  const missingSkills = required.filter((skill) => !known.has(skill));
  let earned = 0;
  let possible = 0;
  let dimensions = 0;
  if (profile.careerSlug && job.careerSlug) { possible += 35; dimensions += 1; if (profile.careerSlug === job.careerSlug) earned += 35; }
  if (required.length && known.size) { possible += 45; dimensions += 1; earned += 45 * matchedSkills.length / required.length; }
  if (profile.countryCode && job.countryCode) { possible += 10; dimensions += 1; if (profile.countryCode === job.countryCode) earned += 10; }
  if (profile.workplaceType && job.workplaceType) { possible += 10; dimensions += 1; if (profile.workplaceType === job.workplaceType) earned += 10; }
  const score = dimensions >= 2 && possible >= 50 ? Math.round(earned / possible * 100) : null;
  const positiveFactors = [...matchedSkills.slice(0, 4).map((skill) => `${skill} matches the job evidence.`), ...(breakdown.careerRelevance === 100 ? ["The job belongs to your selected career family."] : []), ...(breakdown.locationFit === 100 ? ["The job location matches your country preference."] : [])];
  const negativeFactors = [...missingSkills.slice(0, 4).map((skill) => `${skill} is not present in your profile.`), ...(breakdown.careerRelevance === 0 ? ["The mapped career family differs from your selected career."] : []), ...(breakdown.locationFit === 0 ? ["The job is outside your profile country."] : [])];
  return { score, matchedSkills, missingSkills, reasons: [...positiveFactors, ...negativeFactors], breakdown, positiveFactors, negativeFactors };
}
