import { canadaIntelligence } from "./canada";
import { germanyIntelligence } from "./germany";
import { indiaIntelligence } from "./india";
import { swedenIntelligence } from "./sweden";

export type CountryIntelligenceProfile = {
  slug: string;
  name: string;
  code: string;
  region: string;
  intelligence: typeof swedenIntelligence;
};

export const countryIntelligenceProfiles: Record<
  string,
  CountryIntelligenceProfile
> = {
  sweden: {
    slug: "sweden",
    name: "Sweden",
    code: "SE",
    region: "Europe",
    intelligence: swedenIntelligence,
  },

  germany: {
    slug: "germany",
    name: "Germany",
    code: "DE",
    region: "Europe",
    intelligence: germanyIntelligence,
  },

  india: {
    slug: "india",
    name: "India",
    code: "IN",
    region: "Asia",
    intelligence: indiaIntelligence,
  },

  canada: {
    slug: "canada",
    name: "Canada",
    code: "CA",
    region: "North America",
    intelligence: canadaIntelligence,
  },
};

export function getCountryIntelligenceProfile(
  slug: string
) {
  return countryIntelligenceProfiles[slug];
}

export function getAvailableCountryProfiles() {
  return Object.values(countryIntelligenceProfiles);
}