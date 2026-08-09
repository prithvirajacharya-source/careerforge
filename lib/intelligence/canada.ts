import {
  calculateIntelligenceScore,
  IntelligenceFactor,
} from "./score";

const canadaFactors: IntelligenceFactor[] = [
  {
    key: "salary",
    label: "Salary",
    score: 85,
    weight: 20,
    sourceType: "estimated",
    explanation:
      "Prototype salary factor. Verified Canadian salary data will replace this.",
  },
  {
    key: "hiring",
    label: "Hiring",
    score: 87,
    weight: 20,
    sourceType: "estimated",
    explanation:
      "Prototype hiring factor.",
  },
  {
    key: "safety",
    label: "Safety",
    score: 90,
    weight: 15,
    sourceType: "estimated",
    explanation:
      "Prototype safety factor.",
  },
  {
    key: "healthcare",
    label: "Healthcare",
    score: 88,
    weight: 15,
    sourceType: "estimated",
    explanation:
      "Prototype healthcare factor.",
  },
  {
    key: "visa",
    label: "Visa & Residency",
    score: 91,
    weight: 10,
    sourceType: "estimated",
    explanation:
      "Prototype skilled-migration accessibility factor.",
  },
  {
    key: "work_life",
    label: "Work-Life Balance",
    score: 84,
    weight: 10,
    sourceType: "estimated",
    explanation:
      "Prototype work-life factor.",
  },
  {
    key: "cost_of_living",
    label: "Cost of Living",
    score: 62,
    weight: 10,
    sourceType: "estimated",
    explanation:
      "Prototype affordability factor reflecting high housing costs.",
  },
];

export const canadaIntelligence =
  calculateIntelligenceScore(canadaFactors);