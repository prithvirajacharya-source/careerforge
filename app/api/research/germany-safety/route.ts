import {
  createSafetyRunner,
  SafetyResearchEvidence,
} from "@/lib/intelligence/createSafetyRunner";

export const dynamic = "force-dynamic";

const WORLD_BANK_HOMICIDE_URL =
  "https://api.worldbank.org/v2/country/DEU/indicator/VC.IHR.PSRC.P5?format=json&per_page=20";

const SAFE_AT_NIGHT_CSV_URL =
  "https://ourworldindata.org/grapher/safety-walking-alone.csv?v=1&csvType=full&useColumnShortNames=false";

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

  Important:
  we read the body as text first.

  This prevents:
  "Unexpected end of JSON input"

  when an external service returns an empty
  or malformed response.
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
      "World Bank returned an empty response. Please run Germany research again."
    );
  }

  try {
    return JSON.parse(
      rawText
    );
  } catch {
    console.error(
      "Invalid World Bank response:",
      rawText.slice(
        0,
        500
      )
    );

    throw new Error(
      "World Bank returned invalid JSON. Germany research was not stored."
    );
  }
}

/*
  =========================================================
  CSV FETCH
  =========================================================
*/

async function fetchCsv(
  url: string
) {
  const response =
    await fetch(url, {
      method: "GET",

      headers: {
        Accept:
          "text/csv,text/plain",

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
      `CSV request failed (${response.status}) for ${url}`
    );
  }

  if (
    !rawText ||
    !rawText.trim()
  ) {
    throw new Error(
      "Our World in Data returned an empty safe-at-night dataset."
    );
  }

  return rawText;
}

/*
  =========================================================
  WORLD BANK HOMICIDE
  =========================================================
*/

function extractLatestWorldBankValue(
  payload: unknown
) {
  const data =
    payload as WorldBankResponse;

  if (
    !Array.isArray(data) ||
    !Array.isArray(data[1])
  ) {
    throw new Error(
      "Unexpected World Bank homicide response format."
    );
  }

  const observation =
    data[1].find(
      (item) =>
        item &&
        typeof item.value ===
          "number" &&
        Number.isFinite(
          item.value
        )
    );

  if (!observation) {
    throw new Error(
      "No valid Germany homicide observation found."
    );
  }

  return {
    value:
      observation.value as number,

    year:
      observation.date ??
      "unknown",
  };
}

/*
  =========================================================
  CSV PARSER
  =========================================================
*/

function parseCsvLine(
  line: string
) {
  const values: string[] = [];

  let current = "";
  let inQuotes = false;

  for (
    let index = 0;
    index < line.length;
    index++
  ) {
    const character =
      line[index];

    if (
      character === '"'
    ) {
      if (
        inQuotes &&
        line[index + 1] === '"'
      ) {
        current += '"';
        index++;
      } else {
        inQuotes =
          !inQuotes;
      }

      continue;
    }

    if (
      character === "," &&
      !inQuotes
    ) {
      values.push(
        current
      );

      current = "";

      continue;
    }

    current +=
      character;
  }

  values.push(
    current
  );

  return values;
}

/*
  =========================================================
  SAFE AT NIGHT
  =========================================================
*/

function extractLatestSafeAtNight(
  csv: string
) {
  const lines =
    csv
      .split(/\r?\n/)
      .filter(
        (line) =>
          line.trim().length >
          0
      );

  if (
    lines.length <
    2
  ) {
    throw new Error(
      "Safe-at-night CSV contains no data."
    );
  }

  const headers =
    parseCsvLine(
      lines[0]
    );

  const entityIndex =
    headers.findIndex(
      (header) =>
        header.trim() ===
        "Entity"
    );

  const yearIndex =
    headers.findIndex(
      (header) =>
        header.trim() ===
        "Year"
    );

  const valueIndex =
    headers.findIndex(
      (header) => {
        const clean =
          header.trim();

        return (
          clean !==
            "Entity" &&
          clean !==
            "Code" &&
          clean !==
            "Year"
        );
      }
    );

  if (
    entityIndex < 0 ||
    yearIndex < 0 ||
    valueIndex < 0
  ) {
    throw new Error(
      "Could not identify required columns in safe-at-night CSV."
    );
  }

  const germanyRows =
    lines
      .slice(1)

      .map(
        parseCsvLine
      )

      .filter(
        (row) =>
          row[
            entityIndex
          ]?.trim() ===
          "Germany"
      )

      .map(
        (row) => ({
          year:
            Number(
              row[
                yearIndex
              ]
            ),

          value:
            Number(
              row[
                valueIndex
              ]
            ),
        })
      )

      .filter(
        (row) =>
          Number.isFinite(
            row.year
          ) &&
          Number.isFinite(
            row.value
          ) &&
          row.value >=
            0 &&
          row.value <=
            100
      )

      .sort(
        (
          left,
          right
        ) =>
          right.year -
          left.year
      );

  if (
    germanyRows.length ===
    0
  ) {
    throw new Error(
      "No Germany safe-at-night observation found."
    );
  }

  return germanyRows[0];
}

/*
  =========================================================
  GERMANY EVIDENCE COLLECTOR
  =========================================================
*/

async function collectGermanySafetyEvidence(): Promise<SafetyResearchEvidence> {
  const [
    homicidePayload,
    safeAtNightCsv,
  ] =
    await Promise.all([
      fetchJson(
        WORLD_BANK_HOMICIDE_URL
      ),

      fetchCsv(
        SAFE_AT_NIGHT_CSV_URL
      ),
    ]);

  const homicide =
    extractLatestWorldBankValue(
      homicidePayload
    );

  const safeAtNight =
    extractLatestSafeAtNight(
      safeAtNightCsv
    );

  const unsafeAtNight =
    100 -
    safeAtNight.value;

  return {
    metrics: {
      homicideRate:
        homicide.value,

      unsafeAtNight,
    },

    sourceName:
      "World Bank / UNODC + Our World in Data",

    sourceUrl:
      WORLD_BANK_HOMICIDE_URL,

    evidenceData: {
      homicide_rate:
        homicide.value,

      homicide_year:
        homicide.year,

      safe_at_night_percent:
        safeAtNight.value,

      safe_at_night_year:
        safeAtNight.year,

      unsafe_at_night_percent:
        unsafeAtNight,
    },

    evidenceText: [
      `• Intentional homicide rate: ${homicide.value} per 100,000 inhabitants.`,

      `• Homicide observation year: ${homicide.year}.`,

      `• Population reporting feeling safe walking alone at night: ${safeAtNight.value.toFixed(
        1
      )}%.`,

      `• Perceived-safety observation year: ${safeAtNight.year}.`,

      `• SEKUR unsafe-at-night equivalent: ${unsafeAtNight.toFixed(
        1
      )}%.`,
    ],

    additionalReasoning: [
      "SEKUR did not estimate personal-crime exposure, property-crime exposure or homicide trend.",

      "Missing indicator weights were redistributed proportionally.",
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
      "germany",

    countryName:
      "Germany",

    collectEvidence:
      collectGermanySafetyEvidence,
  });