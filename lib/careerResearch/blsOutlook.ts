import type { EducationResearch } from "../careerModel.ts";
import type { EvidenceProvenance, OutlookResearch, ResearchedMetric } from "./model.ts";

const BLS_PROJECTIONS_URL = "https://www.bls.gov/emp/tables/occupational-projections-and-characteristics.htm";

type BlsCareerDepth = {
  growth: number;
  openings: number;
  oohUrl: string;
  education: Omit<EducationResearch, "verificationStatus">;
};

const bachelor = (commonFields: string[], extras: Partial<BlsCareerDepth["education"]> = {}): BlsCareerDepth["education"] => ({
  typicalEducation: "Bachelor's degree",
  degreeRequirement: "BLS typical education needed for entry: Bachelor's degree",
  commonFields,
  alternativePathways: [],
  certifications: [],
  regulatedProfessionStatus: "not-generally-regulated",
  licensingRequirements: [],
  ...extras,
});

export const BLS_CAREER_DEPTH: Record<string, BlsCareerDepth> = {
  "mechanical-engineer": { growth: 9.1, openings: 18_100, oohUrl: "https://www.bls.gov/ooh/architecture-and-engineering/mechanical-engineers.htm", education: bachelor(["Mechanical engineering", "Mechanical engineering technology"], { regulatedProfessionStatus: "partially-regulated", licensingRequirements: ["A state-issued Professional Engineer license is required for engineers who sell services directly to the public."] }) },
  "cybersecurity-analyst": { growth: 28.5, openings: 16_000, oohUrl: "https://www.bls.gov/ooh/computer-and-information-technology/information-security-analysts.htm", education: bachelor(["Computer science", "Information technology", "Engineering", "Mathematics"], { alternativePathways: ["Some workers enter with relevant industry training and certifications."], certifications: ["Employers may prefer professional information-security certification."] }) },
  "software-engineer": { growth: 15.8, openings: 115_200, oohUrl: "https://www.bls.gov/ooh/computer-and-information-technology/software-developers.htm", education: bachelor(["Computer and information technology", "Engineering", "Mathematics"]) },
  "electrical-engineer": { growth: 7.2, openings: 11_700, oohUrl: "https://www.bls.gov/ooh/architecture-and-engineering/electrical-and-electronics-engineers.htm", education: bachelor(["Electrical engineering", "Electronics engineering", "Related engineering fields"]) },
  "data-scientist": { growth: 33.5, openings: 23_400, oohUrl: "https://www.bls.gov/ooh/math/data-scientists.htm", education: bachelor(["Mathematics", "Statistics", "Computer science", "Business", "Engineering"], { degreeRequirement: "BLS typical education needed for entry: Bachelor's degree; some employers require or prefer a master's or doctoral degree." }) },
  "registered-nurse": { growth: 4.9, openings: 189_100, oohUrl: "https://www.bls.gov/ooh/healthcare/registered-nurses.htm", education: { typicalEducation: "Bachelor's degree", degreeRequirement: "BLS projections classify a bachelor's degree as typical for entry; licensed graduates may also qualify through an associate degree or approved nursing diploma.", commonFields: ["Nursing"], alternativePathways: ["Associate degree in nursing", "Diploma from an approved nursing program", "RN-to-BSN program"], certifications: ["Optional specialty certification may be required by some employers."], regulatedProfessionStatus: "regulated", licensingRequirements: ["Registered nurses must be licensed by the state in which they practice."] } },
  "accountant": { growth: 4.6, openings: 124_200, oohUrl: "https://www.bls.gov/ooh/business-and-financial/accountants-and-auditors.htm", education: bachelor(["Accounting", "Business"], { regulatedProfessionStatus: "partially-regulated", licensingRequirements: ["Accountants filing reports with the U.S. Securities and Exchange Commission must be licensed Certified Public Accountants."] }) },
};

export function getBlsCareerDepth(careerSlug: string, researchedAt: string): {
  outlook: ResearchedMetric<OutlookResearch>;
  education: ResearchedMetric<EducationResearch>;
} | null {
  const item = BLS_CAREER_DEPTH[careerSlug];
  if (!item) return null;
  const outlookProvenance: EvidenceProvenance = { sourceName: "U.S. Bureau of Labor Statistics, Employment Projections", sourceUrl: BLS_PROJECTIONS_URL, geography: "United States (national)", observationPeriod: "2024–2034", retrievedAt: researchedAt };
  const educationProvenance: EvidenceProvenance = { sourceName: "U.S. Bureau of Labor Statistics, Occupational Outlook Handbook", sourceUrl: item.oohUrl, geography: "United States (national)", observationPeriod: "2024–2034 edition", retrievedAt: researchedAt };
  return {
    outlook: { value: { projectedGrowthPercent: item.growth, annualOpenings: item.openings, forecastPeriod: "2024–2034", methodology: "BLS National Employment Matrix projected employment change and annual average occupational openings." }, provenance: outlookProvenance },
    education: { value: { ...item.education, verificationStatus: "verified" }, provenance: educationProvenance },
  };
}
