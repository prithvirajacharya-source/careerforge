import type { CareerResearchTarget } from "./registry.ts";
import { collectScbCareerResearch } from "./scb.ts";
import { collectBlsCareerResearch } from "./bls.ts";
import { collectNorwayCareerResearch } from "./norway.ts";
import { collectFinlandCareerResearch } from "./finland.ts";

export async function collectCareerResearch(target: CareerResearchTarget) {
  switch (target.sourceType) {
    case "scb-pxweb":
      return collectScbCareerResearch(target);
    case "bls-oews-api":
      return collectBlsCareerResearch(target);
    case "ssb-pxweb": return collectNorwayCareerResearch(target);
    case "statfin-pxweb": return collectFinlandCareerResearch(target);
    default: {
      const exhaustive: never = target.sourceType;
      throw new Error(`Unsupported career research source adapter: ${exhaustive}`);
    }
  }
}
