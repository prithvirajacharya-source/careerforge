import {
  calculateIntelligenceScore,
  IntelligenceFactor,
} from "./score";

const germanyFactors: IntelligenceFactor[] = [
  {
    key: "salary",
    label: "Salary",
    score: 88,
    weight: 20,
    sourceType: "estimated",
    explanation:
      "Prototype salary factor. Verified German salary data will replace this.",
  },
  {
    key: "hiring",
    label: "Hiring",
    score: 91,
    weight: 20,
    sourceType: "estimated",
    explanation:
      "Prototype hiring factor based on the current SEKUR model.",
  },
  {
    key: "safety",
    label: "Safety",
    score: 88,
    weight: 15,
    sourceType: "estimated",
    explanation:
      "Prototype safety factor. Official data will replace this.",
  },
  {
    key: "healthcare",
    label: "Healthcare",
    score: 90,
    weight: 15,
    sourceType: "estimated",
    explanation:
      "Prototype healthcare factor.",
  },
  {
    key: "visa",
    label: "Visa & Residency",
    score: 84,
    weight: 10,
    sourceType: "estimated",
    explanation:
      "Prototype skilled-migration and residency accessibility factor.",
  },
  {
    key: "work_life",
    label: "Work-Life Balance",
    score: 86,
    weight: 10,
    sourceType: "estimated",
    explanation:
      "Prototype work-life factor.",
  },
  {
    key: "cost_of_living",
    label: "Cost of Living",
    score: 74,
    weight: 10,
    sourceType: "estimated",
    explanation:
      "Higher score represents better affordability in the SEKUR model.",
  },
];

export const germanyIntelligence =
  calculateIntelligenceScore(germanyFactors);