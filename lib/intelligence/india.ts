import {
  calculateIntelligenceScore,
  IntelligenceFactor,
} from "./score";

const indiaFactors: IntelligenceFactor[] = [
  {
    key: "salary",
    label: "Salary",
    score: 68,
    weight: 20,
    sourceType: "estimated",
    explanation:
      "Prototype salary factor. Verified India salary data will replace this.",
  },
  {
    key: "hiring",
    label: "Hiring",
    score: 92,
    weight: 20,
    sourceType: "estimated",
    explanation:
      "Prototype hiring factor reflecting strong market growth.",
  },
  {
    key: "safety",
    label: "Safety",
    score: 64,
    weight: 15,
    sourceType: "estimated",
    explanation:
      "Prototype safety factor. Regional variation will later be modeled.",
  },
  {
    key: "healthcare",
    label: "Healthcare",
    score: 70,
    weight: 15,
    sourceType: "estimated",
    explanation:
      "Prototype healthcare factor with strong regional variation.",
  },
  {
    key: "visa",
    label: "Visa & Residency",
    score: 95,
    weight: 10,
    sourceType: "estimated",
    explanation:
      "Prototype domestic-accessibility factor for local professionals.",
  },
  {
    key: "work_life",
    label: "Work-Life Balance",
    score: 67,
    weight: 10,
    sourceType: "estimated",
    explanation:
      "Prototype work-life factor.",
  },
  {
    key: "cost_of_living",
    label: "Cost of Living",
    score: 91,
    weight: 10,
    sourceType: "estimated",
    explanation:
      "Prototype affordability factor.",
  },
];

export const indiaIntelligence =
  calculateIntelligenceScore(indiaFactors);