import type { UserCareerProfile } from "./model.ts";

export function normalizeStringList(values: string[], maximum: number) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))].slice(0, maximum);
}

export function validateUserCareerProfile(profile: UserCareerProfile) {
  if (profile.yearsExperience !== null && (!Number.isFinite(profile.yearsExperience) || profile.yearsExperience < 0 || profile.yearsExperience > 80)) {
    throw new Error("Years of experience must be between 0 and 80.");
  }
  if (profile.desiredSalary !== null && (!Number.isFinite(profile.desiredSalary) || profile.desiredSalary < 0)) {
    throw new Error("Desired salary must be a non-negative number.");
  }
  if (profile.desiredSalary !== null && !/^[A-Z]{3}$/.test(profile.desiredSalaryCurrency ?? "")) {
    throw new Error("Desired salary requires a valid three-letter currency.");
  }
  if (profile.skills.length > 100 || profile.targetCountries.length > 25) {
    throw new Error("Profile list limits were exceeded.");
  }
  if ((profile.careerGoals?.length ?? 0) > 2000) throw new Error("Career goals must be 2,000 characters or fewer.");
  return profile;
}

export function savedTargetKey(item: { itemType: "career" | "country" | "career_market"; careerSlug?: string | null; countrySlug?: string | null }) {
  const { itemType, careerSlug = null, countrySlug = null } = item;
  if (itemType === "career" && careerSlug && !countrySlug) return `${itemType}:${careerSlug}`;
  if (itemType === "country" && countrySlug && !careerSlug) return `${itemType}:${countrySlug}`;
  if (itemType === "career_market" && careerSlug && countrySlug) return `${itemType}:${careerSlug}:${countrySlug}`;
  throw new Error("Saved target shape is invalid.");
}
