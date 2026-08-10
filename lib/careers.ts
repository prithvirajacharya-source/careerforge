import { supabase } from "./supabase";
import { CareerListRecord, educationSummary } from "./careerModel";
import { getCareerProfile } from "./careerProfiles";

export async function getCareers() {
  const { data, error } = await supabase
    .from("careers")
    .select("*")
    .order("career_score", { ascending: false });

  if (error) {
    console.error("Error loading careers:", error);
    return [];
  }

  return ((data ?? []) as CareerListRecord[]).map((career) => {
    const profile = getCareerProfile(career.slug);

    if (!profile) {
      return career;
    }

    return {
      ...career,
      title: profile.title,
      category: profile.category,
      description: profile.description,
      education: educationSummary(profile.education, profile.legacyEducationLabel),
      ai_risk: profile.aiRisk,
      remote_work: profile.remote,
      career_score: profile.score,
      profile,
    };
  });
}
