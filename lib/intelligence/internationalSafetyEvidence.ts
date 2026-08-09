import {
  SafetyResearchEvidence,
} from "@/lib/intelligence/createSafetyRunner";

/*
  =========================================================
  GENERIC INTERNATIONAL SAFETY COLLECTOR — V2
  =========================================================

  Sources:

  - World Bank / UNODC homicide rate
  - UNODC / UN SDG perceived safety via OWID

  IMPORTANT CHANGE

  Perceived-safety data is OPTIONAL.

  Some countries have homicide data but no comparable
  safe-at-night observation.

  The collector must NOT fail in that case.

  Instead:

  - homicide is returned
  - homicide trend is returned when possible
  - perceived safety is omitted
  - Safety Methodology calculates coverage
  - insufficient coverage becomes a valid result

  This is how Norway should behave.
*/

type WorldBankObservation = {
  date?: string;

  value?:
    | number
    | null;
};

type WorldBankResponse = [
  unknown,
  WorldBankObservation[]
];

export type InternationalSafetyConfig = {
  countryName: string;

  worldBankCode: string;

  owidCountryName: string;
};

/*
  =========================================================
  FETCH HELPERS
  =========================================================
*/

async function fetchText(
  url: string,
  accept: string
) {
  const response =
    await fetch(url, {
      method: "GET",

      headers: {
        Accept:
          accept,

        "User-Agent":
          "SEKUR-Research/0.1",
      },

      cache:
        "no-store",
    });

  const text =
    await response.text();

  if (!response.ok) {
    throw new Error(
      `External research request failed (${response.status}) for ${url}`
    );
  }

  if (!text.trim()) {
    throw new Error(
      `External research source returned an empty response: ${url}`
    );
  }

  return text;
}

async function fetchJson(
  url: string
) {
  const raw =
    await fetchText(
      url,
      "application/json"
    );

  try {
    return JSON.parse(
      raw
    );
  } catch {
    console.error(
      "SEKUR received invalid JSON:",
      raw.slice(
        0,
        500
      )
    );

    throw new Error(
      "International Safety source returned invalid JSON."
    );
  }
}

/*
  =========================================================
  WORLD BANK / UNODC HOMICIDE
  =========================================================
*/

function extractWorldBankObservations(
  payload: unknown
) {
  const data =
    payload as WorldBankResponse;

  if (
    !Array.isArray(data) ||
    !Array.isArray(data[1])
  ) {
    throw new Error(
      "Unexpected World Bank response format."
    );
  }

  const observations =
    data[1]
      .filter(
        (
          observation
        ) =>
          observation &&
          typeof observation.value ===
            "number" &&
          Number.isFinite(
            observation.value
          )
      )

      .map(
        (
          observation
        ) => ({
          year:
            observation.date ??
            "unknown",

          value:
            observation.value as number,
        })
      );

  if (
    observations.length ===
    0
  ) {
    throw new Error(
      "No valid homicide observations were returned."
    );
  }

  return observations;
}

/*
  =========================================================
  CSV PARSER
  =========================================================
*/

function parseCsvLine(
  line: string
) {
  const result: string[] =
    [];

  let current = "";

  let insideQuotes =
    false;

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
        insideQuotes &&
        line[index + 1] ===
          '"'
      ) {
        current += '"';

        index++;
      } else {
        insideQuotes =
          !insideQuotes;
      }

      continue;
    }

    if (
      character === "," &&
      !insideQuotes
    ) {
      result.push(
        current
      );

      current = "";

      continue;
    }

    current +=
      character;
  }

  result.push(
    current
  );

  return result;
}

/*
  =========================================================
  OPTIONAL PERCEIVED SAFETY
  =========================================================

  Important:

  This function now returns NULL when a country
  does not exist in the dataset.

  Missing data is NOT a technical failure.
*/

