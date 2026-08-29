export type CountryCatalogEntry = {
  id: string;
  slug: string;
  name: string;
  code: string;
  currency: string;
  language: string;
  region: "Europe" | "Americas" | "Asia-Pacific";
  catalogAvailable: true;
};

const country = (slug: string, name: string, code: string, currency: string, language: string, region: CountryCatalogEntry["region"]): CountryCatalogEntry => ({ id: slug, slug, name, code, currency, language, region, catalogAvailable: true });

export const COUNTRY_CATALOG: CountryCatalogEntry[] = [
  country("sweden", "Sweden", "SE", "SEK", "Swedish", "Europe"),
  country("norway", "Norway", "NO", "NOK", "Norwegian", "Europe"),
  country("denmark", "Denmark", "DK", "DKK", "Danish", "Europe"),
  country("finland", "Finland", "FI", "EUR", "Finnish, Swedish", "Europe"),
  country("germany", "Germany", "DE", "EUR", "German", "Europe"),
  country("france", "France", "FR", "EUR", "French", "Europe"),
  country("netherlands", "Netherlands", "NL", "EUR", "Dutch", "Europe"),
  country("italy", "Italy", "IT", "EUR", "Italian", "Europe"),
  country("spain", "Spain", "ES", "EUR", "Spanish", "Europe"),
  country("poland", "Poland", "PL", "PLN", "Polish", "Europe"),
  country("romania", "Romania", "RO", "RON", "Romanian", "Europe"),
  country("switzerland", "Switzerland", "CH", "CHF", "German, French, Italian", "Europe"),
  country("austria", "Austria", "AT", "EUR", "German", "Europe"),
  country("hungary", "Hungary", "HU", "HUF", "Hungarian", "Europe"),
  country("greece", "Greece", "GR", "EUR", "Greek", "Europe"),
  country("croatia", "Croatia", "HR", "EUR", "Croatian", "Europe"),
  country("ireland", "Ireland", "IE", "EUR", "English, Irish", "Europe"),
  country("united-kingdom", "United Kingdom", "GB", "GBP", "English", "Europe"),
  country("united-states", "United States", "US", "USD", "English", "Americas"),
  country("canada", "Canada", "CA", "CAD", "English, French", "Americas"),
  country("brazil", "Brazil", "BR", "BRL", "Portuguese", "Americas"),
  country("mexico", "Mexico", "MX", "MXN", "Spanish", "Americas"),
  country("australia", "Australia", "AU", "AUD", "English", "Asia-Pacific"),
  country("new-zealand", "New Zealand", "NZ", "NZD", "English, Māori", "Asia-Pacific"),
  country("japan", "Japan", "JP", "JPY", "Japanese", "Asia-Pacific"),
  country("south-korea", "South Korea", "KR", "KRW", "Korean", "Asia-Pacific"),
  country("singapore", "Singapore", "SG", "SGD", "English, Malay, Mandarin, Tamil", "Asia-Pacific"),
  country("malaysia", "Malaysia", "MY", "MYR", "Malay", "Asia-Pacific"),
  country("sri-lanka", "Sri Lanka", "LK", "LKR", "Sinhala, Tamil", "Asia-Pacific"),
];

export function sortCountriesByName<T extends { name: string }>(countries: readonly T[]): T[] {
  return [...countries].sort((left, right) => left.name.localeCompare(right.name, "en"));
}

export const SORTED_COUNTRY_CATALOG = sortCountriesByName(COUNTRY_CATALOG);

export function getCountryCatalogEntry(slug: string) {
  return COUNTRY_CATALOG.find((entry) => entry.slug === slug) ?? null;
}
