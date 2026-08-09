import {
  createSafetyRunner,
  SafetyResearchEvidence,
} from "@/lib/intelligence/createSafetyRunner";

export const dynamic = "force-dynamic";

const WORLD_BANK_HOMICIDE_URL =
  "https://api.worldbank.org/v2/country/IND/indicator/VC.IHR.PSRC.P5?format=json&per_page=20";

type WorldBankObservation = {
  date?: string;
  value?: number | null;
};

type WorldBankResponse = [
  unknown,
  WorldBankObservation[]
];

/*
  =========================================================
  SAFE JSON FETCH
  =========================================================

  Read as text first so an empty/malformed response
  cannot crash with "Unexpected end of JSON input".
*/

async function fetchJson(
  url: string
) {
  const response =
    await fetch(url, {
      method: "GET",

      headers: {
        Accept:
          "application/json",

        "User-Agent":
          "SEKUR-Research/0.1",
      },

      cache:
        "no-store",
    });

  const rawText =
    await response.text();

  if (!response.ok) {
    throw new Error(
      `External data request failed (${response.status}) for ${url}`
    );
  }

  if (
    !rawText ||
    !rawText.trim()
  ) {
    throw new Error(
      "World Bank returned an empty response for India."
    );
  }

  try {
    return JSON.parse(
      rawText
    );
  } catch {
    console.error(
      "Invalid World Bank India response:",
      rawText.slice(
        0,
        500
      )
    );

    throw new Error(
      "World Bank returned invalid JSON for India."
    );
  }
}

/*
  =========================================================
  HOMICIDE DATA
  =========================================================
*/

function extractHomicideData(
  payload: unknown
) {
  const data =
    payload as WorldBankResponse;

  if (
    !Array.isArray(data) ||
    !Array.isArray(data[1])
  ) {
    throw new Error(
      "Unexpected World Bank India homicide response format."
    );
  }

  const valid =
    data[1].filter(
      (item) =>
        item &&
        typeof item.value ===
          "number" &&
        Number.isFinite(
          item.value
        )
    );

  if (
    valid.length === 0
  ) {
    throw new Error(
      "No valid India homicide observation found."
    );
  }

  const latest =
    valid[0];

  const previous =
    valid[1];

  return {
    homicideRate:
      latest.value as number,

    homicideYear:
      latest.date ??
      "unknown",

    previousHomicideRate:
      typeof previous?.value ===
      "number"
        ? previous.value
        : undefined,

    previousHomicideYear:
      previous?.date,
  };
}

/*
  =========================================================
  INDIA-SPECIFIC EVIDENCE
  =========================================================

  India currently has enough data for:

  homicide = 30%
  trend    = 5%

  Total coverage = 35%.

  That is below SEKUR Safety v3's
  minimum publishable threshold of 40%.

  The shared factory will therefore:

  - store the research run
  - mark it insufficient
  - create NO pending suggestion
*/

async function collectIndiaSafetyEvidence(): Promise<SafetyResearchEvidence> {
  const homicidePayload =
    await fetchJson(
      WORLD_BANK_HOMICIDE_URL
    );

  const homicide =
    extractHomicideData(
      homicidePayload
    );

  return {
    metrics: {
      homicideRate:
        homicide.homicideRate,

      previousHomicideRate:
        homicide.previousHomicideRate,
    },

    sourceName:
      "World Bank / UNODC",

    sourceUrl:
      WORLD_BANK_HOMICIDE_URL,

    evidenceData: {
      homicide_rate:
        homicide.homicideRate,

      homicide_year:
        homicide.homicideYear,

      previous_homicide_rate:
        homicide.previousHomicideRate ??
        null,

      previous_homicide_year:
        homicide.previousHomicideYear ??
        null,

      perceived_safety:
        null,

      personal_crime_exposure:
        null,

      property_crime_exposure:
        null,
    },

    evidenceText: [
      `• Intentional homicide rate: ${homicide.homicideRate} per 100,000 inhabitants.`,

      `• Homicide observation year: ${homicide.homicideYear}.`,

      homicide.previousHomicideRate !==
      undefined
        ? `• Previous homicide rate: ${homicide.previousHomicideRate} per 100,000 (${homicide.previousHomicideYear ?? "unknown year"}).`
        : "• Previous comparable homicide rate unavailable.",

      "• Comparable perceived-safety observation unavailable.",

      "• Comparable personal-crime exposure unavailable.",

      "• Comparable property-crime exposure unavailable.",
    ],

    additionalReasoning: [
      "SEKUR did not fabricate missing safety indicators.",

      "India currently has only homicide and homicide-trend components available to this runner.",

      "This provides 35% methodology coverage, below the 40% minimum required for a publishable Safety recommendation.",
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
      "india",

    countryName:
      "India",

    collectEvidence:
      collectIndiaSafetyEvidence,
  });