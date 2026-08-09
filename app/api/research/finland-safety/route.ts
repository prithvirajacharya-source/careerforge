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
      "finland",

    countryName:
      "Finland",

    /*
      This is used only if Finland has no
      Safety row yet.

      The factory will create a temporary
      baseline automatically.
    */
    initialBaselineScore:
      75,

    collectEvidence:
      () =>
        collectInternationalSafetyEvidence({
          countryName:
            "Finland",

          worldBankCode:
            "FIN",

          owidCountryName:
            "Finland",
        }),
  });