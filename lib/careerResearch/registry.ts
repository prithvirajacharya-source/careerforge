export type CareerResearchTarget = {
  careerSlug: string;
  careerName: string;
  countrySlug: string;
  countryName: string;
  countryCode: string;
  nativeCurrency: string;
  sourceType: "scb-pxweb";
  occupationCode: string;
  endpoint: string;
  enabled: boolean;
};

export const CAREER_RESEARCH_TARGETS: CareerResearchTarget[] = [
  {
    careerSlug: "mechanical-engineer",
    careerName: "Mechanical Engineer",
    countrySlug: "sweden",
    countryName: "Sweden",
    countryCode: "SE",
    nativeCurrency: "SEK",
    sourceType: "scb-pxweb",
    occupationCode: "2144",
    endpoint: "/api/research/career-market",
    enabled: true,
  },
  {
    careerSlug: "cybersecurity-analyst",
    careerName: "Cybersecurity Analyst",
    countrySlug: "sweden",
    countryName: "Sweden",
    countryCode: "SE",
    nativeCurrency: "SEK",
    sourceType: "scb-pxweb",
    occupationCode: "2516",
    endpoint: "/api/research/career-market",
    enabled: true,
  },
  {
    careerSlug: "software-engineer",
    careerName: "Software Engineer",
    countrySlug: "sweden",
    countryName: "Sweden",
    countryCode: "SE",
    nativeCurrency: "SEK",
    sourceType: "scb-pxweb",
    occupationCode: "2512",
    endpoint: "/api/research/career-market",
    enabled: true,
  },
  {
    careerSlug: "electrical-engineer",
    careerName: "Electrical Engineer",
    countrySlug: "sweden",
    countryName: "Sweden",
    countryCode: "SE",
    nativeCurrency: "SEK",
    sourceType: "scb-pxweb",
    occupationCode: "2143",
    endpoint: "/api/research/career-market",
    enabled: true,
  },
  {
    careerSlug: "data-scientist",
    careerName: "Data Scientist",
    countrySlug: "sweden",
    countryName: "Sweden",
    countryCode: "SE",
    nativeCurrency: "SEK",
    sourceType: "scb-pxweb",
    occupationCode: "2122",
    endpoint: "/api/research/career-market",
    enabled: true,
  },
  {
    careerSlug: "registered-nurse",
    careerName: "Registered Nurse",
    countrySlug: "sweden",
    countryName: "Sweden",
    countryCode: "SE",
    nativeCurrency: "SEK",
    sourceType: "scb-pxweb",
    occupationCode: "2221",
    endpoint: "/api/research/career-market",
    enabled: true,
  },
  {
    careerSlug: "accountant",
    careerName: "Accountant",
    countrySlug: "sweden",
    countryName: "Sweden",
    countryCode: "SE",
    nativeCurrency: "SEK",
    sourceType: "scb-pxweb",
    occupationCode: "3313",
    endpoint: "/api/research/career-market",
    enabled: true,
  },
];

export const CAREER_RESEARCH_CAREERS = CAREER_RESEARCH_TARGETS.map(
  ({ careerSlug: slug, careerName: name }) => ({ slug, name })
);

export const CAREER_RESEARCH_COUNTRIES = [
  { slug: "united-states", name: "United States" },
  { slug: "sweden", name: "Sweden" },
  { slug: "germany", name: "Germany" },
] as const;

export function getCareerResearchTarget(careerSlug: string, countrySlug: string) {
  return (
    CAREER_RESEARCH_TARGETS.find(
      (target) =>
        target.careerSlug === careerSlug && target.countrySlug === countrySlug
    ) ?? null
  );
}

export function isCareerResearchSupported(careerSlug: string, countrySlug: string) {
  return Boolean(getCareerResearchTarget(careerSlug, countrySlug)?.enabled);
}
