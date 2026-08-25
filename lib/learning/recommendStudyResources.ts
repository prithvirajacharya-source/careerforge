import { normalizeSkill } from "../jobs/skills.ts";
import { STUDY_RESOURCES } from "./studyResources.ts";
import type { StudyRecommendation } from "./types.ts";

export function recommendStudyResources(skills: string[], limit = 6): StudyRecommendation[] {
  const wanted = new Set(skills.map(normalizeSkill));
  return STUDY_RESOURCES.map((resource) => { const matchedSkills = resource.skills.filter((skill) => wanted.has(normalizeSkill(skill))); return { resource, matchedSkills, reason: matchedSkills.length ? `Build ${matchedSkills.join(" and ")} skills used in this career.` : "" }; }).filter((item) => item.matchedSkills.length).sort((a, b) => b.matchedSkills.length - a.matchedSkills.length).slice(0, limit);
}

export function recommendForMissingSkills(skills: string[], limit = 3) { return recommendStudyResources(skills, limit); }
