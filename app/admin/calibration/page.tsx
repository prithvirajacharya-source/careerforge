"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import SiteHeader from "@/components/SiteHeader";
import { supabase } from "@/lib/supabase";

import {
  SAFETY_COUNTRY_REGISTRY,
} from "@/lib/intelligence/safetyCountryRegistry";

type ResearchRun = {
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

  created_at: string;
};

export default function SafetyCalibrationPage() {
  const [
    researchRuns,
    setResearchRuns,
  ] = useState<
    ResearchRun[]
  >([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  /*
    ========================================================
    LOAD RESEARCH HISTORY
    ========================================================
  */

  async function loadResearchRuns() {
    setLoading(true);
    setErrorMessage("");

    try {
      const {
        data: { user },
        error: userError,
      } =
        await supabase.auth.getUser();

      if (
        userError ||
        !user
      ) {
        throw new Error(
          "Admin session not found. Please sign in again."
        );
      }

      if (
        user.app_metadata?.role !==
        "admin"
      ) {
        throw new Error(
          "SEKUR admin access required."
        );
      }

      const {
        data,
        error,
      } =
        await supabase
          .from(
            "intelligence_research_runs"
          )
          .select("*")
          .eq(
            "factor_key",
            "safety"
          )
          .order(
            "created_at",
            {
              ascending:
                false,
            }
          );

      if (error) {
        throw error;
      }

      setResearchRuns(
        (data ??
          []) as ResearchRun[]
      );
    } catch (error) {
      console.error(
        "Could not load Safety calibration:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Could not load Safety calibration."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => void loadResearchRuns(), 0);
    return () => window.clearTimeout(timer);
  }, []);

  /*
    ========================================================
    LATEST RUN PER COUNTRY
    ========================================================
  */

  const latestRuns =
    useMemo(() => {
      const result =
        new Map<
          string,
          ResearchRun
        >();

      for (
        const run of
        researchRuns
      ) {
        if (
          !result.has(
            run.country_slug
          )
        ) {
          result.set(
            run.country_slug,
            run
          );
        }
      }

      return result;
    }, [researchRuns]);

  /*
    ========================================================
    SUMMARY
    ========================================================
  */

  const summary =
    useMemo(() => {
      let publishable = 0;
      let insufficient = 0;
      let noResearch = 0;
      let paused = 0;

      for (
        const country of
        SAFETY_COUNTRY_REGISTRY
      ) {
        if (
          !country.enabled
        ) {
          paused++;
        }

        const run =
          latestRuns.get(
            country.slug
          );

        if (!run) {
          noResearch++;
          continue;
        }

        if (
          run.publishable
        ) {
          publishable++;
        } else {
          insufficient++;
        }
      }

      return {
        publishable,
        insufficient,
        noResearch,
        paused,
      };
    }, [latestRuns]);

  return (
    <main className="min-h-screen bg-[#07101f] text-white">
      <SiteHeader />

      <section className="mx-auto max-w-7xl px-6 py-16">
        {/* HEADER */}

        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-emerald-400">
              SEKUR Intelligence Lab
            </p>

            <h1 className="mt-4 text-5xl font-black tracking-tight">
              Safety

              <span className="block bg-gradient-to-r from-blue-400 to-emerald-300 bg-clip-text text-transparent">
                calibration.
              </span>
            </h1>

            <p className="mt-5 max-w-3xl leading-7 text-slate-400">
              Compare the latest automated
              Safety research across every
              country in the SEKUR Safety
              registry.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={
                loadResearchRuns
              }
              disabled={
                loading
              }
              className="rounded-xl border border-white/10 bg-white/[0.035] px-5 py-3 text-sm font-bold text-slate-300 transition hover:text-white disabled:opacity-50"
            >
              {loading
                ? "Refreshing..."
                : "Refresh Data"}
            </button>

            <Link
              href="/admin/suggestions"
              className="rounded-xl border border-white/10 bg-white/[0.035] px-5 py-3 text-sm font-bold text-slate-300 transition hover:border-white/20 hover:text-white"
            >
              ← Research Suggestions
            </Link>
          </div>
        </div>

        {/* SUMMARY */}

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <SummaryCard
            label="Countries"
            value={
              SAFETY_COUNTRY_REGISTRY.length
            }
          />

          <SummaryCard
            label="Publishable"
            value={
              summary.publishable
            }
            tone="green"
          />

          <SummaryCard
            label="Insufficient"
            value={
              summary.insufficient
            }
            tone="amber"
          />

          <SummaryCard
            label="No research"
            value={
              summary.noResearch
            }
          />

          <SummaryCard
            label="Paused"
            value={
              summary.paused
            }
            tone="amber"
          />
        </div>

        {/* ERROR */}

        {errorMessage && (
          <div className="mt-8 rounded-xl border border-red-400/20 bg-red-400/10 px-5 py-4 text-red-300">
            {errorMessage}
          </div>
        )}

        {/* CONTENT */}

        {loading ? (
          <div className="mt-10 flex min-h-[360px] items-center justify-center rounded-3xl border border-white/10 bg-white/[0.025]">
            <div className="text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-emerald-400" />

              <p className="mt-5 text-sm font-semibold text-slate-400">
                Loading Safety research
                history...
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 xl:grid-cols-2">
            {SAFETY_COUNTRY_REGISTRY.map(
              (country) => {
                const run =
                  latestRuns.get(
                    country.slug
                  );

                return (
                  <CountryCalibrationCard
                    key={
                      country.slug
                    }
                    country={
                      country
                    }
                    run={
                      run ?? null
                    }
                  />
                );
              }
            )}
          </div>
        )}

        {/* HISTORY */}

        {!loading &&
          researchRuns.length >
            0 && (
            <div className="mt-14 border-t border-white/10 pt-12">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-300">
                Research History
              </p>

              <h2 className="mt-2 text-3xl font-black">
                Recent Safety runs
              </h2>

              <p className="mt-3 text-slate-500">
                Every stored research run
                remains available for
                calibration and auditing.
              </p>

              <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px] text-left">
                    <thead className="bg-white/[0.04] text-xs uppercase tracking-[0.13em] text-slate-500">
                      <tr>
                        <th className="px-5 py-4">
                          Country
                        </th>

                        <th className="px-5 py-4">
                          Live
                        </th>

                        <th className="px-5 py-4">
                          Research
                        </th>

                        <th className="px-5 py-4">
                          Coverage
                        </th>

                        <th className="px-5 py-4">
                          Confidence
                        </th>

                        <th className="px-5 py-4">
                          Result
                        </th>

                        <th className="px-5 py-4">
                          Run
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {researchRuns
                        .slice(
                          0,
                          20
                        )
                        .map(
                          (run) => (
                            <tr
                              key={
                                run.id
                              }
                              className="border-t border-white/10 text-sm"
                            >
                              <td className="px-5 py-4 font-bold capitalize">
                                {
                                  run.country_slug
                                }
                              </td>

                              <td className="px-5 py-4">
                                {run.current_score ??
                                  "—"}
                              </td>

                              <td className="px-5 py-4 font-black">
                                {run.suggested_score ??
                                  "—"}
                              </td>

                              <td className="px-5 py-4">
                                {run.coverage_percent ??
                                  0}
                                %
                              </td>

                              <td className="px-5 py-4">
                                {formatConfidence(
                                  run.confidence
                                )}
                              </td>

                              <td className="px-5 py-4">
                                <RunStatus
                                  run={
                                    run
                                  }
                                />
                              </td>

                              <td className="px-5 py-4 text-slate-500">
                                {formatDate(
                                  run.created_at
                                )}
                              </td>
                            </tr>
                          )
                        )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        {/* RULE */}

        <div className="mt-12 rounded-3xl border border-blue-400/15 bg-blue-400/[0.05] p-8">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-300">
            SEKUR Calibration Rule
          </p>

          <h2 className="mt-3 text-2xl font-black">
            Evidence before scores.
          </h2>

          <p className="mt-4 max-w-4xl leading-7 text-slate-400">
            Every registry country appears
            here automatically. A country
            can have valid research history
            without having enough evidence
            to generate a publishable score.
          </p>
        </div>
      </section>
    </main>
  );
}

/*
  =========================================================
  COUNTRY CARD
  =========================================================
*/

function CountryCalibrationCard({
  country,
  run,
}: {
  country: (typeof SAFETY_COUNTRY_REGISTRY)[number];

  run:
    | ResearchRun
    | null;
}) {
  if (!run) {
    return (
      <article className="rounded-3xl border border-white/10 bg-white/[0.025] p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm font-black tracking-[0.18em] text-blue-300">
              {
                country.code
              }
            </div>

            <h2 className="mt-3 text-3xl font-black">
              {
                country.name
              }
            </h2>
          </div>

          <span
            className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] ${
              country.enabled
                ? "border-slate-400/20 bg-white/5 text-slate-400"
                : "border-amber-400/20 bg-amber-400/10 text-amber-300"
            }`}
          >
            {country.enabled
              ? "No research"
              : "Paused"}
          </span>
        </div>

        <div className="mt-8 rounded-2xl border border-dashed border-white/10 p-8 text-center">
          <div className="text-3xl">
            —
          </div>

          <p className="mt-3 font-bold">
            No stored Safety research
            run
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {country.enabled
              ? "Run this country's research pipeline before calibrating its Safety score."
              : country.disabledReason ??
                "This runner is currently paused."}
          </p>
        </div>
      </article>
    );
  }

  const delta =
    run.suggested_score !==
      null &&
    run.current_score !==
      null
      ? run.suggested_score -
        run.current_score
      : null;

  const available =
    run.available_components ??
    [];

  const missing =
    run.missing_components ??
    [];

  return (
    <article className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025]">
      {/* HEADER */}

      <div className="flex flex-col justify-between gap-6 border-b border-white/10 p-7 sm:flex-row sm:items-start">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-black tracking-[0.18em] text-emerald-300">
              {
                country.code
              }
            </span>

            <ResultBadge
              run={run}
            />
          </div>

          <h2 className="mt-3 text-3xl font-black">
            {
              country.name
            }
          </h2>

          <div className="mt-2 text-xs text-slate-500">
            {
              run.methodology_version
            }
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ScoreBox
            label="Live"
            value={
              run.current_score
            }
          />

          <span className="text-slate-600">
            →
          </span>

          <ScoreBox
            label="Research"
            value={
              run.suggested_score
            }
          />

          {delta !==
            null && (
            <div
              className={`rounded-full px-3 py-1 text-xs font-black ${
                delta > 0
                  ? "bg-emerald-400/10 text-emerald-300"
                  : delta < 0
                  ? "bg-red-400/10 text-red-300"
                  : "bg-white/5 text-slate-400"
              }`}
            >
              {delta >
              0
                ? "+"
                : ""}

              {delta}
            </div>
          )}
        </div>
      </div>

      {/* METRICS */}

      <div className="grid md:grid-cols-3">
        <MetricBox
          label="Coverage"
          value={`${
            run.coverage_percent ??
            0
          }%`}
        />

        <MetricBox
          label="Confidence"
          value={formatConfidence(
            run.confidence
          )}
        />

        <MetricBox
          label="Publishable"
          value={
            run.publishable
              ? "Yes"
              : "No"
          }
        />
      </div>

      {/* COVERAGE */}

      <div className="border-t border-white/10 p-7">
        <div className="flex justify-between text-xs font-bold uppercase tracking-[0.13em] text-slate-500">
          <span>
            Evidence coverage
          </span>

          <span>
            {run.coverage_percent ??
              0}
            %
          </span>
        </div>

        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-400"
            style={{
              width: `${
                run.coverage_percent ??
                0
              }%`,
            }}
          />
        </div>
      </div>

      {/* COMPONENTS */}

      <div className="grid border-t border-white/10 md:grid-cols-2">
        <div className="border-b border-white/10 p-7 md:border-b-0 md:border-r">
          <p className="text-xs font-black uppercase tracking-[0.15em] text-emerald-400">
            Available
          </p>

          {available.length >
          0 ? (
            <div className="mt-4 space-y-3">
              {available.map(
                (
                  component
                ) => (
                  <div
                    key={
                      component
                    }
                    className="flex gap-3 text-sm text-slate-300"
                  >
                    <span className="text-emerald-400">
                      ✓
                    </span>

                    {formatComponent(
                      component
                    )}
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="mt-4 text-sm text-slate-500">
              No supported components.
            </div>
          )}
        </div>

        <div className="p-7">
          <p className="text-xs font-black uppercase tracking-[0.15em] text-red-300">
            Missing
          </p>

          {missing.length >
          0 ? (
            <div className="mt-4 space-y-3">
              {missing.map(
                (
                  component
                ) => (
                  <div
                    key={
                      component
                    }
                    className="flex gap-3 text-sm text-slate-400"
                  >
                    <span className="text-red-300">
                      —
                    </span>

                    {formatComponent(
                      component
                    )}
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="mt-4 text-sm font-bold text-emerald-300">
              ✓ Complete methodology
              coverage
            </div>
          )}
        </div>
      </div>

      {/* SOURCE */}

      <div className="border-t border-white/10 p-7">
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <div className="text-xs uppercase tracking-[0.13em] text-slate-500">
              Source
            </div>

            <div className="mt-2 text-sm font-bold">
              {run.source_name ??
                "—"}
            </div>
          </div>

          <div>
            <div className="text-xs uppercase tracking-[0.13em] text-slate-500">
              Latest research
            </div>

            <div className="mt-2 text-sm font-bold">
              {formatDate(
                run.created_at
              )}
            </div>
          </div>
        </div>

        {run.message && (
          <div className="mt-5 rounded-xl border border-white/10 bg-black/10 px-4 py-3 text-sm leading-6 text-slate-400">
            {
              run.message
            }
          </div>
        )}
      </div>
    </article>
  );
}

/*
  =========================================================
  SMALL COMPONENTS
  =========================================================
*/

function SummaryCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;

  tone?:
    | "green"
    | "amber";
}) {
  const valueClass =
    tone === "green"
      ? "text-emerald-300"
      : tone === "amber"
      ? "text-amber-300"
      : "text-white";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
      <div className="text-xs uppercase tracking-[0.15em] text-slate-500">
        {label}
      </div>

      <div
        className={`mt-2 text-3xl font-black ${valueClass}`}
      >
        {value}
      </div>
    </div>
  );
}

function ScoreBox({
  label,
  value,
}: {
  label: string;
  value:
    | number
    | null;
}) {
  return (
    <div className="min-w-[76px] rounded-xl border border-white/10 bg-black/10 px-4 py-3 text-center">
      <div className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-500">
        {label}
      </div>

      <div className="mt-1 text-2xl font-black">
        {value ??
          "—"}
      </div>
    </div>
  );
}

function MetricBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="border-b border-white/10 p-6 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0">
      <div className="text-xs uppercase tracking-[0.13em] text-slate-500">
        {label}
      </div>

      <div className="mt-2 text-xl font-black">
        {value}
      </div>
    </div>
  );
}

function ResultBadge({
  run,
}: {
  run: ResearchRun;
}) {
  if (
    run.publishable
  ) {
    return (
      <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-emerald-300">
        Publishable
      </span>
    );
  }

  return (
    <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-amber-300">
      Insufficient
    </span>
  );
}

function RunStatus({
  run,
}: {
  run: ResearchRun;
}) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-bold ${
        run.publishable
          ? "bg-emerald-400/10 text-emerald-300"
          : "bg-amber-400/10 text-amber-300"
      }`}
    >
      {run.publishable
        ? "Publishable"
        : "Insufficient"}
    </span>
  );
}

/*
  =========================================================
  FORMATTERS
  =========================================================
*/

function formatConfidence(
  value:
    | string
    | null
) {
  if (!value) {
    return "—";
  }

  return value
    .replace(
      "-",
      " "
    )
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase()
    );
}

function formatComponent(
  value: string
) {
  const labels: Record<
    string,
    string
  > = {
    homicide:
      "Homicide",

    personalCrime:
      "Personal crime",

    propertyCrime:
      "Property crime",

    perceivedSafety:
      "Perceived safety",

    trend:
      "Homicide trend",
  };

  return (
    labels[value] ??
    value
  );
}

function formatDate(
  value: string
) {
  try {
    return new Intl.DateTimeFormat(
      "en-SE",
      {
        dateStyle:
          "medium",

        timeStyle:
          "short",
      }
    ).format(
      new Date(
        value
      )
    );
  } catch {
    return value;
  }
}
