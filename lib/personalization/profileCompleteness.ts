import type { UserCareerProfile } from "./model.ts";

export type ProfileCompleteness = { score: number; completedWeight: number; nextBestField: keyof UserCareerProfile | null; recommendation: string | null };
const fields: Array<{ key: keyof UserCareerProfile; weight: number; label: string; complete: (profile: UserCareerProfile) => boolean }> = [
  { key: "currentCareer", weight: 20, label: "current career", complete: (p) => Boolean(p.currentCareer) },
  { key: "skills", weight: 20, label: "core skills", complete: (p) => p.skills.length > 0 },
  { key: "targetCountries", weight: 15, label: "target countries", complete: (p) => p.targetCountries.length > 0 },
  { key: "yearsExperience", weight: 12, label: "years of experience", complete: (p) => p.yearsExperience !== null },
  { key: "educationLevel", weight: 10, label: "education level", complete: (p) => Boolean(p.educationLevel) },
  { key: "languages", weight: 10, label: "languages", complete: (p) => (p.languages?.length ?? 0) > 0 },
  { key: "relocationWillingness", weight: 8, label: "relocation preference", complete: (p) => Boolean(p.relocationWillingness) },
  { key: "desiredSalary", weight: 5, label: "salary expectation", complete: (p) => p.desiredSalary !== null },
];

export function calculateProfileCompleteness(profile: UserCareerProfile): ProfileCompleteness {
  const completedWeight = fields.filter((field) => field.complete(profile)).reduce((sum, field) => sum + field.weight, 0);
  const next = fields.filter((field) => !field.complete(profile)).sort((a, b) => b.weight - a.weight)[0] ?? null;
  return { score: completedWeight, completedWeight, nextBestField: next?.key ?? null, recommendation: next ? `Add your ${next.label} to improve recommendation quality most.` : null };
}
