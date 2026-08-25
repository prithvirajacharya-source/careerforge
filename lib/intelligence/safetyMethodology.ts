import {
  normalizeHomicideRate,
  normalizeLowerIsBetter,
  normalizePerceivedSafety,
  SAFETY_BENCHMARK_VERSION,
} from "./safetyBenchmarks";

/*
  SEKUR Safety Methodology v3
  ==========================

  PURPOSE

  Score safety even when some countries do not have
  all four comparable indicators available.

  KEY IMPROVEMENT

  Missing data is now allowed.

  Instead of inventing missing metrics, SEKUR:
  1. scores only the metrics that exist;
  2. redistributes the available weights;
  3. reports data coverage;
  4. reports confidence;
  5. keeps the human-review gate.

  This makes Germany, Canada, India and Sweden
  comparable without pretending every country has
  identical source coverage.
*/

export type SafetyMetrics = {
  /*
    Intentional homicide rate per 100,000.
  */
  homicideRate?: number;

  /*
    Previous homicide rate.
    Used only for trend if available.
  */
  previousHomicideRate?: number;

  /*
    Percentage exposed to one or more
    offences against the person.
  */
  personalCrimeExposure?: number;

  /*
    Percentage of households exposed
    to property crime.
  */
  propertyCrimeExposure?: number;

  /*
    Percentage reporting they feel
    unsafe outdoors at night.
  */
  unsafeAtNight?: number;
};

export type SafetyComponentKey =
  | "homicide"
  | "personalCrime"
  | "propertyCrime"
  | "perceivedSafety"
  | "trend";

export type SafetyComponentScores = {
  homicide?: number;
  personalCrime?: number;
  propertyCrime?: number;
  perceivedSafety?: number;
  trend?: number;
};

export type SafetyConfidence =
  | "very-high"
  | "high"
  | "medium"
  | "low"
  | "insufficient";

export type SafetyCoverage = {
  availableWeight: number;
  totalWeight: number;
  coveragePercent: number;
  availableComponents: SafetyComponentKey[];
  missingComponents: SafetyComponentKey[];
};

export type SafetyScoreResult = {
  score: number | null;

  components: SafetyComponentScores;

  coverage: SafetyCoverage;

  confidence: SafetyConfidence;

  methodologyVersion: string;

  benchmarkVersion: string;

  explanation: string[];
};

export const SAFETY_METHODOLOGY_VERSION =
  "SEKUR-SAFETY-3.0";

/*
  ========================================================
  BASE WEIGHTS
  ========================================================

  Homicide                30%
  Personal crime          30%
  Perceived safety        20%
  Property crime          15%
  Trend                    5%

                          100%
*/

const WEIGHTS: Record<
  SafetyComponentKey,
  number
> = {
  homicide: 0.3,
  personalCrime: 0.3,
  perceivedSafety: 0.2,
  propertyCrime: 0.15,
  trend: 0.05,
};

/*
  ========================================================
  PERSONAL CRIME
  ========================================================

  Transparent SEKUR v3 benchmark.

  0% exposure   -> 100
  20%           ->  70
  50%+          ->   0
*/

function scorePersonalCrime(
  exposurePercent: number
) {
  validatePercentage(
    exposurePercent,
    "personal crime exposure"
  );

  return normalizeLowerIsBetter(
    exposurePercent,
    20,
    50,
    70
  );
}

/*
  ========================================================
  PROPERTY CRIME
  ========================================================

  0% exposure   -> 100
  20%           ->  60
  40%+          ->   0
*/

function scorePropertyCrime(
  exposurePercent: number
) {
  validatePercentage(
    exposurePercent,
    "property crime exposure"
  );

  return normalizeLowerIsBetter(
    exposurePercent,
    20,
    40,
    60
  );
}

/*
  ========================================================
  PERCEIVED SAFETY
  ========================================================

  Input is percentage feeling UNSAFE.

  Benchmark function expects percentage SAFE.
*/

function scorePerceivedSafety(
  unsafePercent: number
) {
  validatePercentage(
    unsafePercent,
    "unsafe-at-night percentage"
  );

  const safePercent =
    100 - unsafePercent;

  return normalizePerceivedSafety(
    safePercent
  );
}

/*
  ========================================================
  TREND
  ========================================================

  Trend exists only if current and previous
  homicide rates are both available.

  Improvement >2% -> 100
  Stable ±2%      ->  50
  Worsening >2%   ->   0
*/

