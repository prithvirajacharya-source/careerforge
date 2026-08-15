import { supabase } from "./supabase";
import { CareerListRecord, educationSummary } from "./careerModel";
import { careerProfiles, getCareerProfile } from "./careerProfiles";

const CAREER_LIST_READ_TIMEOUT_MS = 3_500;

function fallbackCareers(): CareerListRecord[] {
  return Object.values(careerProfiles)
    .sort((left, right) => right.score - left.score)
    .map((profile) => ({
      id: profile.slug,
      slug: profile.slug,
      title: profile.title,
      category: profile.category,
      description: profile.description,
      education: educationSummary(profile.education, profile.legacyEducationLabel),
      ai_risk: profile.aiRisk,
      remote_work: profile.remote,
      career_score: profile.score,
      profile,
    }));
}

export async function getCareers() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CAREER_LIST_READ_TIMEOUT_MS);
  let data: CareerListRecord[] | null = null;
  let error: unknown = null;
  try {
    const result = await supabase
      .from("careers")
      .select("*")
      .order("career_score", { ascending: false })
      .abortSignal(controller.signal);
    data = result.data as CareerListRecord[] | null;
    error = result.error;
  } catch (caught) {
    error = caught;
  } finally {
    clearTimeout(timeout);
  }

  if (error) {
    console.error("Error loading careers:", error);
    return fallbackCareers();
  }

  if (!data?.length) return fallbackCareers();

  return (data ?? []).map((career) => {
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
