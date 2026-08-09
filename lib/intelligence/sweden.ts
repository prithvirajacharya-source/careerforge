import {
  calculateIntelligenceScore,
  IntelligenceFactor,
} from "./score";

const swedenFactors: IntelligenceFactor[] = [
  {
    key: "salary",
    label: "Salary",
    score: 84,
    weight: 20,
    sourceType: "estimated",
    explanation: "Prototype salary factor. Real sourced data will replace this.",
  },
  {
    key: "hiring",
    label: "Hiring",
    score: 88,
    weight: 20,
    sourceType: "estimated",
    explanation: "Prototype hiring factor.",
  },
  {
    key: "safety",
    label: "Safety",
    score: 93,
    weight: 15,
    sourceType: "estimated",
    explanation: "Prototype safety factor.",
  },
  {
    key: "healthcare",
    label: "Healthcare",
    score: 91,
    weight: 15,
    sourceType: "estimated",
    explanation: "Prototype healthcare factor.",
  },
  {
    key: "visa",
    label: "Visa & Residency",
    score: 82,
    weight: 10,
    sourceType: "estimated",
    explanation: "Prototype visa accessibility factor.",
  },
  {
    key: "work_life",
    label: "Work-Life Balance",
    score: 95,
    weight: 10,
    sourceType: "estimated",
    explanation: "Prototype work-life factor.",
  },
  {
    key: "cost_of_living",
    label: "Cost of Living",
    score: 66,
    weight: 10,
    sourceType: "estimated",
    explanation: "Higher living costs reduce this factor.",
  },
];

export const swedenIntelligence =
  calculateIntelligenceScore(swedenFactors);