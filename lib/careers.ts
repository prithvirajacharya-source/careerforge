import { supabase } from "./supabase";
import { CareerListRecord, educationSummary } from "./careerModel";
import { careerProfiles, getCareerProfile } from "./careerProfiles";
import { CAREER_CATALOG } from "./careerCatalog";

const CAREER_LIST_READ_TIMEOUT_MS = 3_500;

function fallbackCareers(): CareerListRecord[] {
  return CAREER_CATALOG.map((entry) => {
    const profile = careerProfiles[entry.slug];
    return {
      id: entry.slug,
      slug: entry.slug,
      title: entry.title,
      category: entry.category,
      description: profile?.description ?? entry.description,
      education: profile ? educationSummary(profile.education, profile.legacyEducationLabel) : null,
      ai_risk: profile?.aiRisk ?? null,
      remote_work: profile?.remote ?? null,
      career_score: profile?.score ?? null,
      profile,
    };
  });
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

  const rows = new Map((data ?? []).map((career) => [career.slug, career]));
  return fallbackCareers().map((catalogCareer) => {
    const row = rows.get(catalogCareer.slug);
    const profile = getCareerProfile(catalogCareer.slug);
    if (!row) return catalogCareer;
    return {
      ...row,
      ...catalogCareer,
      profile,
    };
  });
}
