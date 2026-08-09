import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

import {
  calculateSafetyScore,
  SAFETY_METHODOLOGY_VERSION,
  SafetyMetrics,
} from "@/lib/intelligence/safetyMethodology";

import {
  storeResearchRun,
} from "@/lib/intelligence/storeResearchRun";

/*
  =========================================================
  SEKUR SAFETY RUNNER FACTORY — V2
  =========================================================

  NEW IN V2

  If a country does not yet have a Safety factor row,
  the runner creates a temporary baseline automatically.

  This removes the need to manually open Supabase and insert
  a Safety row every time we add a new registry country.

  Important:

  The baseline is NOT treated as researched truth.

  It exists only so SEKUR has a current value to compare
  against while the research workflow is being established.
*/

export type SafetyResearchEvidence = {
  metrics: SafetyMetrics;

  sourceName: string;
  sourceUrl: string;

  evidenceData: Record<
    string,
    unknown
  >;

  evidenceText: string[];

  additionalReasoning?: string[];
};

export type SafetyRunnerConfig = {
  countrySlug: string;

  countryName: string;

  factorKey?: string;

  /*
    Temporary baseline used only if the country
    has no Safety factor row yet.
  */
  initialBaselineScore?: number;

  /*
    Country-specific evidence collector.
  */
  collectEvidence:
    () =>
      Promise<SafetyResearchEvidence>;
};

/*
  =========================================================
  FACTORY
  =========================================================
*/

