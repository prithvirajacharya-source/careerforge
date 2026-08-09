type ResearchRunStatus =
  | "completed"
  | "insufficient"
  | "failed";

type ResearchRunConfidence =
  | "very-high"
  | "high"
  | "medium"
  | "low"
  | "insufficient";

type SupabaseClientLike = {
  from: (table: string) => any;
};

export type StoreResearchRunInput = {
  supabase: SupabaseClientLike;

  countrySlug: string;
  factorKey: string;

  methodologyVersion: string;

  currentScore:
    | number
    | null;

  suggestedScore:
    | number
    | null;

  coveragePercent:
    | number
    | null;

  confidence:
    | ResearchRunConfidence
    | null;

  publishable: boolean;

  status: ResearchRunStatus;

  sourceName:
    | string
    | null;

  sourceUrl:
    | string
    | null;

  evidence:
    | Record<
        string,
        unknown
      >
    | null;

  componentScores:
    | Record<
        string,
        number
      >
    | null;

  availableComponents:
    | string[]
    | null;

  missingComponents:
    | string[]
    | null;

  message:
    | string
    | null;

  errorMessage?:
    | string
    | null;

  createdBy:
    | string
    | null;
};

export type StoredResearchRun = {
  id: number;

  country_slug: string;
  factor_key: string;

  methodology_version:
    | string
    | null;

  current_score:
    | number
    | null;

  suggested_score:
    | number
    | null;

  coverage_percent:
    | number
    | null;

  confidence:
    | string
    | null;

  publishable: boolean;

  status: string;

  source_name:
    | string
    | null;

  source_url:
    | string
    | null;

  evidence:
    | Record<
        string,
        unknown
      >
    | null;

  component_scores:
    | Record<
        string,
        number
      >
    | null;

  available_components:
    | string[]
    | null;

  missing_components:
    | string[]
    | null;

  message:
    | string
    | null;

  error_message:
    | string
    | null;

  created_by:
    | string
    | null;

  created_at: string;
};

/*
  =========================================================
  STORE RESEARCH RUN
  =========================================================

  Every research runner should call this helper.

  Why?

  Previously each country contained its own:

      supabase
        .from("intelligence_research_runs")
        .insert(...)

  That creates duplicated code and makes adding
  20+ countries painful.

  Now all country runners use one standard function.

  This also makes the Calibration Dashboard consistent.
*/

export async function storeResearchRun(
  input: StoreResearchRunInput
): Promise<StoredResearchRun> {
  validateInput(
    input
  );

  const {
    data,
    error,
  } =
    await input.supabase
      .from(
        "intelligence_research_runs"
      )
      .insert({
        country_slug:
          input.countrySlug,

        factor_key:
          input.factorKey,

        methodology_version:
          input.methodologyVersion,

        current_score:
          input.currentScore,

        suggested_score:
          input.suggestedScore,

        coverage_percent:
          input.coveragePercent,

        confidence:
          input.confidence,

        publishable:
          input.publishable,

        status:
          input.status,

        source_name:
          input.sourceName,

        source_url:
          input.sourceUrl,

        evidence:
          input.evidence,

        component_scores:
          input.componentScores,

        available_components:
          input.availableComponents,

        missing_components:
          input.missingComponents,

        message:
          input.message,

        error_message:
          input.errorMessage ??
          null,

        created_by:
          input.createdBy,
      })
      .select()
      .single();

  if (error) {
    throw new Error(
      `Could not store research run: ${error.message}`
    );
  }

  if (!data) {
    throw new Error(
      "Research run was inserted but no row was returned."
    );
  }

  return data as StoredResearchRun;
}

/*
  =========================================================
  VALIDATION
  =========================================================

  Research history is part of SEKUR's audit trail.

  Bad data should fail before entering the table.
*/

function validateInput(
  input: StoreResearchRunInput
) {
  if (
    !input.countrySlug.trim()
  ) {
    throw new Error(
      "Research run country slug is required."
    );
  }

  if (
    !input.factorKey.trim()
  ) {
    throw new Error(
      "Research run factor key is required."
    );
  }

  if (
    !input.methodologyVersion.trim()
  ) {
    throw new Error(
      "Research methodology version is required."
    );
  }

  validateScore(
    input.currentScore,
    "current score"
  );

  validateScore(
    input.suggestedScore,
    "suggested score"
  );

  if (
    input.coveragePercent !==
      null &&
    (
      !Number.isFinite(
        input.coveragePercent
      ) ||
      input.coveragePercent <
        0 ||
      input.coveragePercent >
        100
    )
  ) {
    throw new Error(
      "Research coverage must be between 0 and 100."
    );
  }

  /*
    A publishable result must have
    a suggested score.
  */

  if (
    input.publishable &&
    input.suggestedScore ===
      null
  ) {
    throw new Error(
      "Publishable research must include a suggested score."
    );
  }

  /*
    An insufficient run cannot be
    marked publishable.
  */

  if (
    input.status ===
      "insufficient" &&
    input.publishable
  ) {
    throw new Error(
      "Insufficient research cannot be publishable."
    );
  }

  /*
    A failed run should never be
    publishable.
  */

  if (
    input.status ===
      "failed" &&
    input.publishable
  ) {
    throw new Error(
      "Failed research cannot be publishable."
    );
  }
}

function validateScore(
  value:
    | number
    | null,
  label: string
) {
  if (
    value === null
  ) {
    return;
  }

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