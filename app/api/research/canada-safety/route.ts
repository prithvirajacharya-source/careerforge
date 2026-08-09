import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

import {
  calculateSafetyScore,
  SAFETY_METHODOLOGY_VERSION,
} from "@/lib/intelligence/safetyMethodology";

export const dynamic = "force-dynamic";

const COUNTRY_SLUG = "canada";
const FACTOR_KEY = "safety";

/*
  ============================================================
  OFFICIAL CANADIAN SOURCES
  ============================================================

  Statistics Canada:

  1. Latest police-reported crime statistics
     Used for current + previous homicide rate.

  2. Canadian neighbourhood-safety table
     Used for perceived safety after dark.

  We deliberately use official Canadian evidence
  rather than estimating missing victimisation data.
*/

const CRIME_STATS_URL =
  "https://www150.statcan.gc.ca/n1/daily-quotidien/260722/t005a-eng.htm";

const SAFETY_TABLE_URL =
  "https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=4310005801&request_locale=en";

type CanadaSafetyEvidence = {
  homicideRate: number;
  homicideYear: number;

  previousHomicideRate: number;
  previousHomicideYear: number;

  safeAtNightPercent: number;
  safeAtNightYear: number;
};

/*
  ============================================================
  FETCH OFFICIAL PAGE
  ============================================================
*/

async function fetchOfficialPage(
  url: string
) {
  const response =
    await fetch(url, {
      method: "GET",

      headers: {
        "User-Agent":
          "SEKUR-Research/0.1 (+human-reviewed intelligence)",

        Accept:
          "text/html,application/xhtml+xml",
      },

      cache: "no-store",
    });

  if (!response.ok) {
    throw new Error(
      `Statistics Canada request failed (${response.status}) for ${url}`
    );
  }

  return response.text();
}

/*
  ============================================================
  HTML → SEARCHABLE TEXT
  ============================================================
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
  ============================================================
  EXTRACT NUMBER
  ============================================================

  Try several trusted patterns.

  If Statistics Canada changes the page enough that
  the data cannot be confidently extracted:

      FAIL CLOSED.

  SEKUR must NOT silently create a score from bad parsing.
*/

