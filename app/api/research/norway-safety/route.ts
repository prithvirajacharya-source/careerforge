import {
  createSafetyRunner,
} from "@/lib/intelligence/createSafetyRunner";

import {
  collectInternationalSafetyEvidence,
} from "@/lib/intelligence/internationalSafetyEvidence";

export const dynamic = "force-dynamic";

/*
  =========================================================
  NORWAY SAFETY
  =========================================================

  Norway now uses the shared international evidence layer.

  Country-specific configuration only:

  - SEKUR slug
  - display name
  - World Bank ISO3 code
  - OWID country name
*/

export const POST =
  createSafetyRunner({
    countrySlug:
      "norway",

    countryName:
      "Norway",

    collectEvidence:
      () =>
        collectInternationalSafetyEvidence({
          countryName:
            "Norway",

          worldBankCode:
            "NOR",

          owidCountryName:
            "Norway",
        }),
  });