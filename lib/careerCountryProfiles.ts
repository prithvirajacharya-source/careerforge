import type { CareerCountryProfile } from "./careerCountryModel.ts";
import { careerCountryKey, unavailableMarketField } from "./careerCountryModel.ts";

const BLS_MECHANICAL_URL =
  "https://www.bls.gov/ooh/architecture-and-engineering/mechanical-engineers.htm";
const BLS_CYBER_URL =
  "https://www.bls.gov/ooh/computer-and-information-technology/information-security-analysts.htm";
const SCB_SALARY_URL =
  "https://www.statistikdatabasen.scb.se/goto/sv/ssd/LoneSpridSektYrk4AN";
const SWEDEN_OUTLOOK_URL =
  "https://arbetsformedlingen.se/for-arbetssokande/tips-inspiration-och-nyheter/artiklar/2025-12-03-yrken-med-goda-jobbmojligheter-nu-och-om-fem-ar";
const GERMANY_MECHANICAL_URL =
  "https://web.arbeitsagentur.de/entgeltatlas/beruf/58731?alter=1";
const GERMANY_CYBER_URL =
  "https://web.arbeitsagentur.de/entgeltatlas/beruf/138364";

const profiles: CareerCountryProfile[] = [
  {
    careerSlug: "mechanical-engineer",
    countrySlug: "united-states",
    salary: {
      low: 68_740,
      typical: 102_320,
      high: 161_240,
      sourceCurrency: "USD",
      geography: "United States (national)",
      sourceName: "U.S. Bureau of Labor Statistics, Occupational Outlook Handbook — Mechanical Engineers",
      sourceUrl: BLS_MECHANICAL_URL,
      observationDate: "May 2024",
      methodology: "Annual wage distribution for mechanical engineers (SOC 17-2141): 10th percentile, median, and 90th percentile. National values are not adjusted for experience, industry, or local area.",
      verificationStatus: "verified",
    },
    hiringOutlook: {
      value: "Much faster than average (+9%)",
      sourceName: "U.S. Bureau of Labor Statistics",
      sourceUrl: BLS_MECHANICAL_URL,
      observationPeriod: "2024–2034 projection",
      verificationStatus: "verified",
    },
    demand: {
      value: "About 18,100 openings projected per year",
      sourceName: "U.S. Bureau of Labor Statistics",
      sourceUrl: BLS_MECHANICAL_URL,
      observationPeriod: "2024–2034 projection",
      verificationStatus: "verified",
    },
    employmentRisk: unavailableMarketField(),
    education: {
      typicalEducation: "Bachelor's degree in mechanical engineering or mechanical engineering technology",
      degreeRequirement: "A bachelor's degree is typically needed. Licensure is not required for entry-level roles, but engineers offering services directly to the public must be licensed.",
      commonFields: ["Mechanical engineering", "Mechanical engineering technology"],
      alternativePathways: [
        "Five-year combined bachelor's and master's programs",
        "Cooperative education combining classroom study with practical work",
      ],
      certifications: [
        "Fundamentals of Engineering (FE) exam / Engineer in Training pathway",
        "Professional Engineer license for qualified, experienced engineers",
      ],
      verificationStatus: "verified",
    },
    notes: [
      "Salary is a U.S. labour-market benchmark. Currency conversion changes display currency, not the underlying market.",
    ],
  },
  {
    careerSlug: "mechanical-engineer",
    countrySlug: "sweden",
    salary: {
      low: 482_400,
      typical: 621_600,
      high: 838_800,
      sourceCurrency: "SEK",
      geography: "Sweden (national, all sectors and sexes)",
      sourceName: "Statistics Sweden (SCB) / Medlingsinstitutet — SSYK 2144",
      sourceUrl: SCB_SALARY_URL,
      observationDate: "2025",
      methodology: "SCB monthly full-time-equivalent salary distribution for Civilingenjörsyrken inom maskinteknik (SSYK 2144), all sectors and sexes. Monthly 10th percentile (SEK 40,200), median (SEK 51,800), and 90th percentile (SEK 69,900) annualized by multiplying by 12.",
      verificationStatus: "verified",
    },
    hiringOutlook: unavailableMarketField(),
    demand: unavailableMarketField(),
    employmentRisk: unavailableMarketField(),
    education: null,
    notes: [
      "SCB occupation mapping covers graduate-level mechanical engineering roles (SSYK 2144).",
      "Country-specific education and labour-demand evidence is not yet published in this profile.",
    ],
  },
  {
    careerSlug: "mechanical-engineer",
    countrySlug: "germany",
    salary: {
      low: 68_088,
      typical: 85_008,
      high: null,
      sourceCurrency: "EUR",
      geography: "Germany (national, full-time employees)",
      sourceName: "Bundesagentur für Arbeit Entgeltatlas — Ingenieur/in Maschinenbau",
      sourceUrl: GERMANY_MECHANICAL_URL,
      observationDate: "Entgeltatlas 2024",
      methodology: "Gross monthly full-time pay for highly complex mechanical and plant engineering occupations. Lower quartile (€5,674) and median (€7,084) annualized by multiplying by 12. The upper quartile is reported only as above €8,050 because earnings are censored at the social-insurance contribution ceiling, so no exact high value is stored.",
      verificationStatus: "verified",
    },
    hiringOutlook: unavailableMarketField(),
    demand: unavailableMarketField(),
    employmentRisk: unavailableMarketField(),
    education: null,
    notes: [
      "The exact upper-quartile salary is unavailable because the official source censors earnings above its reporting ceiling.",
      "Country-specific education, demand, and employment-risk evidence still needs research.",
    ],
  },
  {
    careerSlug: "cybersecurity-analyst",
    countrySlug: "united-states",
    salary: {
      low: 69_660,
      typical: 124_910,
      high: 186_420,
      sourceCurrency: "USD",
      geography: "United States (national)",
      sourceName: "U.S. Bureau of Labor Statistics, Occupational Outlook Handbook — Information Security Analysts",
      sourceUrl: BLS_CYBER_URL,
      observationDate: "May 2024",
      methodology: "Annual wage distribution for information security analysts (SOC 15-1212), used as the Cybersecurity Analyst benchmark: 10th percentile, median, and 90th percentile. National values are not adjusted for experience, industry, or local area.",
      verificationStatus: "verified",
    },
    hiringOutlook: {
      value: "Much faster than average (+29%)",
      sourceName: "U.S. Bureau of Labor Statistics",
      sourceUrl: BLS_CYBER_URL,
      observationPeriod: "2024–2034 projection",
      verificationStatus: "verified",
    },
    demand: {
      value: "About 16,000 openings projected per year",
      sourceName: "U.S. Bureau of Labor Statistics",
      sourceUrl: BLS_CYBER_URL,
      observationPeriod: "2024–2034 projection",
      verificationStatus: "verified",
    },
    employmentRisk: unavailableMarketField(),
    education: {
      typicalEducation: "Bachelor's degree in computer and information technology or a related field, plus related work experience",
      degreeRequirement: "A bachelor's degree is typical but not universal; some workers enter with a high school diploma plus relevant industry training and certifications.",
      commonFields: ["Computer and information technology", "Computer science", "Engineering", "Mathematics"],
      alternativePathways: [
        "High school diploma plus relevant industry training and certifications",
        "Related IT experience, often in network and computer systems administration",
      ],
      certifications: [
        "ISC2 Certified in Cybersecurity (CC) for entry-level candidates",
        "ISC2 CISSP for experienced practitioners who meet its experience requirement",
      ],
      verificationStatus: "verified",
    },
    notes: [
      "BLS Information Security Analysts is the closest official U.S. occupational match for SEKUR's Cybersecurity Analyst profile.",
    ],
  },
  {
    careerSlug: "cybersecurity-analyst",
    countrySlug: "sweden",
    salary: {
      low: 463_200,
      typical: 658_800,
      high: 950_400,
      sourceCurrency: "SEK",
      geography: "Sweden (national, all sectors and sexes)",
      sourceName: "Statistics Sweden (SCB) / Medlingsinstitutet — SSYK 2516",
      sourceUrl: SCB_SALARY_URL,
      observationDate: "2025",
      methodology: "SCB monthly full-time-equivalent salary distribution for IT-säkerhetsspecialister (SSYK 2516), all sectors and sexes. Monthly 10th percentile (SEK 38,600), median (SEK 54,900), and 90th percentile (SEK 79,200) annualized by multiplying by 12.",
      verificationStatus: "verified",
    },
    hiringOutlook: {
      value: "Large opportunities now and over five years",
      sourceName: "Arbetsförmedlingen occupational barometer",
      sourceUrl: SWEDEN_OUTLOOK_URL,
      observationPeriod: "Published December 2025",
      verificationStatus: "verified",
    },
    demand: {
      value: "Demand is expected to increase",
      sourceName: "Arbetsförmedlingen occupational barometer",
      sourceUrl: SWEDEN_OUTLOOK_URL,
      observationPeriod: "Five-year outlook published December 2025",
      verificationStatus: "verified",
    },
    employmentRisk: unavailableMarketField(),
    education: null,
    notes: [
      "SCB's IT-säkerhetsspecialister (SSYK 2516) directly matches the selected Swedish labour market.",
      "Country-specific education and employment-risk evidence still needs research.",
    ],
  },
  {
    careerSlug: "cybersecurity-analyst",
    countrySlug: "germany",
    salary: {
      low: 57_348,
      typical: 74_568,
      high: null,
      sourceCurrency: "EUR",
      geography: "Germany (national, full-time employees)",
      sourceName: "Bundesagentur für Arbeit Entgeltatlas — IT security specialist occupations",
      sourceUrl: GERMANY_CYBER_URL,
      observationDate: "Entgeltatlas 2024",
      methodology: "Gross monthly full-time pay for complex specialist IT security and related information-security occupations. Lower quartile (€4,779) and median (€6,214) annualized by multiplying by 12. The upper quartile is reported only as above €7,450 because earnings are censored at the social-insurance contribution ceiling, so no exact high value is stored.",
      verificationStatus: "verified",
    },
    hiringOutlook: unavailableMarketField(),
    demand: unavailableMarketField(),
    employmentRisk: unavailableMarketField(),
    education: null,
    notes: [
      "The source group includes IT security technicians, information security officers, and information-security specialists at specialist level.",
      "The exact upper-quartile salary is unavailable because the official source censors earnings above its reporting ceiling.",
    ],
  },
];

export const careerCountryProfiles: Record<string, CareerCountryProfile> =
  Object.fromEntries(
    profiles.map((profile) => [
      careerCountryKey(profile.careerSlug, profile.countrySlug),
      profile,
    ])
  );

export function getCareerCountryProfile(careerSlug: string, countrySlug: string) {
  return careerCountryProfiles[careerCountryKey(careerSlug, countrySlug)] ?? null;
}

export function getCareerCountryProfiles(careerSlug: string) {
  return profiles.filter((profile) => profile.careerSlug === careerSlug);
}
