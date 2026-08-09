/*
  SEKUR Safety Benchmarks v1
  ==========================

  PURPOSE

  Centralise the international benchmarks used by
  SEKUR's Safety methodology.

  IMPORTANT

  These are methodology parameters — not raw country data.

  Country data should come from research runners and
  trusted sources such as UNODC, World Bank, OECD and
  national statistical authorities.

  Keeping benchmarks separate means we can recalibrate
  SEKUR without rewriting every country's research runner.
*/

export const SAFETY_BENCHMARK_VERSION =
  "SEKUR-SAFETY-BENCHMARKS-1.0";

/*
  ========================================================
  HOMICIDE
  ========================================================

  International intentional homicide rate
  per 100,000 inhabitants.

  SEKUR v1 reference points:

  Exceptional safety:     0
  Very safe:               1
  Safe:                    2
  Moderate:                5
  High risk:              10
  Very high risk:         20+

  Instead of saying:

      10 homicides = automatically zero

  we use a curved scoring model.

  This prevents relatively small differences among
  low-homicide countries from producing huge score changes.
*/

export const HOMICIDE_BENCHMARKS = {
  exceptional: 0,
  verySafe: 1,
  safe: 2,
  moderate: 5,
  highRisk: 10,
  veryHighRisk: 20,
};

/*
  ========================================================
  PERCEIVED SAFETY
  ========================================================

  Percentage of people who say they feel SAFE walking
  alone at night.

  This format matches common international survey
  indicators more naturally than "percentage unsafe".

  Around three quarters feeling safe represents a
  useful international reference point.
*/

export const PERCEIVED_SAFETY_BENCHMARKS = {
  exceptional: 90,
  verySafe: 80,
  reference: 74,
  moderate: 60,
  low: 40,
};

/*
  ========================================================
  DATA QUALITY
  ========================================================

  SEKUR should distinguish between:

  - standardized international evidence
  - official national evidence
  - research estimates
  - weak / incomplete evidence

  Confidence does NOT directly mean safety.

  It describes how strongly we trust the input data.
*/

export type SafetyDataConfidence =
  | "very-high"
  | "high"
  | "medium"
  | "low";

export const DATA_CONFIDENCE_MULTIPLIER = {
  "very-high": 1,
  high: 0.98,
  medium: 0.94,
  low: 0.88,
};

/*
  ========================================================
  HOMICIDE NORMALIZATION
  ========================================================

  Piecewise interpolation gives us much better behaviour
  than the original linear 0–10 model.

  Examples approximately become:

  0.0  -> 100
  1.0  ->  95
  2.0  ->  88
  5.0  ->  70
  10.0 ->  45
  20.0 ->  10
  30+  ->   0

  This means Sweden and Germany are not punished heavily
  simply because their rate is 0.8–1 instead of exactly 0.
*/

export function normalizeHomicideRate(
  rate: number
) {
  validateNonNegative(
    rate,
    "homicide rate"
  );

  const points = [
    { x: 0, y: 100 },
    { x: 1, y: 95 },
    { x: 2, y: 88 },
    { x: 5, y: 70 },
    { x: 10, y: 45 },
    { x: 20, y: 10 },
    { x: 30, y: 0 },
  ];

  return Math.round(
    interpolate(
      rate,
      points
    )
  );
}

/*
  ========================================================
  PERCEIVED SAFETY NORMALIZATION
  ========================================================

  Input:
      percentage feeling SAFE walking alone at night.

  Examples:

  90% -> 100
  80% ->  92
  74% ->  85
  60% ->  70
  40% ->  45
  20% ->  20
   0% ->   0
*/

export function normalizePerceivedSafety(
  safeAtNightPercent: number
) {
  validatePercentage(
    safeAtNightPercent,
    "safe-at-night percentage"
  );

  const points = [
    { x: 0, y: 0 },
    { x: 20, y: 20 },
    { x: 40, y: 45 },
    { x: 60, y: 70 },
    { x: 74, y: 85 },
    { x: 80, y: 92 },
    { x: 90, y: 100 },
    { x: 100, y: 100 },
  ];

  return Math.round(
    interpolate(
      safeAtNightPercent,
      points
    )
  );
}

/*
  ========================================================
  GENERIC LOWER-IS-BETTER NORMALIZATION
  ========================================================

  Useful later for comparable victimisation metrics.

  Example:

  0% exposure   = 100
  reference     = referenceScore
  highExposure  = 0

  We keep this generic because international victimisation
  datasets are not yet identical across every SEKUR country.
*/

export function normalizeLowerIsBetter(
  value: number,
  reference: number,
  highExposure: number,
  referenceScore = 70
) {
  validatePercentage(
    value,
    "exposure percentage"
  );

  if (
    reference <= 0 ||
    highExposure <= reference
  ) {
    throw new Error(
      "Invalid normalization benchmarks."
    );
  }

  const points = [
    { x: 0, y: 100 },
    {
      x: reference,
      y: referenceScore,
    },
    {
      x: highExposure,
      y: 0,
    },
    { x: 100, y: 0 },
  ];

  return Math.round(
    interpolate(
      value,
      points
    )
  );
}

/*
  ========================================================
  INTERPOLATION
  ========================================================
*/

type Point = {
  x: number;
  y: number;
};

function interpolate(
  value: number,
  points: Point[]
) {
  if (value <= points[0].x) {
    return points[0].y;
  }

  const last =
    points[points.length - 1];

  if (value >= last.x) {
    return last.y;
  }

  for (
    let index = 0;
    index < points.length - 1;
    index++
  ) {
    const left =
      points[index];

    const right =
      points[index + 1];

    if (
      value >= left.x &&
      value <= right.x
    ) {
      const position =
        (value - left.x) /
        (right.x - left.x);

      return (
        left.y +
        position *
          (right.y - left.y)
      );
    }
  }

  throw new Error(
    "Could not interpolate safety benchmark."
  );
}

/*
  ========================================================
  VALIDATION
  ========================================================
*/

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