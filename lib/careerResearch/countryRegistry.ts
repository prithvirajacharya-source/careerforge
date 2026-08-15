export type CareerResearchCountrySource = {
  slug: string;
  name: string;
  code: string;
  nativeCurrency: string;
  marketType: "country" | "region";
  parentCountrySlug?: string;
  sourceSystem: string;
  sourceUrl: string;
  automationStatus: "automated" | "discovery" | "unsupported";
  methodology: string | null;
  refreshAfterDays: number | null;
  disabledReason: string | null;
};

export const CAREER_RESEARCH_COUNTRY_SOURCES: CareerResearchCountrySource[] = [
  { slug: "sweden", name: "Sweden", code: "SE", nativeCurrency: "SEK", marketType: "country", sourceSystem: "Statistics Sweden (SCB) PxWeb", sourceUrl: "https://www.statistikdatabasen.scb.se/", automationStatus: "automated", methodology: "National monthly salary percentiles annualized by 12", refreshAfterDays: 365, disabledReason: null },
  { slug: "united-states", name: "United States", code: "US", nativeCurrency: "USD", marketType: "country", sourceSystem: "BLS OEWS Public Data API", sourceUrl: "https://www.bls.gov/oes/", automationStatus: "automated", methodology: "National annual 10th, median, and 90th percentile wages", refreshAfterDays: 365, disabledReason: null },
  { slug: "norway", name: "Norway", code: "NO", nativeCurrency: "NOK", marketType: "country", sourceSystem: "Statistics Norway Statbank table 11418", sourceUrl: "https://www.ssb.no/en/statbank/table/11418", automationStatus: "automated", methodology: "Official monthly lower quartile, median and upper quartile annualized by 12", refreshAfterDays: 365, disabledReason: null },
  { slug: "denmark", name: "Denmark", code: "DK", nativeCurrency: "DKK", marketType: "country", sourceSystem: "Statistics Denmark StatBank table LONS20", sourceUrl: "https://www.statbank.dk/LONS20", automationStatus: "automated", methodology: "Official hourly lower quartile, median, and upper quartile by DISCO-08 occupation; retained hourly", refreshAfterDays: 365, disabledReason: null },
  { slug: "finland", name: "Finland", code: "FI", nativeCurrency: "EUR", marketType: "country", sourceSystem: "Statistics Finland PxWeb, Structure of Earnings table 15au", sourceUrl: "https://pxweb2.stat.fi/PxWeb/pxweb/en/StatFin/StatFin__pra/15au.px/", automationStatus: "automated", methodology: "Official monthly 1st decile, median, and 9th decile annualized by 12", refreshAfterDays: 365, disabledReason: null },
  { slug: "poland", name: "Poland", code: "PL", nativeCurrency: "PLN", marketType: "country", sourceSystem: "Statistics Poland occupational earnings survey", sourceUrl: "https://stat.gov.pl/en/topics/labour-market/", automationStatus: "unsupported", methodology: null, refreshAfterDays: null, disabledReason: "Official occupation data is published primarily as periodic XLSX/PDF releases; no stable automated endpoint is validated." },
  { slug: "germany", name: "Germany", code: "DE", nativeCurrency: "EUR", marketType: "country", sourceSystem: "Bundesagentur für Arbeit Entgeltatlas", sourceUrl: "https://web.arbeitsagentur.de/entgeltatlas/", automationStatus: "unsupported", methodology: "Official monthly quartiles with censored upper values where applicable", refreshAfterDays: null, disabledReason: "No supported public machine-readable Entgeltatlas interface is available; browser application access is not scraped." },
  { slug: "switzerland", name: "Switzerland", code: "CH", nativeCurrency: "CHF", marketType: "country", sourceSystem: "Swiss Federal Statistical Office", sourceUrl: "https://www.bfs.admin.ch/bfs/en/home/statistics/work-income/wages-income-employment-labour-costs.html", automationStatus: "unsupported", methodology: null, refreshAfterDays: null, disabledReason: "A stable occupation-level public distribution endpoint and mappings have not been validated." },
  { slug: "netherlands", name: "Netherlands", code: "NL", nativeCurrency: "EUR", marketType: "country", sourceSystem: "Statistics Netherlands (CBS) StatLine 85517NED / UWV", sourceUrl: "https://www.cbs.nl/nl-nl/cijfers/detail/85517NED", automationStatus: "discovery", methodology: "CBS publishes national median hourly wages by BRC 2014 occupation group", refreshAfterDays: null, disabledReason: "CBS 85517NED publishes only the median hourly wage and suppresses many of its 114 broad BRC groups; no lower/upper distribution at sufficiently precise SEKUR career granularity is available. UWV occupation dashboards cover demand rather than a defensible salary distribution." },
  { slug: "ireland", name: "Ireland", code: "IE", nativeCurrency: "EUR", marketType: "country", sourceSystem: "Central Statistics Office Ireland", sourceUrl: "https://data.cso.ie/", automationStatus: "unsupported", methodology: null, refreshAfterDays: null, disabledReason: "No validated detailed occupation salary distribution source is implemented." },
  { slug: "united-kingdom", name: "United Kingdom", code: "GB", nativeCurrency: "GBP", marketType: "country", sourceSystem: "Office for National Statistics ASHE Table 14.7a", sourceUrl: "https://www.ons.gov.uk/employmentandlabourmarket/peopleinwork/earningsandworkinghours/datasets/occupation4digitsoc2010ashetable14", automationStatus: "automated", methodology: "Official UK gross annual pay 10th percentile, median and 90th percentile for full-time employee jobs, all sexes, by SOC 2020", refreshAfterDays: 365, disabledReason: null },
  { slug: "scotland", name: "Scotland", code: "GB-SCT", nativeCurrency: "GBP", marketType: "region", parentCountrySlug: "united-kingdom", sourceSystem: "Office for National Statistics ASHE Table 15", sourceUrl: "https://www.ons.gov.uk/employmentandlabourmarket/peopleinwork/earningsandworkinghours/datasets/regionbyoccupation4digitsoc2010ashetable15", automationStatus: "discovery", methodology: "Regional earnings by four-digit SOC, subject to occupation-level quality suppression", refreshAfterDays: null, disabledReason: "Scotland-specific ASHE Table 15 exists, but its separate regional workbook schema, sample quality and suppression coverage have not yet passed collector validation. UK-wide evidence must not be relabeled Scotland evidence." },
  { slug: "canada", name: "Canada", code: "CA", nativeCurrency: "CAD", marketType: "country", sourceSystem: "Government of Canada Job Bank open wage data", sourceUrl: "https://open.canada.ca/data/en/dataset/adad580f-76b0-4502-bd05-20c125de9116", automationStatus: "automated", methodology: "Official national hourly 10th percentile, median, and 90th percentile wages by NOC; retained hourly", refreshAfterDays: 365, disabledReason: null },
];

export function getCareerResearchCountrySource(slug: string) {
  return CAREER_RESEARCH_COUNTRY_SOURCES.find((country) => country.slug === slug) ?? null;
}