function scoreTrend(
  currentRate: number,
  previousRate: number
) {
  validateNonNegative(
    currentRate,
    "current homicide rate"
  );

  validateNonNegative(
    previousRate,
    "previous homicide rate"
  );

  if (previousRate === 0) {
    return currentRate === 0
      ? 50
      : 0;
  }

  const change =
    (currentRate - previousRate) /
    previousRate;

  if (change < -0.02) {
    return 100;
  }

  if (change > 0.02) {
    return 0;
  }

  return 50;
}

/*
  ========================================================
  MAIN CALCULATION
  ========================================================
*/

export function calculateSafetyScore(
  metrics: SafetyMetrics
): SafetyScoreResult {
  validateMetrics(metrics);

  const components: SafetyComponentScores = {};

  const explanation: string[] = [];

  const availableComponents:
    SafetyComponentKey[] = [];

  const missingComponents:
    SafetyComponentKey[] = [];

  /*
    ----------------------------------------
    HOMICIDE
    ----------------------------------------
  */

  if (
    metrics.homicideRate !==
    undefined
  ) {
    const score =
      normalizeHomicideRate(
        metrics.homicideRate
      );

    components.homicide =
      score;

    availableComponents.push(
      "homicide"
    );

    explanation.push(
      `Homicide rate: ${metrics.homicideRate} per 100,000.`
    );

    explanation.push(
      `Homicide component: ${score}/100 × 30%.`
    );
  } else {
    missingComponents.push(
      "homicide"
    );

    explanation.push(
      "Homicide component unavailable."
    );
  }

  /*
    ----------------------------------------
    PERSONAL CRIME
    ----------------------------------------
  */

  if (
    metrics.personalCrimeExposure !==
    undefined
  ) {
    const score =
      scorePersonalCrime(
        metrics.personalCrimeExposure
      );

    components.personalCrime =
      score;

    availableComponents.push(
      "personalCrime"
    );

    explanation.push(
      `Personal-crime exposure: ${metrics.personalCrimeExposure}%.`
    );

    explanation.push(
      `Personal-crime component: ${score}/100 × 30%.`
    );
  } else {
    missingComponents.push(
      "personalCrime"
    );

    explanation.push(
      "Personal-crime component unavailable."
    );
  }

  /*
    ----------------------------------------
    PERCEIVED SAFETY
    ----------------------------------------
  */

  if (
    metrics.unsafeAtNight !==
    undefined
  ) {
    const score =
      scorePerceivedSafety(
        metrics.unsafeAtNight
      );

    components.perceivedSafety =
      score;

    availableComponents.push(
      "perceivedSafety"
    );

    const safePercent =
      Math.round(
        100 -
          metrics.unsafeAtNight
      );

    explanation.push(
      `Safe walking at night equivalent: ${safePercent}%.`
    );

    explanation.push(
      `Perceived-safety component: ${score}/100 × 20%.`
    );
  } else {
    missingComponents.push(
      "perceivedSafety"
    );

    explanation.push(
      "Perceived-safety component unavailable."
    );
  }

  /*
    ----------------------------------------
    PROPERTY CRIME
    ----------------------------------------
  */

  if (
    metrics.propertyCrimeExposure !==
    undefined
  ) {
    const score =
      scorePropertyCrime(
        metrics.propertyCrimeExposure
      );

    components.propertyCrime =
      score;

    availableComponents.push(
      "propertyCrime"
    );

    explanation.push(
      `Property-crime exposure: ${metrics.propertyCrimeExposure}%.`
    );

    explanation.push(
      `Property-crime component: ${score}/100 × 15%.`
    );
  } else {
    missingComponents.push(
      "propertyCrime"
    );

    explanation.push(
      "Property-crime component unavailable."
    );
  }

  /*
    ----------------------------------------
    TREND
    ----------------------------------------
  */

  if (
    metrics.homicideRate !==
      undefined &&
    metrics.previousHomicideRate !==
      undefined
  ) {
    const score =
      scoreTrend(
        metrics.homicideRate,
        metrics.previousHomicideRate
      );

    components.trend =
      score;

    availableComponents.push(
      "trend"
    );

    explanation.push(
      `Trend component: ${score}/100 × 5%.`
    );
  } else {
    missingComponents.push(
      "trend"
    );

    explanation.push(
      "Trend component unavailable."
    );
  }

  /*
    ========================================================
    COVERAGE
    ========================================================

    Available weight tells us how much of the
    full methodology is actually supported
    by evidence.

    Example:

    homicide 30%
    perceived safety 20%

    Total available = 50%
  */

  const availableWeight =
    availableComponents.reduce(
      (sum, key) =>
        sum + WEIGHTS[key],
      0
    );

  const totalWeight = 1;

  const coveragePercent =
    Math.round(
      availableWeight * 100
    );

  /*
    ========================================================
    MINIMUM COVERAGE
    ========================================================

    Do not output a Safety Score if less than
    50% of the methodology is supported.

    This prevents a country from receiving a
    "Safety Score" based on one weak metric.
  */

  if (availableWeight < 0.5) {
    explanation.push(
      `Evidence coverage is only ${coveragePercent}%.`
    );

    explanation.push(
      "SEKUR requires at least 50% methodology coverage before generating a Safety Score."
    );

    return {
      score: null,

      components,

      coverage: {
        availableWeight,
        totalWeight,
        coveragePercent,
        availableComponents,
        missingComponents,
      },

      confidence:
        "insufficient",

      methodologyVersion:
        SAFETY_METHODOLOGY_VERSION,

      benchmarkVersion:
        SAFETY_BENCHMARK_VERSION,

      explanation,
    };
  }

  /*
    ========================================================
    WEIGHT REDISTRIBUTION
    ========================================================

    Only available components participate.

    Example:

    homicide = 30%
    perceived safety = 20%

    Available weight = 50%.

    New effective weights:

    homicide:
      30 / 50 = 60%

    perceived safety:
      20 / 50 = 40%

    No missing value is invented.
  */

  let weightedScore = 0;

  for (
    const key of
      availableComponents
  ) {
    const componentScore =
      components[key];

    if (
      componentScore ===
      undefined
    ) {
      continue;
    }

    const normalizedWeight =
      WEIGHTS[key] /
      availableWeight;

    weightedScore +=
      componentScore *
      normalizedWeight;
  }

  const score =
    Math.round(
      clamp(weightedScore)
    );

  /*
    ========================================================
    CONFIDENCE
    ========================================================

    Confidence reflects evidence coverage,
    not how safe the country is.

    90–100% -> very high
    70–89%  -> high
    50–69%  -> medium
    40–49%  -> low
  */

  const confidence =
    determineConfidence(
      coveragePercent
    );

  explanation.push(
    `Evidence coverage: ${coveragePercent}%.`
  );

  explanation.push(
    `Confidence: ${confidence}.`
  );

  explanation.push(
    "Missing indicators were not estimated. Available component weights were redistributed proportionally."
  );

  explanation.push(
    `Final SEKUR Safety Score: ${score}/100.`
  );

  return {
    score,

    components,

    coverage: {
      availableWeight,
      totalWeight,
      coveragePercent,
      availableComponents,
      missingComponents,
    },

    confidence,

    methodologyVersion:
      SAFETY_METHODOLOGY_VERSION,

    benchmarkVersion:
      SAFETY_BENCHMARK_VERSION,

    explanation,
  };
}

