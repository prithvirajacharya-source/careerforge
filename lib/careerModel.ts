export type ResearchStatus = "verified" | "estimated" | "needs-research";
export type SalaryPeriod = "hourly" | "weekly" | "monthly" | "annual";

export function salaryPeriodUnit(period: SalaryPeriod | undefined) {
  return period === "hourly" ? "hour" : period === "weekly" ? "week" : period === "monthly" ? "month" : "year";
}

export type SalaryResearch = {
  low: number | null;
  typical: number | null;
  high: number | null;
  sourceCurrency: string | null;
  period?: SalaryPeriod;
  geography: string | null;
  sourceName: string | null;
  sourceUrl: string | null;
  observationDate: string | null;
  methodology: string | null;
  verificationStatus: ResearchStatus;
};

export type EducationResearch = {
  typicalEducation: string | null;
  degreeRequirement: string | null;
  commonFields: string[];
  alternativePathways: string[];
  certifications: string[];
  regulatedProfessionStatus?: "regulated" | "partially-regulated" | "not-generally-regulated" | null;
  licensingRequirements?: string[];
  verificationStatus: ResearchStatus;
};

export type CareerCountryOpportunity = {
  flag: string;
  country: string;
  earningPotential: string;
  demand: string;
};

export type CareerLearningItem = {
  title: string;
  type: string;
};

export type CareerProfile = {
  slug: string;
  title: string;
  category: string;
  score: number;
  description: string;
  salary: SalaryResearch | null;
  legacySalaryLabel?: string;
  hiring: string;
  layoffs: string;
  aiRisk: string;
  remote: string;
  education: EducationResearch | null;
  legacyEducationLabel?: string;
  workLife: string;
  demand: string;
  countries: CareerCountryOpportunity[];
  skills: string[];
  roadmap: string[];
  courses: CareerLearningItem[];
  legacyCertifications: string[];
  related: string[];
};

export type CareerListRecord = {
  id: number | string;
  slug: string;
  title: string;
  category: string | null;
  description: string | null;
  education: string | null;
  ai_risk: string | null;
  remote_work: string | null;
  career_score: number | null;
  profile?: CareerProfile;
};

export function researchPendingSalary(): SalaryResearch {
  return {
    low: null,
    typical: null,
    high: null,
    sourceCurrency: null,
    period: "annual",
    geography: null,
    sourceName: null,
    sourceUrl: null,
    observationDate: null,
    methodology: null,
    verificationStatus: "needs-research",
  };
}

export function researchPendingEducation(): EducationResearch {
  return {
    typicalEducation: null,
    degreeRequirement: null,
    commonFields: [],
    alternativePathways: [],
    certifications: [],
    verificationStatus: "needs-research",
  };
}

export function hasCompleteSalaryRange(salary: SalaryResearch | null) {
  return Boolean(
    salary &&
      salary.low !== null &&
      salary.typical !== null &&
      salary.high !== null &&
      salary.sourceCurrency
  );
}

export function educationSummary(
  education: EducationResearch | null,
  legacyLabel?: string | null
) {
  if (education?.typicalEducation) {
    return education.typicalEducation;
  }

  if (education?.verificationStatus === "needs-research") {
    return "Research required";
  }

  return legacyLabel || "Not specified";
}
