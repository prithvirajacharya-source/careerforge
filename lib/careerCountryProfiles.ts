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
const BLS_SOFTWARE_URL =
  "https://www.bls.gov/ooh/computer-and-information-technology/software-developers.htm";
const BLS_ELECTRICAL_URL =
  "https://www.bls.gov/ooh/architecture-and-engineering/electrical-and-electronics-engineers.htm";
const BLS_DATA_SCIENTIST_URL =
  "https://www.bls.gov/ooh/math/data-scientists.htm";
const BLS_NURSE_URL =
  "https://www.bls.gov/ooh/healthcare/registered-nurses.htm";
const BLS_ACCOUNTANT_URL =
  "https://www.bls.gov/ooh/business-and-financial/accountants-and-auditors.htm";
const SWEDEN_SOFTWARE_OUTLOOK_URL =
  "https://arbetsformedlingen.se/for-arbetssokande/vilket-yrke-passar-dig/hitta-yrken-och-prognoser/yrkesgrupper/systemutvecklare/jobbmojligheter";
const SWEDEN_NURSE_OUTLOOK_URL =
  "https://arbetsformedlingen.se/for-arbetssokande/vilket-yrke-passar-dig/hitta-yrken/yrkesgrupper/sjukskoterskeyrken/jobbmojligheter";
const SWEDEN_2026_OUTLOOK_URL =
  "https://arbetsformedlingen.se/om-oss/press/nyheter/nyhetsarkiv/2026-04-02-arbetsformedlingens-barometer-har-finns-jobben-efter-hogskolan";
const GERMANY_SOFTWARE_URL =
  "https://web.arbeitsagentur.de/entgeltatlas/beruf/15260";
const GERMANY_ELECTRICAL_URL =
  "https://web.arbeitsagentur.de/entgeltatlas/beruf/58716";
const GERMANY_DATA_SCIENTIST_URL =
  "https://web.arbeitsagentur.de/entgeltatlas/beruf/129987";
const GERMANY_NURSE_URL =
  "https://web.arbeitsagentur.de/entgeltatlas/beruf/27355";