/*
  ========================================================
  CONFIDENCE
  ========================================================
*/

function determineConfidence(
  coveragePercent: number
): SafetyConfidence {
  if (
    coveragePercent >= 90
  ) {
    return "very-high";
  }

  if (
    coveragePercent >= 70
  ) {
    return "high";
  }

  if (
    coveragePercent >= 50
  ) {
    return "medium";
  }

  if (
    coveragePercent >= 40
  ) {
    return "low";
  }

  return "insufficient";
}

/*
  ========================================================
  VALIDATION
  ========================================================
*/

function validateMetrics(
  metrics: SafetyMetrics
) {
  if (
    metrics.homicideRate !==
    undefined
  ) {
    validateNonNegative(
      metrics.homicideRate,
      "homicide rate"
    );
  }

  if (
    metrics.previousHomicideRate !==
    undefined
  ) {
    validateNonNegative(
      metrics.previousHomicideRate,
      "previous homicide rate"
    );
  }

  if (
    metrics.personalCrimeExposure !==
    undefined
  ) {
    validatePercentage(
      metrics.personalCrimeExposure,
      "personal crime exposure"
    );
  }

  if (
    metrics.propertyCrimeExposure !==
    undefined
  ) {
    validatePercentage(
      metrics.propertyCrimeExposure,
      "property crime exposure"
    );
  }

  if (
    metrics.unsafeAtNight !==
    undefined
  ) {
    validatePercentage(
      metrics.unsafeAtNight,
      "unsafe-at-night percentage"
    );
  }
}

function validateNonNegative(
  value: number,
  label: string
) {
  if (
    !Number.isFinite(value) ||
    value < 0
  ) {
    throw new Error(
      `Invalid ${label}.`
    );
  }
}

function validatePercentage(
  value: number,
  label: string
) {
  if (
    !Number.isFinite(value) ||
    value < 0 ||
    value > 100
  ) {
    throw new Error(
      `Invalid ${label}.`
    );
  }
}

function clamp(
  value: number,
  minimum = 0,
  maximum = 100
) {
  return Math.min(
    maximum,
    Math.max(
      minimum,
      value
    )
  );
}
