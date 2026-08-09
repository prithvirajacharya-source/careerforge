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
      "netherlands",

    countryName:
      "Netherlands",

    initialBaselineScore:
      75,

    collectEvidence:
      () =>
        collectInternationalSafetyEvidence({
          countryName:
            "Netherlands",

          worldBankCode:
            "NLD",

          owidCountryName:
            "Netherlands",
        }),
  });