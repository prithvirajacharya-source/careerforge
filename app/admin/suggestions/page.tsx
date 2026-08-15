"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import SiteHeader from "@/components/SiteHeader";

import ResearchSuggestions, {
  IntelligenceSuggestion,
} from "@/components/admin/ResearchSuggestions";

import { supabase } from "@/lib/supabase";

import {
  SAFETY_COUNTRY_REGISTRY,
  SafetyCountryRegistryEntry,
} from "@/lib/intelligence/safetyCountryRegistry";

type RunnerState = {
  status:
    | "idle"
    | "running"
    | "success"
    | "error";

  message: string;
};

type RunnerStateMap =
  Record<
    string,
    RunnerState
  >;

/*
  =========================================================
  BUILD INITIAL RUNNER STATE FROM REGISTRY
  =========================================================

  This means adding a country to
  safetyCountryRegistry.ts automatically
  gives it UI state here.
*/

function createInitialRunnerStates(): RunnerStateMap {
  return Object.fromEntries(
    SAFETY_COUNTRY_REGISTRY.map(
      (country) => [
        country.slug,

        {
          status: "idle",
          message: "",
        },
      ]
    )
  );
}

export default function ResearchSuggestionsPage() {
  const [
    suggestions,
    setSuggestions,
  ] = useState<
    IntelligenceSuggestion[]
  >([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    runnerStates,
    setRunnerStates,
  ] = useState<RunnerStateMap>(
    createInitialRunnerStates
  );

  /*
    ========================================================
    LOAD REVIEW QUEUE
    ========================================================
  */

  async function loadSuggestions() {
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
          "This account does not have SEKUR admin access."
        );
      }

      const {
        data,
        error,
      } =
        await supabase
          .from(
            "intelligence_suggestions"
          )
          .select("*")
          .eq(
            "status",
            "pending"
          )
          .order(
            "created_at",
            {
              ascending: false,
            }
          );

      if (error) {
        throw error;
      }

      setSuggestions(
        (data ??
          []) as IntelligenceSuggestion[]
      );
    } catch (error) {
      console.error(
        "Could not load research suggestions:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Could not load research suggestions."
      );
    } finally {
      setLoading(false);
    }
  }

  /*
    ========================================================
    RUN ONE COUNTRY
    ========================================================
  */

  async function runResearch(
    country: SafetyCountryRegistryEntry
  ) {
    if (
      !country.enabled
    ) {
      return;
    }

    setRunnerStates(
      (previous) => ({
        ...previous,

        [country.slug]: {
          status:
            "running",

          message:
            "",
        },
      })
    );

    try {
      const {
        data: { session },
        error: sessionError,
      } =
        await supabase.auth.getSession();

      if (
        sessionError ||
        !session
      ) {
        throw new Error(
          "Admin session not found. Please sign in again."
        );
      }

      const response =
        await fetch(
          country.endpoint,
          {
            method: "POST",

            headers: {
              Authorization:
                `Bearer ${session.access_token}`,
            },
          }
        );

      /*
        Read as text first.

        This prevents the UI from crashing
        if an API route unexpectedly returns
        an empty body.
      */

      const rawText =
        await response.text();

      let result: {
        message?: string;
        error?: string;
      } = {};

      if (
        rawText.trim()
      ) {
        try {
          result = JSON.parse(rawText) as {
            message?: string;
            error?: string;
          };
        } catch {
          throw new Error(
            `${country.name} research returned an invalid response.`
          );
        }
      }

      if (
        !response.ok
      ) {
        throw new Error(
          result?.message ??
            result?.error ??
            `${country.name} research runner failed.`
        );
      }

      setRunnerStates(
        (previous) => ({
          ...previous,

          [country.slug]: {
            status:
              "success",

            message:
              result?.message ??
              `${country.name} research completed.`,
          },
        })
      );

      /*
        Reload pending review queue.

        Publishable research may have created
        a suggestion.

        Insufficient research may not.
      */

      await loadSuggestions();
    } catch (error) {
      console.error(
        `${country.name} research runner failed:`,
        error
      );

      setRunnerStates(
        (previous) => ({
          ...previous,

          [country.slug]: {
            status:
              "error",

            message:
              error instanceof Error
                ? error.message
                : `${country.name} research runner failed.`,
          },
        })
      );
    }
  }

  /*
    ========================================================
    RUN ALL ENABLED COUNTRIES
    ========================================================
  */

  async function runAllSafetyResearch() {
    const enabledCountries =
      SAFETY_COUNTRY_REGISTRY.filter(
        (country) =>
          country.enabled
      );

    for (
      const country of
      enabledCountries
    ) {
      await runResearch(
        country
      );
    }
  }

  const anyRunnerRunning =
    useMemo(
      () =>
        Object.values(
          runnerStates
        ).some(
          (state) =>
            state.status ===
            "running"
        ),
      [runnerStates]
    );

  const enabledCount =
    useMemo(
      () =>
        SAFETY_COUNTRY_REGISTRY.filter(
          (country) =>
            country.enabled
        ).length,
      []
    );

  const pausedCount =
    useMemo(
      () =>
        SAFETY_COUNTRY_REGISTRY.filter(
          (country) =>
            !country.enabled
        ).length,
      []
    );

  useEffect(() => {
    loadSuggestions();
  }, []);

  /*
    ========================================================
    UI
    ========================================================
  */

  return (
    <main className="min-h-screen bg-[#07101f] text-white">
      <SiteHeader />

      <section className="mx-auto max-w-7xl px-6 py-16">
        {/* HEADER */}

        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-emerald-400">
              SEKUR Research Console
            </p>

            <h1 className="mt-4 text-5xl font-black tracking-tight">
              Research

              <span className="block bg-gradient-to-r from-blue-400 to-emerald-300 bg-clip-text text-transparent">
                suggestions.
              </span>
            </h1>

            <p className="mt-5 max-w-2xl leading-7 text-slate-400">
              Automated country intelligence
              with evidence coverage,
              confidence scoring and mandatory
              human review.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/calibration"
              className="rounded-xl border border-blue-400/20 bg-blue-400/10 px-5 py-3 text-sm font-black text-blue-200 transition hover:bg-blue-400/15"
            >
              Safety Calibration
            </Link>

            <Link
              href="/admin"
              className="rounded-xl border border-white/10 bg-white/[0.035] px-5 py-3 text-sm font-bold text-slate-300 transition hover:border-white/20 hover:text-white"
            >
              ← Research Console
            </Link>
          </div>
        </div>

        {/* STATUS */}

        <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <StatusCard
            label="Pending"
            value={
              loading
                ? "—"
                : String(
                    suggestions.length
                  )
            }
          />

          <StatusCard
            label="Publishing"
            value="Human approved"
            tone="green"
          />

          <StatusCard
            label="Live data"
            value="Protected"
            tone="blue"
          />

          <StatusCard
            label="Ready runners"
            value={String(
              enabledCount
            )}
            tone="green"
          />

          <StatusCard
            label="Paused runners"
            value={String(
              pausedCount
            )}
            tone="amber"
          />
        </div>

        {/* AUTOMATED RESEARCH */}

        <div className="mt-10">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-300">
                Automated Research
              </p>

              <h2 className="mt-2 text-3xl font-black">
                Safety Intelligence
              </h2>

              <p className="mt-3 max-w-2xl leading-7 text-slate-400">
                Country runners are generated
                from the SEKUR Safety registry.
                Research cannot directly modify
                live country scores.
              </p>
            </div>

            <button
              type="button"
              disabled={
                anyRunnerRunning
              }
              onClick={
                runAllSafetyResearch
              }
              className="rounded-xl border border-blue-400/20 bg-blue-400/10 px-5 py-3 text-sm font-black text-blue-200 transition hover:bg-blue-400/15 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {anyRunnerRunning
                ? "Research Running..."
                : `Run All ${enabledCount} Working Runners`}
            </button>
          </div>

          {/* REGISTRY-GENERATED CARDS */}

          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {SAFETY_COUNTRY_REGISTRY.map(
              (country) => {
                const state =
                  runnerStates[
                    country.slug
                  ] ?? {
                    status:
                      "idle",
                    message:
                      "",
                  };

                return (
                  <article
                    key={
                      country.slug
                    }
                    className={`rounded-3xl border p-7 ${
                      country.enabled
                        ? "border-blue-400/15 bg-gradient-to-br from-blue-500/[0.08] to-emerald-400/[0.04]"
                        : "border-amber-400/15 bg-amber-400/[0.035]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="text-xl font-black">
                        {
                          country.code
                        }
                      </div>

                      <div
                        className={`rounded-full border px-3 py-1 text-[10px] font-black tracking-[0.14em] ${
                          country.enabled
                            ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                            : "border-amber-400/20 bg-amber-400/10 text-amber-300"
                        }`}
                      >
                        {country.enabled
                          ? "READY"
                          : "PAUSED"}
                      </div>
                    </div>

                    <div className="mt-5 text-[10px] font-black uppercase tracking-[0.18em] text-blue-300">
                      {
                        country.methodology
                      }
                    </div>

                    <h3 className="mt-2 text-2xl font-black">
                      {
                        country.name
                      }{" "}
                      Safety
                    </h3>

                    <p className="mt-4 min-h-[110px] leading-7 text-slate-400">
                      {
                        country.description
                      }
                    </p>

                    {country.enabled ? (
                      <button
                        type="button"
                        disabled={
                          state.status ===
                          "running"
                        }
                        onClick={() =>
                          runResearch(
                            country
                          )
                        }
                        className="mt-6 w-full rounded-xl bg-white px-5 py-3 font-black text-slate-950 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {state.status ===
                        "running"
                          ? "Running..."
                          : `Run ${country.name}`}
                      </button>
                    ) : (
                      <div className="mt-6 rounded-xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-center text-sm font-black text-amber-300">
                        {country.disabledReason ??
                          "Paused"}
                      </div>
                    )}

                    {state.message && (
                      <div
                        className={`mt-4 rounded-xl border px-4 py-3 text-sm leading-6 ${
                          state.status ===
                          "error"
                            ? "border-red-400/20 bg-red-400/10 text-red-300"
                            : "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                        }`}
                      >
                        {state.status ===
                        "error"
                          ? "Error: "
                          : "✓ "}

                        {
                          state.message
                        }
                      </div>
                    )}
                  </article>
                );
              }
            )}
          </div>
        </div>

        {/* PAGE ERROR */}

        {errorMessage && (
          <div className="mt-8 rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-red-300">
            {errorMessage}
          </div>
        )}

        {/* HUMAN REVIEW */}

        <div className="mt-14 border-t border-white/10 pt-12">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-300">
                Human Review
              </p>

              <h2 className="mt-2 text-3xl font-black">
                Pending Intelligence
              </h2>

              <p className="mt-3 text-slate-500">
                Verify evidence,
                methodology, coverage and
                score before publishing.
              </p>
            </div>

            {!loading && (
              <button
                type="button"
                onClick={
                  loadSuggestions
                }
                className="rounded-xl border border-white/10 bg-white/[0.035] px-5 py-3 text-sm font-bold text-slate-300 transition hover:border-white/20 hover:text-white"
              >
                Refresh Queue
              </button>
            )}
          </div>
        </div>

        {/* REVIEW QUEUE */}

        {loading ? (
          <div className="mt-8 flex min-h-[300px] items-center justify-center rounded-3xl border border-white/10 bg-white/[0.025]">
            <div className="text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-emerald-400" />

              <p className="mt-5 text-sm font-semibold text-slate-400">
                Loading research queue...
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-8">
            <ResearchSuggestions
              suggestions={
                suggestions
              }
            />
          </div>
        )}
      </section>
    </main>
  );
}

/*
  =========================================================
  STATUS CARD
  =========================================================
*/

function StatusCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;

  tone?:
    | "green"
    | "blue"
    | "amber";
}) {
  const valueClass =
    tone === "green"
      ? "text-emerald-300"
      : tone === "blue"
      ? "text-blue-300"
      : tone === "amber"
      ? "text-amber-300"
      : "text-white";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
      <div className="text-xs uppercase tracking-[0.15em] text-slate-500">
        {label}
      </div>

      <div
        className={`mt-2 font-black ${valueClass}`}
      >
        {value}
      </div>
    </div>
  );
}
