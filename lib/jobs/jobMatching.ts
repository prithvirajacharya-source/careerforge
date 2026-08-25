import type { JobPosting } from "./types.ts";
import { normalizeSkill } from "./skills.ts";
import { extractJobLanguageRequirement } from "../evidence/language.ts";
import { calculateEducationMatch, calculateExperienceMatch, extractEducationRequirement, extractExperienceRequirement } from "../evidence/requirements.ts";

export type JobMatchProfile = { careerSlug?: string | null; skills?: string[]; countryCode?: string | null; workplaceType?: string | null; yearsExperience?: number | null; educationLevel?: string | null; languages?: string[] };
export type JobMatch = { score: number | null; confidence: "high" | "medium" | "low" | "insufficient"; evidenceCoverage: number; matchedSkills: string[]; missingSkills: string[]; reasons: string[]; breakdown: { skillsMatch: number | null; careerRelevance: number | null; locationFit: number | null; workplaceFit: number | null; experienceMatch: number | null; educationMatch: number | null; languageFit: number | null }; positiveFactors: string[]; negativeFactors: string[] };

export function calculateJobMatch(job: JobPosting, profile: JobMatchProfile): JobMatch {
  const known = new Set((profile.skills ?? []).map(normalizeSkill));
  const required = [...new Set(job.skills.map(normalizeSkill))];
  const experienceRequirement = extractExperienceRequirement(job.description);
  const educationRequirement = extractEducationRequirement(job.description);
  const languageRequirement = extractJobLanguageRequirement(job.description);
  const experience = calculateExperienceMatch(profile.yearsExperience, experienceRequirement);
  const education = calculateEducationMatch(profile.educationLevel, educationRequirement);
  const knownLanguages = new Set((profile.languages ?? []).map((value) => value.trim().toLowerCase()));
  const languageFit = languageRequirement && profile.languages?.length ? (knownLanguages.has(languageRequirement.language.toLowerCase()) ? 100 : languageRequirement.mandatory ? 20 : 55) : null;
  const breakdown = { skillsMatch: required.length && known.size ? Math.round(required.filter((skill) => known.has(skill)).length / required.length * 100) : null, careerRelevance: profile.careerSlug && job.careerSlug ? (profile.careerSlug === job.careerSlug ? 100 : 0) : null, locationFit: profile.countryCode && job.countryCode ? (profile.countryCode === job.countryCode ? 100 : 0) : null, workplaceFit: profile.workplaceType && job.workplaceType ? (profile.workplaceType === job.workplaceType ? 100 : 0) : null, experienceMatch: experience.score, educationMatch: education.score, languageFit };
  if (!profile.careerSlug && known.size === 0 && !profile.countryCode && !profile.workplaceType && profile.yearsExperience == null && !profile.educationLevel && !profile.languages?.length) return { score: null, confidence: "insufficient", evidenceCoverage: 0, matchedSkills: [], missingSkills: required, reasons: [], breakdown, positiveFactors: [], negativeFactors: [] };
  const matchedSkills = required.filter((skill) => known.has(skill));
  const missingSkills = required.filter((skill) => !known.has(skill));
  let earned = 0;
  let possible = 0;
  let dimensions = 0;
  if (profile.careerSlug && job.careerSlug) { possible += 35; dimensions += 1; if (profile.careerSlug === job.careerSlug) earned += 35; }
  if (required.length && known.size) { possible += 45; dimensions += 1; earned += 45 * matchedSkills.length / required.length; }
  if (profile.countryCode && job.countryCode) { possible += 10; dimensions += 1; if (profile.countryCode === job.countryCode) earned += 10; }
  if (profile.workplaceType && job.workplaceType) { possible += 10; dimensions += 1; if (profile.workplaceType === job.workplaceType) earned += 10; }
  if (experience.score !== null) { possible += 15; dimensions += 1; earned += 15 * experience.score / 100; }
  if (education.score !== null) { possible += 10; dimensions += 1; earned += 10 * education.score / 100; }
  if (languageFit !== null) { possible += 10; dimensions += 1; earned += 10 * languageFit / 100; }
  const score = dimensions >= 2 && possible >= 50 ? Math.round(earned / possible * 100) : null;
  const evidenceCoverage = Math.min(100, Math.round(possible / 135 * 100));
  const confidence = score === null ? "insufficient" : evidenceCoverage >= 70 ? "high" : evidenceCoverage >= 50 ? "medium" : "low";
  const positiveFactors = [...matchedSkills.slice(0, 4).map((skill) => `${skill} matches the job evidence.`), ...(breakdown.careerRelevance === 100 ? ["The job belongs to your selected career family."] : []), ...(breakdown.locationFit === 100 ? ["The job location matches your country preference."] : []), ...(experience.score === 100 ? [experience.explanation] : []), ...(education.score === 100 ? [education.explanation] : []), ...(languageFit === 100 && languageRequirement ? [`Your profile includes the sourced ${languageRequirement.language} requirement.`] : [])];
  const negativeFactors = [...missingSkills.slice(0, 4).map((skill) => `${skill} is not present in your profile.`), ...(breakdown.careerRelevance === 0 ? ["The mapped career family differs from your selected career."] : []), ...(breakdown.locationFit === 0 ? ["The job is outside your profile country."] : []), ...(experience.score !== null && experience.score < 100 ? [experience.explanation] : []), ...(education.score !== null && education.score < 100 ? [education.explanation] : []), ...(languageFit !== null && languageFit < 100 && languageRequirement ? [`The posting states ${languageRequirement.evidenceText}; that language is not in your profile.`] : [])];
  return { score, confidence, evidenceCoverage, matchedSkills, missingSkills, reasons: [...positiveFactors, ...negativeFactors], breakdown, positiveFactors, negativeFactors };
}
