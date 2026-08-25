import { getCareerCatalogEntry } from "../careerCatalog.ts";

const CURATED: Record<string, string[]> = {
  "mechanical-engineer": ["mechanical engineer", "design engineer", "product development engineer", "test engineer"],
  "electrical-engineer": ["electrical engineer", "electronics engineer", "power systems engineer"],
  "software-engineer": ["software engineer", "software developer", "backend developer", "frontend developer"],
  "data-scientist": ["data scientist", "machine learning engineer", "data analyst"],
  "cybersecurity-analyst": ["cybersecurity analyst", "security analyst", "SOC analyst"],
  "automation-engineer": ["automation engineer", "controls engineer", "PLC engineer"],
};

export function getCareerSearchAliases(slug: string) {
  const entry = getCareerCatalogEntry(slug);
  if (!entry) return [];
  return CURATED[slug] ?? [entry.title, entry.title.replace(/\s+(specialist|engineer)$/i, "")].filter(Boolean);
}

export function getCareerSearchQuery(slug: string) {
  return getCareerSearchAliases(slug)[0] ?? "";
}
