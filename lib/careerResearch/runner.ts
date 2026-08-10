import type { CareerResearchTarget } from "./registry.ts";
import { collectScbCareerResearch } from "./scb.ts";

export async function collectCareerResearch(target: CareerResearchTarget) {
  switch (target.sourceType) {
    case "scb-pxweb":
      return collectScbCareerResearch(target);
    default: {
      const exhaustive: never = target.sourceType;
      throw new Error(`Unsupported career research source adapter: ${exhaustive}`);
    }
  }
}
