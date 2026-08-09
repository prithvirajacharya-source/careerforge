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
      "denmark",

    countryName:
      "Denmark",

    initialBaselineScore:
      75,

    collectEvidence:
      () =>
        collectInternationalSafetyEvidence({
          countryName:
            "Denmark",

          worldBankCode:
            "DNK",

          owidCountryName:
            "Denmark",
        }),
  });