export function createSafetyRunner(
  config: SafetyRunnerConfig
) {
  const factorKey =
    config.factorKey ??
    "safety";

  const initialBaselineScore =
    config.initialBaselineScore ??
    75;

  return async function POST(
    request: Request
  ) {
    try {
      /*
        =====================================================
        AUTHORIZATION
        =====================================================
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

      const supabaseKey =
        process.env
          .NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

      if (
        !supabaseUrl ||
        !supabaseKey
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

      const supabase =
        createClient(
          supabaseUrl,
          supabaseKey,
          {
            global: {
              headers: {
                Authorization:
                  authHeader,
              },
            },
          }
        );

      /*
        =====================================================
        ADMIN VERIFICATION
        =====================================================
      */

      const {
        data: {
          user,
        },
        error:
          userError,
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
        =====================================================
        GET OR CREATE SAFETY FACTOR
        =====================================================

        We use maybeSingle() instead of single().

        If the country doesn't exist yet in the
        intelligence factor table, we create a baseline.
      */

      const {
        data:
          existingFactor,
        error:
          factorLookupError,
      } =
        await supabase
          .from(
            "country_intelligence_factors"
          )
          .select(
            "id, country_slug, factor_key, factor_label, score, weight, source_type, source_name"
          )
          .eq(
            "country_slug",
            config.countrySlug
          )
          .eq(
            "factor_key",
            factorKey
          )
          .maybeSingle();

      if (
        factorLookupError
      ) {
        throw new Error(
          factorLookupError.message
        );
      }

      let factor =
        existingFactor;

      /*
        =====================================================
        AUTO-SEED BASELINE
        =====================================================
      */

      if (!factor) {
        const {
          data:
            insertedFactor,
          error:
            insertFactorError,
        } =
          await supabase
            .from(
              "country_intelligence_factors"
            )
            .insert({
              country_slug:
                config.countrySlug,

              factor_key:
                factorKey,

              factor_label:
                "Safety",

              score:
                initialBaselineScore,

              weight:
                15,

              source_type:
                "estimated",

              source_name:
                "SEKUR temporary baseline",
            })
            .select(
              "id, country_slug, factor_key, factor_label, score, weight, source_type, source_name"
            )
            .single();

        if (
          insertFactorError ||
          !insertedFactor
        ) {
          throw new Error(
            insertFactorError?.message ??
              `Could not create ${config.countryName} Safety baseline.`
          );
        }

        factor =
          insertedFactor;
      }

      /*
        =====================================================
        DUPLICATE PENDING PROTECTION
        =====================================================
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
          .select(
            "id"
          )
          .eq(
            "country_slug",
            config.countrySlug
          )
          .eq(
            "factor_key",
            factorKey
          )
          .eq(
            "status",
            "pending"
          )
          .maybeSingle();

      if (
        existingError
      ) {
        throw new Error(
          existingError.message
        );
      }

      if (
        existingSuggestion
      ) {
        return NextResponse.json(
          {
            success:
              false,

            message:
              `A pending ${config.countryName} Safety suggestion already exists. Review or reject it before running new research.`,
          },
          {
            status: 409,
          }
        );
      }

      /*
        =====================================================
        COUNTRY RESEARCH
        =====================================================
      */

      const research =
        await config.collectEvidence();

      /*
        =====================================================
        CALCULATE SAFETY
        =====================================================
      */

      const safetyResult =
        calculateSafetyScore(
          research.metrics
        );

      const publishable =
        safetyResult.score !==
        null;

      const status =
        publishable
          ? "completed"
          : "insufficient";

      /*
        =====================================================
        STORE RESEARCH HISTORY
        =====================================================
      */

      const researchRun =
        await storeResearchRun({
          supabase,

          countrySlug:
            config.countrySlug,

          factorKey,

          methodologyVersion:
            SAFETY_METHODOLOGY_VERSION,

          currentScore:
            factor.score,

          suggestedScore:
            safetyResult.score,

          coveragePercent:
            safetyResult
              .coverage
              .coveragePercent,

          confidence:
            safetyResult
              .confidence,

          publishable,

          status,

          sourceName:
            research.sourceName,

          sourceUrl:
            research.sourceUrl,

          evidence:
            research.evidenceData,

          componentScores:
            safetyResult
              .components,

          availableComponents:
            safetyResult
              .coverage
              .availableComponents,

          missingComponents:
            safetyResult
              .coverage
              .missingComponents,

          message:
            publishable
              ? `${config.countryName} Safety research completed. SEKUR calculated ${safetyResult.score}/100.`
              : `${config.countryName} Safety research completed with ${safetyResult.coverage.coveragePercent}% evidence coverage. No publishable score was created.`,

          errorMessage:
            null,

          createdBy:
            user.id,
        });

      /*
        =====================================================
        INSUFFICIENT EVIDENCE
        =====================================================
      */

      if (
        safetyResult.score ===
        null
      ) {
        return NextResponse.json(
          {
            success:
              true,

            publishable:
              false,

            message:
              `${config.countryName} Safety research completed. SEKUR found ${safetyResult.coverage.coveragePercent}% comparable evidence coverage, so no score suggestion was created.`,

            baseline_created:
              !existingFactor,

            research_run_id:
              researchRun.id,

            methodology:
              SAFETY_METHODOLOGY_VERSION,

            current_score:
              factor.score,

            suggested_score:
              null,

            coverage:
              safetyResult.coverage,

            confidence:
              safetyResult.confidence,

            component_scores:
              safetyResult.components,

            evidence:
              research.evidenceData,
          },
          {
            status: 200,
          }
        );
      }

      /*
        =====================================================
        HUMAN REVIEW TEXT
        =====================================================
      */

      const evidence =
        [
          `${config.countryName} Safety evidence collected automatically by SEKUR:`,

          "",

          ...research.evidenceText,

          "",

          `Evidence coverage: ${safetyResult.coverage.coveragePercent}%.`,

          `Confidence: ${safetyResult.confidence}.`,
        ].join(
          "\n"
        );

      const reasoning =
        [
          SAFETY_METHODOLOGY_VERSION,

          "",

          `Current live ${config.countryName} Safety Score: ${factor.score}/100.`,

          `Calculated ${config.countryName} Safety Score: ${safetyResult.score}/100.`,

          "",

          !existingFactor
            ? `SEKUR automatically created a temporary baseline of ${factor.score}/100 because this country did not previously have a Safety factor.`
            : "",

          !existingFactor
            ? "The temporary baseline is not itself research evidence."
            : "",

          !existingFactor
            ? ""
            : "",

          "Component calculation:",

          ...safetyResult
            .explanation
            .map(
              (
                line
              ) =>
                `• ${line}`
            ),

          ...(research.additionalReasoning ??
            []).length >
          0
            ? [
                "",

                ...(research.additionalReasoning ??
                  []),
              ]
            : [],

          "",

          `Research run ID: ${researchRun.id}.`,

          "",

          `Human approval is required before ${config.countryName}'s live Safety score changes.`,
        ]
          .filter(
            (
              line
            ) =>
              line !==
              undefined
          )
          .join(
            "\n"
          );

      /*
        =====================================================
        CREATE HUMAN-REVIEW SUGGESTION
        =====================================================
      */

      const {
        data:
          suggestion,
        error:
          suggestionError,
      } =
        await supabase
          .from(
            "intelligence_suggestions"
          )
          .insert({
            country_slug:
              config.countrySlug,

            factor_key:
              factorKey,

            current_score:
              factor.score,

            suggested_score:
              safetyResult.score,

            source_type:
              "official",

            source_name:
              research.sourceName,

            source_url:
              research.sourceUrl,

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
        suggestionError
      ) {
        throw new Error(
          suggestionError.message
        );
      }

      /*
        =====================================================
        SUCCESS
        =====================================================
      */

      return NextResponse.json(
        {
          success:
            true,

          publishable:
            true,

          baseline_created:
            !existingFactor,

          message:
            `${config.countryName} Safety research completed. SEKUR calculated ${safetyResult.score}/100 with ${safetyResult.coverage.coveragePercent}% evidence coverage.`,

          research_run_id:
            researchRun.id,

          methodology:
            SAFETY_METHODOLOGY_VERSION,

          current_score:
            factor.score,

          suggested_score:
            safetyResult.score,

          coverage:
            safetyResult.coverage,

          confidence:
            safetyResult.confidence,

          component_scores:
            safetyResult.components,

          evidence:
            research.evidenceData,

          suggestion,
        },
        {
          status: 201,
        }
      );
    } catch (
      error
    ) {
      console.error(
        `SEKUR ${config.countryName} Safety runner failed:`,
        error
      );

      return NextResponse.json(
        {
          error:
            error instanceof Error
              ? error.message
              : `Unknown ${config.countryName} Safety research error.`,
        },
        {
          status: 500,
        }
      );
    }
  };
}