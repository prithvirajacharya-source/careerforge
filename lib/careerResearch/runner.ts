import type { CareerResearchTarget } from "./registry.ts";
import { collectScbCareerResearch } from "./scb.ts";
import { collectBlsCareerResearch } from "./bls.ts";
import { collectNorwayCareerResearch } from "./norway.ts";
import { collectFinlandCareerResearch } from "./finland.ts";
import { collectDenmarkCareerResearch } from "./denmark.ts";
import { collectCanadaCareerResearch } from "./canada.ts";
import { collectOnsAsheCareerResearch } from "./ukAshe.ts";

export async function collectCareerResearch(target: CareerResearchTarget) {
  switch (target.sourceType) {
    case "scb-pxweb":
      return collectScbCareerResearch(target);
    case "bls-oews-api":
      return collectBlsCareerResearch(target);
    case "ssb-pxweb": return collectNorwayCareerResearch(target);
    case "statfin-pxweb": return collectFinlandCareerResearch(target);
    case "statbank-dk": return collectDenmarkCareerResearch(target);
    case "canada-jobbank-csv": return collectCanadaCareerResearch(target);
    case "ons-ashe-bulk": return collectOnsAsheCareerResearch(target);
    default: {
      const exhaustive: never = target.sourceType;
      throw new Error(`Unsupported career research source adapter: ${exhaustive}`);
    }
  }
}
