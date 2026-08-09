import {
  createSafetyRunner,
  SafetyResearchEvidence,
} from "@/lib/intelligence/createSafetyRunner";

export const dynamic = "force-dynamic";

/*
  =========================================================
  SOURCES
  =========================================================
*/

const JUDICIAL_STATS_URL =
  "https://bra.se/english/statistics/statistics-from-the-judicial-system";

const CRIME_SURVEY_URL =
  "https://bra.se/english/publications/archive/2025-11-03-swedish-crime-survey-2025";

/*
  =========================================================
  TYPES
  =========================================================
*/

type SwedenSafetyEvidence = {
  lethalViolenceCases: number;

  lethalViolenceRate: number;

  previousLethalViolenceRate: number;

  personalCrimeExposure: number;

  propertyCrimeExposure: number;

  unsafeAtNight: number;
};

/*
  =========================================================
  FETCH OFFICIAL BRÅ PAGE
  =========================================================
*/

async function fetchOfficialPage(
  url: string
) {
  const response =
    await fetch(url, {
      method: "GET",

      headers: {
        Accept:
          "text/html,application/xhtml+xml",

        "User-Agent":
          "SEKUR-Research/0.1 (+human-reviewed intelligence)",
      },

      cache:
        "no-store",
    });

  const rawText =
    await response.text();

  if (!response.ok) {
    throw new Error(
      `Official Brå source request failed (${response.status}) for ${url}`
    );
  }

  if (
    !rawText ||
    !rawText.trim()
  ) {
    throw new Error(
      "Brå returned an empty response."
    );
  }

  return rawText;
}

/*
  =========================================================
  HTML → TEXT
  =========================================================
*/

function htmlToText(
  html: string
) {
  return html
    .replace(
      /<script[\s\S]*?<\/script>/gi,
      " "
    )

    .replace(
      /<style[\s\S]*?<\/style>/gi,
      " "
    )

    .replace(
      /<[^>]+>/g,
      " "
    )

    .replace(
      /&nbsp;/gi,
      " "
    )

    .replace(
      /&amp;/gi,
      "&"
    )

    .replace(
      /&quot;/gi,
      '"'
    )

    .replace(
      /&#39;/gi,
      "'"
    )

    .replace(
      /\s+/g,
      " "
    )

    .trim();
}

/*
  =========================================================
  GENERIC NUMBER EXTRACTOR
  =========================================================
*/

function extractNumber(
  text: string,
  patterns: RegExp[],
  label: string
) {
  for (
    const pattern of
    patterns
  ) {
    const match =
      text.match(
        pattern
      );

    if (
      match?.[1]
    ) {
      const value =
        Number(
          match[1].replace(
            ",",
            "."
          )
        );

      if (
        Number.isFinite(
          value
        )
      ) {
        return value;
      }
    }
  }

  throw new Error(
    `Could not extract ${label} from the current Brå source.`
  );
}

/*
  =========================================================
  EXTRACT SWEDEN EVIDENCE
  =========================================================
*/

function extractSwedenSafetyEvidence(
  judicialText: string,
  surveyText: string
): SwedenSafetyEvidence {
  const lethalViolenceCases =
    extractNumber(
      judicialText,

      [
        /In 2025,\s*([0-9]+)\s*cases of lethal violence were confirmed in Sweden/i,

        /In 2025\s*([0-9]+)\s*cases of lethal violence were confirmed in Sweden/i,
      ],

      "lethal violence cases"
    );

  const lethalViolenceRate =
    extractNumber(
      judicialText,

      [
        /confirmed cases of lethal violence was\s*([0-9]+(?:[.,][0-9]+)?)\s*cases per 100,000 inhabitants in 2025/i,
      ],

      "2025 lethal violence rate"
    );

  const previousLethalViolenceRate =
    extractNumber(
      judicialText,

      [
        /lower level than in 2024\s*\(([0-9]+(?:[.,][0-9]+)?)\)/i,
      ],

      "2024 lethal violence rate"
    );

  const personalCrimeExposure =
    extractNumber(
      surveyText,

      [
        /One in five people\s*\(([0-9]+(?:[.,][0-9]+)?)%\).*?exposed to one or more offences against the person in 2024/i,
      ],

      "personal crime exposure"
    );

  const propertyCrimeExposure =
    extractNumber(
      surveyText,

      [
        /fallen from 14\.6 per cent to\s*([0-9]+(?:[.,][0-9]+)?)\s*per cent in 2024/i,

        /property offences.*?([0-9]+(?:[.,][0-9]+)?)\s*per cent in 2024/i,
      ],

      "property crime exposure"
    );

  const unsafeAtNight =
    extractNumber(
      surveyText,

      [
        /A quarter\s*\(([0-9]+(?:[.,][0-9]+)?)%\).*?feel unsafe outdoors late at night/i,

        /([0-9]+(?:[.,][0-9]+)?)%\s*of the population in 2025 state that they feel unsafe outdoors late at night/i,
      ],

      "perceived unsafety at night"
    );

  return {
    lethalViolenceCases,

    lethalViolenceRate,

    previousLethalViolenceRate,

    personalCrimeExposure,

    propertyCrimeExposure,

    unsafeAtNight,
  };
}

