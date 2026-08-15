export const ALERT_TYPES = ["salary_updated", "new_verified_data", "hiring_outlook_updated", "source_freshness_changed", "career_score_changed"] as const;
export type AlertType = typeof ALERT_TYPES[number];

export function validateAlertPreferences(types: readonly string[]) {
  const unique = [...new Set(types)];
  if (!unique.length) throw new Error("Select at least one alert type.");
  if (unique.some(type => !ALERT_TYPES.includes(type as AlertType))) throw new Error("Unsupported alert type.");
  return unique as AlertType[];
}