function extractSafeAtNight(
  csv: string,
  countryName: string
):
  | {
      year: number;
      value: number;
    }
  | null {
  const lines =
    csv
      .split(/\r?\n/)
      .filter(
        (
          line
        ) =>
          line.trim()
            .length >
          0
      );

  if (
    lines.length <
    2
  ) {
    /*
      Dataset itself is invalid.

      This IS a technical failure.
    */
    throw new Error(
      "Perceived-safety dataset contains no observations."
    );
  }

  const headers =
    parseCsvLine(
      lines[0]
    );

  const entityIndex =
    headers.findIndex(
      (
        header
      ) =>
        header.trim() ===
        "Entity"
    );

  const yearIndex =
    headers.findIndex(
      (
        header
      ) =>
        header.trim() ===
        "Year"
    );

  const valueIndex =
    headers.findIndex(
      (
        header
      ) => {
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
    entityIndex <
      0 ||
    yearIndex <
      0 ||
    valueIndex <
      0
  ) {
    throw new Error(
      "Could not identify perceived-safety CSV columns."
    );
  }

  const observations =
    lines
      .slice(1)

      .map(
        parseCsvLine
      )

      .filter(
        (
          row
        ) =>
          row[
            entityIndex
          ]?.trim() ===
          countryName
      )

      .map(
        (
          row
        ) => ({
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
        (
          observation
        ) =>
          Number.isFinite(
            observation.year
          ) &&
          Number.isFinite(
            observation.value
          ) &&
          observation.value >=
            0 &&
          observation.value <=
            100
      )

      .sort(
        (
          a,
          b
        ) =>
          b.year -
          a.year
      );

  /*
    No country observation is NOT an error.

    Example:
    Norway currently has no comparable observation
    in this dataset.

    Return null and let the methodology deal
    with missing evidence.
  */

  if (
    observations.length ===
    0
  ) {
    return null;
  }

  return observations[0];
}

/*
  =========================================================
  PUBLIC COLLECTOR
  =========================================================
*/

export async function collectInternationalSafetyEvidence(
  config: InternationalSafetyConfig
): Promise<SafetyResearchEvidence> {
  const homicideUrl =
    `https://api.worldbank.org/v2/country/${config.worldBankCode}/indicator/VC.IHR.PSRC.P5?format=json&per_page=20`;

  const perceivedSafetyUrl =
    "https://ourworldindata.org/grapher/safety-walking-alone.csv?v=1&csvType=full&useColumnShortNames=false";

  const [
    homicidePayload,
    perceivedSafetyCsv,
  ] =
    await Promise.all([
      fetchJson(
        homicideUrl
      ),

      fetchText(
        perceivedSafetyUrl,
        "text/csv,text/plain"
      ),
    ]);

  /*
    World Bank normally returns newest observations first.
  */

  const homicideObservations =
    extractWorldBankObservations(
      homicidePayload
    );

  const latestHomicide =
    homicideObservations[0];

  const previousHomicide =
    homicideObservations[1];

  /*
    Perceived safety is optional.
  */

  const safeAtNight =
    extractSafeAtNight(
      perceivedSafetyCsv,
      config.owidCountryName
    );

  /*
    =======================================================
    BUILD METRICS
    =======================================================
  */

  const metrics: SafetyResearchEvidence["metrics"] =
    {
      homicideRate:
        latestHomicide.value,

      previousHomicideRate:
        previousHomicide
          ?.value,
    };

  /*
    Only add perceived safety when the source
    actually contains an observation.
  */

  if (
    safeAtNight
  ) {
    metrics.unsafeAtNight =
      100 -
      safeAtNight.value;
  }

  /*
    =======================================================
    EVIDENCE DATA
    =======================================================
  */

  const evidenceData: Record<
    string,
    unknown
  > = {
    homicide_rate:
      latestHomicide.value,

    homicide_year:
      latestHomicide.year,

    previous_homicide_rate:
      previousHomicide
        ?.value ??
      null,

    previous_homicide_year:
      previousHomicide
        ?.year ??
      null,

    safe_at_night_percent:
      safeAtNight
        ?.value ??
      null,

    safe_at_night_year:
      safeAtNight
        ?.year ??
      null,

    unsafe_at_night_percent:
      safeAtNight
        ? 100 -
          safeAtNight.value
        : null,
  };

  /*
    =======================================================
    EVIDENCE TEXT
    =======================================================
  */

  const evidenceText: string[] =
    [
      `• Intentional homicide rate: ${latestHomicide.value} per 100,000 inhabitants (${latestHomicide.year}).`,
    ];

  if (
    previousHomicide
  ) {
    evidenceText.push(
      `• Previous homicide rate: ${previousHomicide.value} per 100,000 inhabitants (${previousHomicide.year}).`
    );
  } else {
    evidenceText.push(
      "• Previous comparable homicide observation unavailable."
    );
  }

  if (
    safeAtNight
  ) {
    evidenceText.push(
      `• Population reporting feeling safe walking alone at night: ${safeAtNight.value.toFixed(
        1
      )}% (${safeAtNight.year}).`
    );

    evidenceText.push(
      `• SEKUR unsafe-at-night equivalent: ${(
        100 -
        safeAtNight.value
      ).toFixed(
        1
      )}%.`
    );
  } else {
    evidenceText.push(
      `• No comparable perceived-safety observation was available for ${config.countryName}.`
    );
  }

  /*
    =======================================================
    RETURN
    =======================================================
  */

  return {
    metrics,

    sourceName:
      "World Bank / UNODC + UN SDG / Our World in Data",

    sourceUrl:
      homicideUrl,

    evidenceData,

    evidenceText,

    additionalReasoning: [
      "SEKUR uses only observations returned by the configured international datasets.",

      safeAtNight
        ? "Comparable perceived-safety evidence was available."
        : "Comparable perceived-safety evidence was unavailable and was not estimated.",

      "Missing personal-crime and property-crime indicators were not estimated.",

      "The Safety methodology determines coverage and publishability from the evidence actually available.",
    ],
  };
}