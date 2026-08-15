import { CAREER_RESEARCH_COUNTRY_SOURCES } from "./countryRegistry.ts";

export type CareerResearchTarget = {
  careerSlug: string;
  careerName: string;
  countrySlug: string;
  countryName: string;
  countryCode: string;
  nativeCurrency: string;
  sourceType: "scb-pxweb" | "bls-oews-api" | "ssb-pxweb" | "statfin-pxweb";
  occupationCode: string;
  sourceUrl?: string;
  endpoint: string;
  enabled: boolean;
};

export const CAREER_RESEARCH_TARGETS: CareerResearchTarget[] = [
  { careerSlug:"mechanical-engineer",careerName:"Mechanical Engineer",countrySlug:"norway",countryName:"Norway",countryCode:"NO",nativeCurrency:"NOK",sourceType:"ssb-pxweb",occupationCode:"2144",sourceUrl:"https://www.ssb.no/en/statbank/table/11418",endpoint:"/api/research/career-market",enabled:true },
  { careerSlug:"registered-nurse",careerName:"Registered Nurse",countrySlug:"norway",countryName:"Norway",countryCode:"NO",nativeCurrency:"NOK",sourceType:"ssb-pxweb",occupationCode:"2221",sourceUrl:"https://www.ssb.no/en/statbank/table/11418",endpoint:"/api/research/career-market",enabled:true },
  { careerSlug:"mechanical-engineer",careerName:"Mechanical Engineer",countrySlug:"finland",countryName:"Finland",countryCode:"FI",nativeCurrency:"EUR",sourceType:"statfin-pxweb",occupationCode:"2144",sourceUrl:"https://pxweb2.stat.fi/PxWeb/pxweb/en/StatFin/StatFin__pra/15au.px/",endpoint:"/api/research/career-market",enabled:true },
  { careerSlug:"registered-nurse",careerName:"Registered Nurse",countrySlug:"finland",countryName:"Finland",countryCode:"FI",nativeCurrency:"EUR",sourceType:"statfin-pxweb",occupationCode:"2221",sourceUrl:"https://pxweb2.stat.fi/PxWeb/pxweb/en/StatFin/StatFin__pra/15au.px/",endpoint:"/api/research/career-market",enabled:true },
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
  {
    careerSlug: "mechanical-engineer",
    careerName: "Mechanical Engineer",
    countrySlug: "united-states",
    countryName: "United States",
    countryCode: "US",
    nativeCurrency: "USD",
    sourceType: "bls-oews-api",
    occupationCode: "17-2141",
    sourceUrl: "https://www.bls.gov/oes/current/oes172141.htm",
    endpoint: "/api/research/career-market",
    enabled: true,
  },
  {
    careerSlug: "cybersecurity-analyst",
    careerName: "Cybersecurity Analyst",
    countrySlug: "united-states",
    countryName: "United States",
    countryCode: "US",
    nativeCurrency: "USD",
    sourceType: "bls-oews-api",
    occupationCode: "15-1212",
    sourceUrl: "https://www.bls.gov/oes/current/oes151212.htm",
    endpoint: "/api/research/career-market",
    enabled: true,
  },
  {
    careerSlug: "software-engineer",
    careerName: "Software Engineer",
    countrySlug: "united-states",
    countryName: "United States",
    countryCode: "US",
    nativeCurrency: "USD",
    sourceType: "bls-oews-api",
    occupationCode: "15-1252",
    sourceUrl: "https://www.bls.gov/oes/current/oes151252.htm",
    endpoint: "/api/research/career-market",
    enabled: true,
  },
  {
    careerSlug: "electrical-engineer",
    careerName: "Electrical Engineer",
    countrySlug: "united-states",
    countryName: "United States",
    countryCode: "US",
    nativeCurrency: "USD",
    sourceType: "bls-oews-api",
    occupationCode: "17-2071",
    sourceUrl: "https://www.bls.gov/oes/current/oes172071.htm",
    endpoint: "/api/research/career-market",
    enabled: true,
  },
  {
    careerSlug: "data-scientist",
    careerName: "Data Scientist",
    countrySlug: "united-states",
    countryName: "United States",
    countryCode: "US",
    nativeCurrency: "USD",
    sourceType: "bls-oews-api",
    occupationCode: "15-2051",
    sourceUrl: "https://www.bls.gov/oes/current/oes152051.htm",
    endpoint: "/api/research/career-market",
    enabled: true,
  },
  {
    careerSlug: "registered-nurse",
    careerName: "Registered Nurse",
    countrySlug: "united-states",
    countryName: "United States",
    countryCode: "US",
    nativeCurrency: "USD",
    sourceType: "bls-oews-api",
    occupationCode: "29-1141",
    sourceUrl: "https://www.bls.gov/oes/current/oes291141.htm",
    endpoint: "/api/research/career-market",
    enabled: true,
  },
  {
    careerSlug: "accountant",
    careerName: "Accountant",
    countrySlug: "united-states",
    countryName: "United States",
    countryCode: "US",
    nativeCurrency: "USD",
    sourceType: "bls-oews-api",
    occupationCode: "13-2011",
    sourceUrl: "https://www.bls.gov/oes/current/oes132011.htm",
    endpoint: "/api/research/career-market",
    enabled: true,
  },
];

export const CAREER_RESEARCH_CAREERS = Array.from(
  new Map(
    CAREER_RESEARCH_TARGETS.map(({ careerSlug: slug, careerName: name }) => [slug, { slug, name }])
  ).values()
);

export const CAREER_RESEARCH_COUNTRIES = [
  ...CAREER_RESEARCH_COUNTRY_SOURCES.map(({ slug, name }) => ({ slug, name })),
];

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
