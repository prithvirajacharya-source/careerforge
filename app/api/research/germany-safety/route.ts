import {
  createSafetyRunner,
} from "@/lib/intelligence/createSafetyRunner";

import {
  collectInternationalSafetyEvidence,
} from "@/lib/intelligence/internationalSafetyEvidence";

export const dynamic = "force-dynamic";

export const POST =
  createSafetyRunner({
    countrySlug:
      "germany",

    countryName:
      "Germany",

    collectEvidence: () =>
      collectInternationalSafetyEvidence({
        countryName:
          "Germany",

        worldBankCode:
          "DEU",

        owidCountryName:
          "Germany",
      }),
  });