/*
  =========================================================
  SWEDEN EVIDENCE COLLECTOR
  =========================================================

  Everything Sweden-specific lives here.

  The shared factory handles:

  - authentication
  - admin authorization
  - current live score
  - duplicate pending protection
  - scoring
  - coverage
  - confidence
  - research history
  - publishability
  - pending suggestions
  - API response
*/

async function collectSwedenSafetyEvidence(): Promise<SafetyResearchEvidence> {
  /*
    Fetch both official Brå sources simultaneously.
  */

  const [
    judicialHtml,
    surveyHtml,
  ] =
    await Promise.all([
      fetchOfficialPage(
        JUDICIAL_STATS_URL
      ),

      fetchOfficialPage(
        CRIME_SURVEY_URL
      ),
    ]);

  /*
    Convert HTML to searchable text.
  */

  const judicialText =
    htmlToText(
      judicialHtml
    );

  const surveyText =
    htmlToText(
      surveyHtml
    );

  /*
    Extract measurements.
  */

  const evidence =
    extractSwedenSafetyEvidence(
      judicialText,
      surveyText
    );

  /*
    Return standardized evidence package.
  */

  return {
    metrics: {
      homicideRate:
        evidence
          .lethalViolenceRate,

      previousHomicideRate:
        evidence
          .previousLethalViolenceRate,

      personalCrimeExposure:
        evidence
          .personalCrimeExposure,

      propertyCrimeExposure:
        evidence
          .propertyCrimeExposure,

      unsafeAtNight:
        evidence
          .unsafeAtNight,
    },

    sourceName:
      "Brå — Swedish National Council for Crime Prevention",

    sourceUrl:
      CRIME_SURVEY_URL,

    evidenceData: {
      lethal_violence_cases:
        evidence
          .lethalViolenceCases,

      homicide_rate:
        evidence
          .lethalViolenceRate,

      previous_homicide_rate:
        evidence
          .previousLethalViolenceRate,

      personal_crime_exposure:
        evidence
          .personalCrimeExposure,

      property_crime_exposure:
        evidence
          .propertyCrimeExposure,

      unsafe_at_night:
        evidence
          .unsafeAtNight,
    },

    evidenceText: [
      `• Confirmed lethal violence in 2025: ${evidence.lethalViolenceCases} cases.`,

      `• Lethal-violence rate in 2025: ${evidence.lethalViolenceRate} per 100,000 inhabitants.`,

      `• Lethal-violence rate in 2024: ${evidence.previousLethalViolenceRate} per 100,000 inhabitants.`,

      `• Personal-crime exposure in 2024: ${evidence.personalCrimeExposure}%.`,

      `• Property-crime exposure in 2024: ${evidence.propertyCrimeExposure}%.`,

      `• Feeling unsafe outdoors late at night: ${evidence.unsafeAtNight}%.`,
    ],

    additionalReasoning: [
      "Sweden currently provides all five components required by SEKUR Safety methodology.",

      "No missing Safety component was estimated or fabricated.",
    ],
  };
}

/*
  =========================================================
  ROUTE
  =========================================================
*/

export const POST =
  createSafetyRunner({
    countrySlug:
      "sweden",

    countryName:
      "Sweden",

    collectEvidence:
      collectSwedenSafetyEvidence,
  });