export type UserCareerProfile = {
  currentCountry: string | null;
  targetCountries: string[];
  currentCareer: string | null;
  yearsExperience: number | null;
  educationLevel: string | null;
  skills: string[];
  desiredSalary: number | null;
  desiredSalaryCurrency: string | null;
  remotePreference: "required" | "preferred" | "neutral";
  relocationWillingness: "yes" | "maybe" | "no";
  careerGoals: string | null;
  languages?: string[];
  educationField?: string | null;
  citizenshipRegion?: string | null;
  workAuthorizationStatus?: "authorized" | "requires-permit" | "unknown";
};

export type SavedCareerMarket = {
  careerSlug: string;
  countrySlug: string;
  favorite: boolean;
  alertsEnabled: boolean;
};

export type OpportunityFactor = "salary" | "demand" | "hiringOutlook" | "aiRisk" | "remote" | "educationFit";

export type OpportunityEvidence = Partial<Record<OpportunityFactor, number>>;

export type OpportunityRanking = {
  score: number | null;
  confidence: "high" | "medium" | "low" | "insufficient";
  coverage: number;
  supportedFactors: OpportunityFactor[];
  missingFactors: OpportunityFactor[];
  methodologyVersion: "opportunity-ranking-v1";
};
