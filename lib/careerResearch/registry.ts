import { CAREER_RESEARCH_COUNTRY_SOURCES } from "./countryRegistry.ts";

export type CareerResearchTarget = {
  careerSlug: string;
  careerName: string;
  countrySlug: string;
  countryName: string;
  countryCode: string;
  nativeCurrency: string;
  sourceType: "scb-pxweb" | "bls-oews-api" | "ssb-pxweb" | "statfin-pxweb" | "statbank-dk" | "canada-jobbank-csv" | "ons-ashe-bulk";
  occupationCode: string;
  sourceUrl?: string;
  endpoint: string;
  enabled: boolean;
};

export const CAREER_RESEARCH_TARGETS: CareerResearchTarget[] = [
  ...[
    ["mechanical-engineer", "Mechanical Engineer", "2122"], ["registered-nurse", "Registered Nurse", "2237"], ["software-engineer", "Software Engineer", "2134"], ["electrical-engineer", "Electrical Engineer", "2123"], ["accountant", "Accountant", "2421"], ["cybersecurity-analyst", "Cybersecurity Analyst", "2135"],
  ].map(([careerSlug, careerName, occupationCode]) => ({ careerSlug, careerName, countrySlug: "united-kingdom", countryName: "United Kingdom", countryCode: "GB", nativeCurrency: "GBP", sourceType: "ons-ashe-bulk" as const, occupationCode, sourceUrl: "https://www.ons.gov.uk/employmentandlabourmarket/peopleinwork/earningsandworkinghours/datasets/occupation4digitsoc2010ashetable14", endpoint: "/api/research/career-market", enabled: true })),
  ...[
    ["mechanical-engineer", "Mechanical Engineer", "2144"], ["registered-nurse", "Registered Nurse", "2221"], ["software-engineer", "Software Engineer", "2512"], ["electrical-engineer", "Electrical Engineer", "2151"], ["accountant", "Accountant", "2411"],
  ].map(([careerSlug, careerName, occupationCode]) => ({ careerSlug, careerName, countrySlug: "denmark", countryName: "Denmark", countryCode: "DK", nativeCurrency: "DKK", sourceType: "statbank-dk" as const, occupationCode, sourceUrl: "https://www.statbank.dk/LONS20", endpoint: "/api/research/career-market", enabled: true })),
  ...[
    ["mechanical-engineer", "Mechanical Engineer", "NOC_21301"], ["registered-nurse", "Registered Nurse", "NOC_31301"], ["software-engineer", "Software Engineer", "NOC_21231"], ["electrical-engineer", "Electrical Engineer", "NOC_21310"], ["accountant", "Accountant", "NOC_11100"], ["cybersecurity-analyst", "Cybersecurity Analyst", "NOC_21220"], ["data-scientist", "Data Scientist", "NOC_21211"],
  ].map(([careerSlug, careerName, occupationCode]) => ({ careerSlug, careerName, countrySlug: "canada", countryName: "Canada", countryCode: "CA", nativeCurrency: "CAD", sourceType: "canada-jobbank-csv" as const, occupationCode, sourceUrl: "https://open.canada.ca/data/en/dataset/adad580f-76b0-4502-bd05-20c125de9116", endpoint: "/api/research/career-market", enabled: true })),
  { careerSlug:"mechanical-engineer",careerName:"Mechanical Engineer",countrySlug:"norway",countryName:"Norway",countryCode:"NO",nativeCurrency:"NOK",sourceType:"ssb-pxweb",occupationCode:"2144",sourceUrl:"https://www.ssb.no/en/statbank/table/11418",endpoint:"/api/research/career-market",enabled:true },
  { careerSlug:"registered-nurse",careerName:"Registered Nurse",countrySlug:"norway",countryName:"Norway",countryCode:"NO",nativeCurrency:"NOK",sourceType:"ssb-pxweb",occupationCode:"2221",sourceUrl:"https://www.ssb.no/en/statbank/table/11418",endpoint:"/api/research/career-market",enabled:true },
  { careerSlug:"software-engineer",careerName:"Software Engineer",countrySlug:"norway",countryName:"Norway",countryCode:"NO",nativeCurrency:"NOK",sourceType:"ssb-pxweb",occupationCode:"2512",sourceUrl:"https://www.ssb.no/en/statbank/table/11418",endpoint:"/api/research/career-market",enabled:true },
  { careerSlug:"electrical-engineer",careerName:"Electrical Engineer",countrySlug:"norway",countryName:"Norway",countryCode:"NO",nativeCurrency:"NOK",sourceType:"ssb-pxweb",occupationCode:"2151",sourceUrl:"https://www.ssb.no/en/statbank/table/11418",endpoint:"/api/research/career-market",enabled:true },
  { careerSlug:"accountant",careerName:"Accountant",countrySlug:"norway",countryName:"Norway",countryCode:"NO",nativeCurrency:"NOK",sourceType:"ssb-pxweb",occupationCode:"2411",sourceUrl:"https://www.ssb.no/en/statbank/table/11418",endpoint:"/api/research/career-market",enabled:true },
  { careerSlug:"mechanical-engineer",careerName:"Mechanical Engineer",countrySlug:"finland",countryName:"Finland",countryCode:"FI",nativeCurrency:"EUR",sourceType:"statfin-pxweb",occupationCode:"2144",sourceUrl:"https://pxweb2.stat.fi/PxWeb/pxweb/en/StatFin/StatFin__pra/15au.px/",endpoint:"/api/research/career-market",enabled:true },
  { careerSlug:"registered-nurse",careerName:"Registered Nurse",countrySlug:"finland",countryName:"Finland",countryCode:"FI",nativeCurrency:"EUR",sourceType:"statfin-pxweb",occupationCode:"2221",sourceUrl:"https://pxweb2.stat.fi/PxWeb/pxweb/en/StatFin/StatFin__pra/15au.px/",endpoint:"/api/research/career-market",enabled:true },
  { careerSlug:"software-engineer",careerName:"Software Engineer",countrySlug:"finland",countryName:"Finland",countryCode:"FI",nativeCurrency:"EUR",sourceType:"statfin-pxweb",occupationCode:"2512",sourceUrl:"https://pxweb2.stat.fi/PxWeb/pxweb/en/StatFin/StatFin__pra/15au.px/",endpoint:"/api/research/career-market",enabled:true },
  { careerSlug:"electrical-engineer",careerName:"Electrical Engineer",countrySlug:"finland",countryName:"Finland",countryCode:"FI",nativeCurrency:"EUR",sourceType:"statfin-pxweb",occupationCode:"2151",sourceUrl:"https://pxweb2.stat.fi/PxWeb/pxweb/en/StatFin/StatFin__pra/15au.px/",endpoint:"/api/research/career-market",enabled:true },
  { careerSlug:"accountant",careerName:"Accountant",countrySlug:"finland",countryName:"Finland",countryCode:"FI",nativeCurrency:"EUR",sourceType:"statfin-pxweb",occupationCode:"2411",sourceUrl:"https://pxweb2.stat.fi/PxWeb/pxweb/en/StatFin/StatFin__pra/15au.px/",endpoint:"/api/research/career-market",enabled:true },
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
