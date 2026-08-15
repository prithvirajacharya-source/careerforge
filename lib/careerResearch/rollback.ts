export type RollbackVersion = {
  id: number;
  career_slug: string;
  country_slug: string;
  event_type: "publish" | "rollback";
  after_profile: unknown;
};

export function validateRollbackSelection(
  version: RollbackVersion,
  careerSlug: string,
  countrySlug: string
) {
  if (!Number.isInteger(version.id) || version.id <= 0) {
    throw new Error("A valid publication version is required.");
  }
  if (version.career_slug !== careerSlug || version.country_slug !== countrySlug) {
    throw new Error("Rollback version does not match the selected career market.");
  }
  if (!version.after_profile || typeof version.after_profile !== "object") {
    throw new Error("Rollback version does not contain a restorable profile.");
  }
  return version;
}
