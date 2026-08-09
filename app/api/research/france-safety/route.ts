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
      "france",

    countryName:
      "France",

    initialBaselineScore:
      75,

    collectEvidence:
      () =>
        collectInternationalSafetyEvidence({
          countryName:
            "France",

          worldBankCode:
            "FRA",

          owidCountryName:
            "France",
        }),
  });