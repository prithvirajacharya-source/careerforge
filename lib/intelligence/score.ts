export type IntelligenceFactor = {
  key: string;
  label: string;

  /**
   * Score for this factor from 0–100.
   */
  score: number;

  /**
   * How important this factor is.
   *
   * All weights do not have to add to 100.
   * The engine normalizes them automatically.
   */
  weight: number;

  /**
   * Where this information came from.
   */
  sourceType:
    | "official"
    | "market"
    | "community"
    | "research"
    | "estimated";

  /**
   * Optional explanation shown to users.
   */
  explanation?: string;
};

export type IntelligenceResult = {
  score: number;

  label:
    | "Excellent"
    | "Strong"
    | "Good"
    | "Moderate"
    | "Weak";

  confidence:
    | "High"
    | "Medium"
    | "Low";

  factors: IntelligenceFactor[];
};

function clamp(value: number) {
  return Math.max(0, Math.min(100, value));
}

function getScoreLabel(
  score: number
): IntelligenceResult["label"] {
  if (score >= 90) {
    return "Excellent";
  }

  if (score >= 80) {
    return "Strong";
  }

  if (score >= 70) {
    return "Good";
  }

  if (score >= 60) {
    return "Moderate";
  }

  return "Weak";
}

function getSourceConfidence(
  sourceType: IntelligenceFactor["sourceType"]
) {
  switch (sourceType) {
    case "official":
      return 1;

    case "market":
      return 0.9;

    case "research":
      return 0.8;

    case "community":
      return 0.7;

    case "estimated":
      return 0.4;

    default:
      return 0.5;
  }
}

function calculateConfidence(
  factors: IntelligenceFactor[]
): IntelligenceResult["confidence"] {
  if (factors.length === 0) {
    return "Low";
  }

  let weightedConfidence = 0;
  let totalWeight = 0;

  for (const factor of factors) {
    const confidence = getSourceConfidence(
      factor.sourceType
    );

    weightedConfidence += confidence * factor.weight;
    totalWeight += factor.weight;
  }

  if (totalWeight === 0) {
    return "Low";
  }

  const confidenceScore =
    weightedConfidence / totalWeight;

  if (confidenceScore >= 0.85) {
    return "High";
  }

  if (confidenceScore >= 0.65) {
    return "Medium";
  }

  return "Low";
}

export function calculateIntelligenceScore(
  factors: IntelligenceFactor[]
): IntelligenceResult {
  if (factors.length === 0) {
    return {
      score: 0,
      label: "Weak",
      confidence: "Low",
      factors: [],
    };
  }

  let weightedScore = 0;
  let totalWeight = 0;

  for (const factor of factors) {
    const safeScore = clamp(factor.score);

    weightedScore +=
      safeScore * factor.weight;

    totalWeight += factor.weight;
  }

  const rawScore =
    totalWeight > 0
      ? weightedScore / totalWeight
      : 0;

  const finalScore = Math.round(
    clamp(rawScore)
  );

  return {
    score: finalScore,
    label: getScoreLabel(finalScore),
    confidence: calculateConfidence(factors),
    factors,
  };
}