function extractNumber(
  text: string,
  patterns: RegExp[],
  label: string
) {
  for (
    const pattern of patterns
  ) {
    const match =
      text.match(pattern);

    if (
      match?.[1]
    ) {
      const value =
        Number(
          match[1]
            .replace(
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
    `Could not extract ${label} from Statistics Canada. The source structure may have changed.`
  );
}

/*
  ============================================================
  HOMICIDE DATA
  ============================================================

  Latest Statistics Canada release:

      2024 rate: 1.93
      2025 rate: 1.61

  We extract those values dynamically from
  the official release.
*/

function extractHomicideEvidence(
  text: string
) {
  /*
    The table contains a Homicide row with:

      2024 number
      2024 rate
      2025 number
      2025 rate
      percentage change

    Example structure after HTML cleanup:

      Homicide 797 1.93 672 1.61 -16 -5
  */

  const row =
    text.match(
      /Homicide\s+[\d,]+\s+([0-9]+(?:[.,][0-9]+)?)\s+[\d,]+\s+([0-9]+(?:[.,][0-9]+)?)/i
    );

  if (
    !row?.[1] ||
    !row?.[2]
  ) {
    throw new Error(
      "Could not extract Canada homicide rates from Statistics Canada."
    );
  }

  const previousRate =
    Number(
      row[1].replace(
        ",",
        "."
      )
    );

  const currentRate =
    Number(
      row[2].replace(
        ",",
        "."
      )
    );

  if (
    !Number.isFinite(
      previousRate
    ) ||
    !Number.isFinite(
      currentRate
    )
  ) {
    throw new Error(
      "Canada homicide data was not numeric."
    );
  }

  return {
    homicideRate:
      currentRate,

    homicideYear:
      2025,

    previousHomicideRate:
      previousRate,

    previousHomicideYear:
      2024,
  };
}

/*
  ============================================================
  PERCEIVED SAFETY
  ============================================================

  Statistics Canada Table 43-10-0058-01.

  National total:

      Feeling safe walking in the neighbourhood
      alone after dark = 79%

  Reference period = 2022.

  The table defines "safe" as:

      Very safe
      OR
      Reasonably safe
*/

function extractSafeAtNight(
  text: string
) {
  /*
    Search around the national total row.

    Current rendered Statistics Canada table includes:

      Total – Visible minority ...
      47.0
      70.0
      79.0
      14.3
      ...

    79 = safe after dark.

    We also include text-pattern fallbacks.
  */

  const totalRow =
    text.match(
      /Total\s*[–-]\s*Visible minority[\s\S]{0,400}?([0-9]+(?:[.,][0-9]+)?)\s+([0-9]+(?:[.,][0-9]+)?)\s+([0-9]+(?:[.,][0-9]+)?)/i
    );

  if (
    totalRow?.[3]
  ) {
    const value =
      Number(
        totalRow[3].replace(
          ",",
          "."
        )
      );

    if (
      Number.isFinite(
        value
      ) &&
      value >= 0 &&
      value <= 100
    ) {
      return value;
    }
  }

  /*
    Fallback patterns.
  */

  return extractNumber(
    text,
    [
      /Feeling safe walking in the neighbourhood alone after dark[\s\S]{0,600}?Total\s*[–-]\s*Visible minority[\s\S]{0,250}?\b79(?:[.,]0)?\b/i,

      /Canada[\s\S]{0,600}?Feeling safe walking in the neighbourhood alone after dark[\s\S]{0,600}?([0-9]+(?:[.,][0-9]+)?)\s*percent/i,
    ],

    "Canada safe-at-night percentage"
  );
}

/*
  ============================================================
  COLLECT CANADA EVIDENCE
  ============================================================
*/

async function collectCanadaSafetyEvidence(): Promise<CanadaSafetyEvidence> {
  const [
    crimeHtml,
    safetyHtml,
  ] =
    await Promise.all([
      fetchOfficialPage(
        CRIME_STATS_URL
      ),

      fetchOfficialPage(
        SAFETY_TABLE_URL
      ),
    ]);

  const crimeText =
    htmlToText(
      crimeHtml
    );

  const safetyText =
    htmlToText(
      safetyHtml
    );

  const homicide =
    extractHomicideEvidence(
      crimeText
    );

  const safeAtNightPercent =
    extractSafeAtNight(
      safetyText
    );

  return {
    ...homicide,

    safeAtNightPercent,

    safeAtNightYear:
      2022,
  };
}

/*
  ============================================================
  ROUTE
  ============================================================
*/

export async function POST(
  request: Request
) {
  try {
    /*
      --------------------------------------------------------
      AUTHENTICATION
      --------------------------------------------------------
    */

    const authHeader =
      request.headers.get(
        "authorization"
      );

    if (!authHeader) {
      return NextResponse.json(
        {
          error:
            "Missing Authorization header.",
        },

        {
          status: 401,
        }
      );
    }

    const supabaseUrl =
      process.env
        .NEXT_PUBLIC_SUPABASE_URL;

    const supabasePublishableKey =
      process.env
        .NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (
      !supabaseUrl ||
      !supabasePublishableKey
    ) {
      return NextResponse.json(
        {
          error:
            "Supabase environment variables are missing.",
        },

        {
          status: 500,
        }
      );
    }

    /*
      Use the logged-in admin JWT.

      RLS remains enforced.
    */

    const supabase =
      createClient(
        supabaseUrl,
        supabasePublishableKey,

        {
          global: {
            headers: {
              Authorization:
                authHeader,
            },
          },
        }
      );

    const {
      data: { user },
      error: userError,
    } =
      await supabase.auth.getUser();

    if (
      userError ||
      !user
    ) {
      return NextResponse.json(
        {
          error:
            "Authenticated admin session required.",
        },

        {
          status: 401,
        }
      );
    }

    if (
      user.app_metadata?.role !==
      "admin"
    ) {
      return NextResponse.json(
        {
          error:
            "SEKUR admin access required.",
        },

        {
          status: 403,
        }
      );
    }

    /*
      --------------------------------------------------------
      CURRENT LIVE SCORE
      --------------------------------------------------------
    */

    const {
      data: factor,
      error: factorError,
    } =
      await supabase
        .from(
          "country_intelligence_factors"
        )

        .select(
          "id, country_slug, factor_key, factor_label, score"
        )

        .eq(
          "country_slug",
          COUNTRY_SLUG
        )

        .eq(
          "factor_key",
          FACTOR_KEY
        )

        .single();

    if (
      factorError ||
      !factor
    ) {
      return NextResponse.json(
        {
          error:
            factorError?.message ??
            "Canada Safety factor not found.",
        },

        {
          status: 404,
        }
      );
    }

    /*
      --------------------------------------------------------
      DUPLICATE PROTECTION
      --------------------------------------------------------
    */

    const {
      data:
        existingSuggestion,

      error:
        existingError,
    } =
      await supabase
        .from(
          "intelligence_suggestions"
        )

        .select("id")

        .eq(
          "country_slug",
          COUNTRY_SLUG
        )

        .eq(
          "factor_key",
          FACTOR_KEY
        )

        .eq(
          "status",
          "pending"
        )

        .maybeSingle();

    if (
      existingError
    ) {
      return NextResponse.json(
        {
          error:
            existingError.message,
        },

        {
          status: 500,
        }
      );
    }

    if (
      existingSuggestion
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "A pending Canada Safety suggestion already exists. Review or reject it before running new research.",

          suggestion_id:
            existingSuggestion.id,
        },

        {
          status: 409,
        }
      );
    }

    /*
      --------------------------------------------------------
      RESEARCH
      --------------------------------------------------------
    */

    const evidenceData =
      await collectCanadaSafetyEvidence();

    /*
      Statistics Canada gives SAFE percentage.

      SEKUR methodology expects UNSAFE percentage.
    */

    const unsafeAtNight =
      100 -
      evidenceData.safeAtNightPercent;

    /*
      Supported components:

      Homicide          30%
      Perceived safety  20%
      Trend              5%

      Total coverage = 55%.
    */

    const safetyResult =
      calculateSafetyScore({
        homicideRate:
          evidenceData.homicideRate,

        previousHomicideRate:
          evidenceData.previousHomicideRate,

        unsafeAtNight,
      });

    if (
      safetyResult.score ===
      null
    ) {
      return NextResponse.json(
        {
          error:
            "Canada Safety evidence coverage is insufficient to generate a score.",

          coverage:
            safetyResult.coverage,

          confidence:
            safetyResult.confidence,

          explanation:
            safetyResult.explanation,
        },

        {
          status: 422,
        }
      );
    }

    const suggestedScore =
      safetyResult.score;

    /*
      --------------------------------------------------------
      EVIDENCE
      --------------------------------------------------------
    */

    const evidence = [
      "Official Canadian Safety evidence collected automatically by SEKUR:",
      "",

      `• Intentional homicide rate in ${evidenceData.homicideYear}: ${evidenceData.homicideRate} per 100,000 inhabitants.`,

      `• Intentional homicide rate in ${evidenceData.previousHomicideYear}: ${evidenceData.previousHomicideRate} per 100,000 inhabitants.`,

      `• Population reporting feeling very or reasonably safe walking alone after dark: ${evidenceData.safeAtNightPercent}%.`,

      `• Perceived-safety reference year: ${evidenceData.safeAtNightYear}.`,

      `• SEKUR unsafe-at-night equivalent: ${unsafeAtNight}%.`,

      "",

      "Source authority: Statistics Canada.",

      "",

      "Homicide data:",
      "Statistics Canada police-reported crime statistics / Homicide Survey.",

      "",

      "Perceived safety:",
      "Statistics Canada Canadian Housing Survey / neighbourhood safety indicator.",

      "",

      "SEKUR did not invent personal-crime or property-crime exposure values.",

      `Methodology evidence coverage: ${safetyResult.coverage.coveragePercent}%.`,

      `Confidence: ${safetyResult.confidence}.`,
    ].join("\n");

    /*
      --------------------------------------------------------
      REASONING
      --------------------------------------------------------
    */

    const reasoning = [
      `${SAFETY_METHODOLOGY_VERSION}`,

      "",

      `Current live Canada Safety Score: ${factor.score}/100.`,

      `Calculated Canada Safety Score: ${suggestedScore}/100.`,

      "",

      `Evidence coverage: ${safetyResult.coverage.coveragePercent}%.`,

      `Confidence: ${safetyResult.confidence}.`,

      "",

      "Available components:",

      ...safetyResult.coverage.availableComponents.map(
        (component) =>
          `• ${component}`
      ),

      "",

      "Missing components:",

      ...safetyResult.coverage.missingComponents.map(
        (component) =>
          `• ${component}`
      ),

      "",

      "Component calculation:",

      ...safetyResult.explanation.map(
        (line) =>
          `• ${line}`
      ),

      "",

      "Missing indicator weights were redistributed proportionally.",

      "No missing values were estimated.",

      "",

      "Human approval is required before Canada's live Safety score changes.",
    ].join("\n");

    /*
      --------------------------------------------------------
      CREATE REVIEW SUGGESTION
      --------------------------------------------------------
    */

    const {
      data: suggestion,

      error:
        insertError,
    } =
      await supabase
        .from(
          "intelligence_suggestions"
        )

        .insert({
          country_slug:
            COUNTRY_SLUG,

          factor_key:
            FACTOR_KEY,

          current_score:
            factor.score,

          suggested_score:
            suggestedScore,

          source_type:
            "official",

          source_name:
            "Statistics Canada",

          source_url:
            CRIME_STATS_URL,

          evidence,

          reasoning,

          status:
            "pending",

          created_by:
            user.id,
        })

        .select()

        .single();

    if (
      insertError
    ) {
      return NextResponse.json(
        {
          error:
            insertError.message,
        },

        {
          status: 500,
        }
      );
    }

    /*
      --------------------------------------------------------
      SUCCESS
      --------------------------------------------------------
    */

    return NextResponse.json(
      {
        success: true,

        message:
          `Canada Safety research completed. SEKUR calculated ${suggestedScore}/100 with ${safetyResult.coverage.coveragePercent}% evidence coverage.`,

        methodology:
          SAFETY_METHODOLOGY_VERSION,

        current_score:
          factor.score,

        suggested_score:
          suggestedScore,

        coverage:
          safetyResult.coverage,

        confidence:
          safetyResult.confidence,

        component_scores:
          safetyResult.components,

        evidence:
          evidenceData,

        suggestion,
      },

      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "SEKUR Canada Safety research runner failed:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unknown Canada Safety research runner error.",
      },

      {
        status: 500,
      }
    );
  }
}