const GERMANY_ACCOUNTANT_URL =
  "https://web.arbeitsagentur.de/entgeltatlas/beruf/7692";

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
  {
    careerSlug: "software-engineer",
    countrySlug: "united-states",
    salary: {
      low: 79_850,
      typical: 133_080,
      high: 211_450,
      sourceCurrency: "USD",
      geography: "United States (national)",
      sourceName: "U.S. Bureau of Labor Statistics, Occupational Outlook Handbook — Software Developers",
      sourceUrl: BLS_SOFTWARE_URL,
      observationDate: "May 2024",
      methodology: "Annual wage distribution for software developers (SOC 15-1252): 10th percentile, median, and 90th percentile.",
      verificationStatus: "verified",
    },
    hiringOutlook: { value: "Much faster than average (+16%)", sourceName: "U.S. Bureau of Labor Statistics", sourceUrl: BLS_SOFTWARE_URL, observationPeriod: "2024–2034 projection", verificationStatus: "verified" },
    demand: { value: "About 115,200 openings projected per year", sourceName: "U.S. Bureau of Labor Statistics", sourceUrl: BLS_SOFTWARE_URL, observationPeriod: "2024–2034 projection", verificationStatus: "verified" },
    employmentRisk: unavailableMarketField(),
    education: {
      typicalEducation: "Bachelor's degree in computer and information technology or a related field",
      degreeRequirement: "A bachelor's degree is typically needed; some employers prefer a master's degree.",
      commonFields: ["Computer and information technology", "Engineering", "Mathematics"],
      alternativePathways: ["Relevant internship experience alongside a degree program"],
      certifications: [],
      verificationStatus: "verified",
    },
    notes: ["BLS Software Developers is the official U.S. occupational match used for Software Engineer."],
  },
  {
    careerSlug: "software-engineer",
    countrySlug: "sweden",
    salary: {
      low: 475_200,
      typical: 642_000,
      high: 871_200,
      sourceCurrency: "SEK",
      geography: "Sweden (national, all sectors and sexes)",
      sourceName: "Statistics Sweden (SCB) / Medlingsinstitutet — SSYK 2512",
      sourceUrl: SCB_SALARY_URL,
      observationDate: "2025",
      methodology: "SCB monthly full-time-equivalent salary distribution for Mjukvaru- och systemutvecklare m.fl. (SSYK 2512), all sectors and sexes. Monthly 10th percentile (SEK 39,600), median (SEK 53,500), and 90th percentile (SEK 72,600) annualized by multiplying by 12.",
      verificationStatus: "verified",
    },
    hiringOutlook: { value: "Large opportunities now", sourceName: "Arbetsförmedlingen occupational barometer", sourceUrl: SWEDEN_SOFTWARE_OUTLOOK_URL, observationPeriod: "Current national assessment", verificationStatus: "verified" },
    demand: { value: "Demand expected to increase", sourceName: "Arbetsförmedlingen occupational barometer", sourceUrl: SWEDEN_SOFTWARE_OUTLOOK_URL, observationPeriod: "Five-year outlook", verificationStatus: "verified" },
    employmentRisk: unavailableMarketField(),
    education: null,
    notes: ["SCB SSYK 2512 covers software and systems developers in the Swedish labour market."],
  },
  {
    careerSlug: "software-engineer",
    countrySlug: "germany",
    salary: {
      low: 58_656,
      typical: 73_164,
      high: 88_620,
      sourceCurrency: "EUR",
      geography: "Germany (national, full-time employees)",
      sourceName: "Bundesagentur für Arbeit Entgeltatlas — Softwareentwickler/in",
      sourceUrl: GERMANY_SOFTWARE_URL,
      observationDate: "Entgeltatlas 2024",
      methodology: "Gross monthly full-time pay for highly complex software-development occupations. Lower quartile (€4,888), median (€6,097), and upper quartile (€7,385) annualized by multiplying by 12.",
      verificationStatus: "verified",
    },
    hiringOutlook: unavailableMarketField(), demand: unavailableMarketField(), employmentRisk: unavailableMarketField(), education: null,
    notes: ["The source occupational group covers expert-level software-development roles."],
  },
  {
    careerSlug: "electrical-engineer",
    countrySlug: "united-states",
    salary: {
      low: 74_670, typical: 111_910, high: 175_460, sourceCurrency: "USD", geography: "United States (national)",
      sourceName: "U.S. Bureau of Labor Statistics, Occupational Outlook Handbook — Electrical and Electronics Engineers", sourceUrl: BLS_ELECTRICAL_URL, observationDate: "May 2024",
      methodology: "Annual wage distribution for electrical engineers (SOC 17-2071): 10th percentile, median, and 90th percentile.", verificationStatus: "verified",
    },
    hiringOutlook: { value: "Much faster than average (+7%)", sourceName: "U.S. Bureau of Labor Statistics", sourceUrl: BLS_ELECTRICAL_URL, observationPeriod: "2024–2034 projection", verificationStatus: "verified" },
    demand: { value: "About 17,500 openings per year across electrical and electronics engineering", sourceName: "U.S. Bureau of Labor Statistics", sourceUrl: BLS_ELECTRICAL_URL, observationPeriod: "2024–2034 projection", verificationStatus: "verified" },
    employmentRisk: unavailableMarketField(),
    education: {
      typicalEducation: "Bachelor's degree in electrical engineering, electronics engineering, or a related engineering field",
      degreeRequirement: "At least a bachelor's degree is typically needed; employers also value internships or cooperative engineering experience.",
      commonFields: ["Electrical engineering", "Electronics engineering", "Electrical engineering technology"],
      alternativePathways: ["Cooperative engineering programs", "Internships with practical engineering experience"],
      certifications: ["Fundamentals of Engineering (FE) exam", "Professional Engineer license where required"], verificationStatus: "verified",
    },
    notes: ["Salary values are for electrical engineers; the openings figure is published for the combined electrical and electronics engineer group."],
  },
  {
    careerSlug: "electrical-engineer",
    countrySlug: "sweden",
    salary: {
      low: 492_000, typical: 650_400, high: 900_000, sourceCurrency: "SEK", geography: "Sweden (national, all sectors and sexes)",
      sourceName: "Statistics Sweden (SCB) / Medlingsinstitutet — SSYK 2143", sourceUrl: SCB_SALARY_URL, observationDate: "2025",
      methodology: "SCB monthly full-time-equivalent salary distribution for Civilingenjörsyrken inom elektroteknik (SSYK 2143), all sectors and sexes. Monthly 10th percentile (SEK 41,000), median (SEK 54,200), and 90th percentile (SEK 75,000) annualized by multiplying by 12.", verificationStatus: "verified",
    },
    hiringOutlook: { value: "Good prospects over five years", sourceName: "Arbetsförmedlingen occupational barometer", sourceUrl: SWEDEN_2026_OUTLOOK_URL, observationPeriod: "Published April 2026", verificationStatus: "verified" },
    demand: { value: "Strong five-year demand", sourceName: "Arbetsförmedlingen occupational barometer", sourceUrl: SWEDEN_2026_OUTLOOK_URL, observationPeriod: "Five-year national outlook", verificationStatus: "verified" },
    employmentRisk: unavailableMarketField(), education: null,
    notes: ["SCB SSYK 2143 covers graduate-level electrical engineering occupations."],
  },
  {
    careerSlug: "electrical-engineer",
    countrySlug: "germany",
    salary: {
      low: 67_908, typical: 83_280, high: null, sourceCurrency: "EUR", geography: "Germany (national, full-time employees)",
      sourceName: "Bundesagentur für Arbeit Entgeltatlas — Ingenieur/in Elektrotechnik", sourceUrl: GERMANY_ELECTRICAL_URL, observationDate: "Entgeltatlas 2024",
      methodology: "Gross monthly full-time pay for highly complex electrical-engineering occupations. Lower quartile (€5,659) and median (€6,940) annualized by multiplying by 12. The upper quartile is reported only as above €7,450, so no exact high value is stored.", verificationStatus: "verified",
    },
    hiringOutlook: unavailableMarketField(), demand: unavailableMarketField(), employmentRisk: unavailableMarketField(), education: null,
    notes: ["The exact upper-quartile salary is unavailable because the official source censors earnings above its reporting ceiling."],
  },
  {
    careerSlug: "data-scientist",
    countrySlug: "united-states",
    salary: {
      low: 63_650, typical: 112_590, high: 194_410, sourceCurrency: "USD", geography: "United States (national)",
      sourceName: "U.S. Bureau of Labor Statistics, Occupational Outlook Handbook — Data Scientists", sourceUrl: BLS_DATA_SCIENTIST_URL, observationDate: "May 2024",
      methodology: "Annual wage distribution for data scientists (SOC 15-2051): 10th percentile, median, and 90th percentile.", verificationStatus: "verified",
    },
    hiringOutlook: { value: "Much faster than average (+34%)", sourceName: "U.S. Bureau of Labor Statistics", sourceUrl: BLS_DATA_SCIENTIST_URL, observationPeriod: "2024–2034 projection", verificationStatus: "verified" },
    demand: { value: "About 23,400 openings projected per year", sourceName: "U.S. Bureau of Labor Statistics", sourceUrl: BLS_DATA_SCIENTIST_URL, observationPeriod: "2024–2034 projection", verificationStatus: "verified" },
    employmentRisk: unavailableMarketField(),
    education: {
      typicalEducation: "At least a bachelor's degree in mathematics, statistics, computer science, or a related field",
      degreeRequirement: "A bachelor's degree is typical; some employers require or prefer a master's or doctoral degree.",
      commonFields: ["Mathematics", "Statistics", "Computer science", "Business", "Engineering"],
      alternativePathways: ["Industry-specific experience or coursework alongside quantitative training"], certifications: [], verificationStatus: "verified",
    },
    notes: [],
  },
  {
    careerSlug: "data-scientist",
    countrySlug: "sweden",
    salary: {
      low: 459_600, typical: 602_400, high: 880_800, sourceCurrency: "SEK", geography: "Sweden (national, all sectors and sexes)",
      sourceName: "Statistics Sweden (SCB) / Medlingsinstitutet — SSYK 2122", sourceUrl: SCB_SALARY_URL, observationDate: "2025",
      methodology: "SCB monthly full-time-equivalent salary distribution for Statistiker (SSYK 2122), used as the closest official national benchmark for data-science statistical work. Monthly 10th percentile (SEK 38,300), median (SEK 50,200), and 90th percentile (SEK 73,400) annualized by multiplying by 12.", verificationStatus: "verified",
    },
    hiringOutlook: unavailableMarketField(), demand: unavailableMarketField(), employmentRisk: unavailableMarketField(), education: null,
    notes: ["SCB does not publish a distinct Data Scientist salary series; SSYK 2122 Statistiker is used transparently as the closest defensible official benchmark."],
  },
  {
    careerSlug: "data-scientist",
    countrySlug: "germany",
    salary: {
      low: 62_160, typical: 77_736, high: null, sourceCurrency: "EUR", geography: "Germany (national, full-time employees)",
      sourceName: "Bundesagentur für Arbeit Entgeltatlas — Data Scientist", sourceUrl: GERMANY_DATA_SCIENTIST_URL, observationDate: "Entgeltatlas 2024",
      methodology: "Gross monthly full-time pay for highly complex general informatics occupations containing Data Scientist. Lower quartile (€5,180) and median (€6,478) annualized by multiplying by 12. The upper quartile is reported only as above €7,450, so no exact high value is stored.", verificationStatus: "verified",
    },
    hiringOutlook: unavailableMarketField(), demand: unavailableMarketField(), employmentRisk: unavailableMarketField(), education: null,
    notes: ["The official occupational group also contains closely related expert informatics roles.", "The exact upper-quartile salary is unavailable because the official source censors earnings above its reporting ceiling."],
  },
  {
    careerSlug: "registered-nurse",
    countrySlug: "united-states",
    salary: {
      low: 66_030, typical: 93_600, high: 135_320, sourceCurrency: "USD", geography: "United States (national)",
      sourceName: "U.S. Bureau of Labor Statistics, Occupational Outlook Handbook — Registered Nurses", sourceUrl: BLS_NURSE_URL, observationDate: "May 2024",
      methodology: "Annual wage distribution for registered nurses (SOC 29-1141): 10th percentile, median, and 90th percentile.", verificationStatus: "verified",
    },
    hiringOutlook: { value: "Faster than average (+5%)", sourceName: "U.S. Bureau of Labor Statistics", sourceUrl: BLS_NURSE_URL, observationPeriod: "2024–2034 projection", verificationStatus: "verified" },
    demand: { value: "About 189,100 openings projected per year", sourceName: "U.S. Bureau of Labor Statistics", sourceUrl: BLS_NURSE_URL, observationPeriod: "2024–2034 projection", verificationStatus: "verified" },
    employmentRisk: unavailableMarketField(),
    education: {
      typicalEducation: "Bachelor's degree, associate's degree, or diploma from an approved nursing program",
      degreeRequirement: "Graduation from an approved nursing program and state licensure are required; some employers require a bachelor's degree.",
      commonFields: ["Nursing"], alternativePathways: ["Associate degree in nursing", "Approved hospital diploma", "Accelerated nursing program", "RN-to-BSN program"],
      certifications: ["State registered nurse license", "CPR/BLS or ACLS where required"], verificationStatus: "verified",
    },
    notes: [],
  },
  {
    careerSlug: "registered-nurse",
    countrySlug: "sweden",
    salary: {
      low: 422_400, typical: 514_800, high: 652_800, sourceCurrency: "SEK", geography: "Sweden (national, all sectors and sexes)",
      sourceName: "Statistics Sweden (SCB) / Medlingsinstitutet — SSYK 2221", sourceUrl: SCB_SALARY_URL, observationDate: "2025",
      methodology: "SCB monthly full-time-equivalent salary distribution for Grundutbildade sjuksköterskor (SSYK 2221), all sectors and sexes. Monthly 10th percentile (SEK 35,200), median (SEK 42,900), and 90th percentile (SEK 54,400) annualized by multiplying by 12.", verificationStatus: "verified",
    },
    hiringOutlook: { value: "Large opportunities now", sourceName: "Arbetsförmedlingen occupational barometer", sourceUrl: SWEDEN_NURSE_OUTLOOK_URL, observationPeriod: "Current national assessment", verificationStatus: "verified" },
    demand: { value: "Demand expected to increase", sourceName: "Arbetsförmedlingen occupational barometer", sourceUrl: SWEDEN_NURSE_OUTLOOK_URL, observationPeriod: "Five-year outlook", verificationStatus: "verified" },
    employmentRisk: unavailableMarketField(), education: null,
    notes: ["Swedish nursing is a licensed profession; country-specific licensing guidance remains to be added from the responsible authority."],
  },
  {
    careerSlug: "registered-nurse",
    countrySlug: "germany",
    salary: {
      low: 46_440, typical: 51_948, high: 58_188, sourceCurrency: "EUR", geography: "Germany (national, full-time employees)",
      sourceName: "Bundesagentur für Arbeit Entgeltatlas — Gesundheits- und Krankenpfleger/in", sourceUrl: GERMANY_NURSE_URL, observationDate: "Entgeltatlas 2024",
      methodology: "Gross monthly full-time pay for skilled general health and nursing occupations. Lower quartile (€3,870), median (€4,329), and upper quartile (€4,849) annualized by multiplying by 12.", verificationStatus: "verified",
    },
    hiringOutlook: unavailableMarketField(), demand: unavailableMarketField(), employmentRisk: unavailableMarketField(), education: null,
    notes: ["The source group includes general nursing occupations at skilled-worker level."],
  },
  {
    careerSlug: "accountant",
    countrySlug: "united-states",
    salary: {
      low: 52_780, typical: 81_680, high: 141_420, sourceCurrency: "USD", geography: "United States (national)",
      sourceName: "U.S. Bureau of Labor Statistics, Occupational Outlook Handbook — Accountants and Auditors", sourceUrl: BLS_ACCOUNTANT_URL, observationDate: "May 2024",
      methodology: "Annual wage distribution for accountants and auditors (SOC 13-2011): 10th percentile, median, and 90th percentile.", verificationStatus: "verified",
    },
    hiringOutlook: { value: "Faster than average (+5%)", sourceName: "U.S. Bureau of Labor Statistics", sourceUrl: BLS_ACCOUNTANT_URL, observationPeriod: "2024–2034 projection", verificationStatus: "verified" },
    demand: { value: "About 124,200 openings projected per year", sourceName: "U.S. Bureau of Labor Statistics", sourceUrl: BLS_ACCOUNTANT_URL, observationPeriod: "2024–2034 projection", verificationStatus: "verified" },
    employmentRisk: unavailableMarketField(),
    education: {
      typicalEducation: "Bachelor's degree in accounting or a related field", degreeRequirement: "A bachelor's degree is typical. Some junior roles may be accessible with an associate degree or relevant bookkeeping experience.",
      commonFields: ["Accounting", "Business", "Forensic accounting", "Internal auditing", "Tax accounting"],
      alternativePathways: ["Associate degree plus employer-recognized experience", "Bookkeeping or accounting-clerk experience leading to junior accounting work"],
      certifications: ["Certified Public Accountant (CPA) where required or beneficial"], verificationStatus: "verified",
    },
    notes: ["BLS combines accountants and auditors in one official occupational series."],
  },
  {
    careerSlug: "accountant",
    countrySlug: "sweden",
    salary: {
      low: 398_400, typical: 535_200, high: 697_200, sourceCurrency: "SEK", geography: "Sweden (national, all sectors and sexes)",
      sourceName: "Statistics Sweden (SCB) / Medlingsinstitutet — SSYK 3313", sourceUrl: SCB_SALARY_URL, observationDate: "2025",
      methodology: "SCB monthly full-time-equivalent salary distribution for Redovisningsekonomer (SSYK 3313), all sectors and sexes. Monthly 10th percentile (SEK 33,200), median (SEK 44,600), and 90th percentile (SEK 58,100) annualized by multiplying by 12.", verificationStatus: "verified",
    },
    hiringOutlook: unavailableMarketField(), demand: unavailableMarketField(), employmentRisk: unavailableMarketField(), education: null,
    notes: ["Redovisningsekonomer (SSYK 3313) is used as the closest Swedish labour-market match for Accountant."],
  },
  {
    careerSlug: "accountant",
    countrySlug: "germany",
    salary: {
      low: 41_352, typical: 51_108, high: 65_040, sourceCurrency: "EUR", geography: "Germany (national, full-time employees)",
      sourceName: "Bundesagentur für Arbeit Entgeltatlas — Buchhalter/in", sourceUrl: GERMANY_ACCOUNTANT_URL, observationDate: "Entgeltatlas 2024",
      methodology: "Gross monthly full-time pay for complex specialist bookkeeping occupations. Lower quartile (€3,446), median (€4,259), and upper quartile (€5,420) annualized by multiplying by 12.", verificationStatus: "verified",
    },
    hiringOutlook: unavailableMarketField(), demand: unavailableMarketField(), employmentRisk: unavailableMarketField(), education: null,
    notes: ["The official group covers specialist bookkeeping and related accounting roles."],
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

export function getCountryCareerProfiles(countrySlug: string) {
  return profiles.filter((profile) => profile.countrySlug === countrySlug);
}
