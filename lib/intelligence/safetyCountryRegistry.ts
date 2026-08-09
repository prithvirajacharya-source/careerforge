export type SafetyCountryRegistryEntry = {
  slug: string;
  code: string;
  name: string;

  endpoint: string;

  methodology: string;

  description: string;

  enabled: boolean;

  disabledReason?: string;
};

/*
  =========================================================
  SEKUR SAFETY COUNTRY REGISTRY
  =========================================================

  This becomes the single source of truth for the
  Safety Research Console.

  When adding a new country later, we should only
  need to add one entry here and create its route.

  The UI can derive:
  - runner cards
  - enabled/disabled state
  - labels
  - endpoint
  - description
  - country code
*/

export const SAFETY_COUNTRY_REGISTRY:
  SafetyCountryRegistryEntry[] = [
    {
      slug: "sweden",
      code: "SE",
      name: "Sweden",

      endpoint:
        "/api/research/sweden-safety",

      methodology:
        "BRÅ + SEKUR SAFETY V3",

      description:
        "Collect live Brå safety evidence and calculate Sweden's Safety score.",

      enabled: true,
    },

    {
      slug: "germany",
      code: "DE",
      name: "Germany",

      endpoint:
        "/api/research/germany-safety",

      methodology:
        "WORLD BANK / UNODC + OWID",

      description:
        "Collect comparable homicide and perceived-safety evidence for Germany.",

      enabled: true,
    },

    {
      slug: "canada",
      code: "CA",
      name: "Canada",

      endpoint:
        "/api/research/canada-safety",

      methodology:
        "STATISTICS CANADA",

      description:
        "Canada's Safety runner is paused while its perceived-safety source is upgraded.",

      enabled: false,

      disabledReason:
        "Needs source fix",
    },

    {
      slug: "india",
      code: "IN",
      name: "India",

      endpoint:
        "/api/research/india-safety",

      methodology:
        "WORLD BANK / UNODC",

      description:
        "Collect comparable homicide evidence and record insufficient coverage when other indicators are unavailable.",

      enabled: true,
    },

    {
      slug: "norway",
      code: "NO",
      name: "Norway",

      endpoint:
        "/api/research/norway-safety",

      methodology:
        "WORLD BANK / UNODC + OWID",

      description:
        "Collect comparable homicide evidence and optional perceived-safety evidence for Norway.",

      enabled: true,
    },

    {
  slug: "finland",
  code: "FI",
  name: "Finland",

  endpoint:
    "/api/research/finland-safety",

  methodology:
    "WORLD BANK / UNODC + OWID",

  description:
    "Collect comparable homicide evidence and optional perceived-safety evidence for Finland.",

  enabled: true,
},

{
  slug: "denmark",
  code: "DK",
  name: "Denmark",

  endpoint:
    "/api/research/denmark-safety",

  methodology:
    "WORLD BANK / UNODC + OWID",

  description:
    "Collect comparable homicide evidence and optional perceived-safety evidence for Denmark.",

  enabled: true,
},

{
  slug: "netherlands",
  code: "NL",
  name: "Netherlands",

  endpoint:
    "/api/research/netherlands-safety",

  methodology:
    "WORLD BANK / UNODC + OWID",

  description:
    "Collect comparable homicide evidence and optional perceived-safety evidence for the Netherlands.",

  enabled: true,
},

{
  slug: "france",
  code: "FR",
  name: "France",

  endpoint:
    "/api/research/france-safety",

  methodology:
    "WORLD BANK / UNODC + OWID",

  description:
    "Collect comparable homicide evidence and optional perceived-safety evidence for France.",

  enabled: true,
},
  ];