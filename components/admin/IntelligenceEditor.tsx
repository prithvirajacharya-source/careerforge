"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  SAFETY_COUNTRY_REGISTRY,
  SafetyCountryRegistryEntry,
} from "@/lib/intelligence/safetyCountryRegistry";

type SourceType =
  | "official"
  | "market"
  | "community"
  | "research"
  | "estimated";

export type IntelligenceEditorRow = {
  id: number;
  country_slug: string;
  factor_key: string;
  factor_label: string;
  score: number;
  weight: number;
  source_type: SourceType;
  source_name: string | null;
  source_url: string | null;
  explanation: string | null;
  verified_at: string | null;
  updated_at: string | null;
};

type IntelligenceEditorProps = {
  countryName: string;
  countryCode: string;
  rows: IntelligenceEditorRow[];
};

export default function IntelligenceEditor({
  countryName,
  countryCode,
  rows,
}: IntelligenceEditorProps) {
  const router = useRouter();

  const [factors, setFactors] =
    useState<IntelligenceEditorRow[]>(rows);

  const [saving, setSaving] =
    useState(false);

  const [researching, setResearching] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [errorMessage, setErrorMessage] =
    useState("");

  const countrySlug =
    factors[0]?.country_slug ?? "";

  const safetyRegistryEntry =
    useMemo<SafetyCountryRegistryEntry | undefined>(
      () =>
        SAFETY_COUNTRY_REGISTRY.find(
          (country) =>
            country.slug === countrySlug
        ),
      [countrySlug]
    );

  function updateFactor(
    id: number,
    field: keyof IntelligenceEditorRow,
    value: string | number | null
  ) {
    setFactors((current) =>
      current.map((factor) =>
        factor.id === id
          ? {
              ...factor,
              [field]: value,
            }
          : factor
      )
    );
  }

  async function runSafetyResearch() {
    setResearching(true);
    setMessage("");
    setErrorMessage("");

    try {
      if (!safetyRegistryEntry) {
        throw new Error(
          `No Safety research runner is registered for ${countryName}.`
        );
      }

      if (!safetyRegistryEntry.enabled) {
        throw new Error(
          safetyRegistryEntry.disabledReason ??
            `Safety research is currently disabled for ${countryName}.`
        );
      }

      const {
        data: {
          session,
        },
        error:
          sessionError,
      } =
        await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      if (!session) {
        throw new Error(
          "Admin session not found. Please sign in again."
        );
      }

      const response =
        await fetch(
          safetyRegistryEntry.endpoint,
          {
            method: "POST",

            headers: {
              Authorization:
                `Bearer ${session.access_token}`,
            },
          }
        );

      const rawText =
        await response.text();

      let result:
        | Record<string, unknown>
        | null = null;

      if (rawText.trim()) {
        try {
          result =
            JSON.parse(rawText);
        } catch {
          result = null;
        }
      }

      if (!response.ok) {
        const apiMessage =
          result &&
          typeof result.error ===
            "string"
            ? result.error
            : rawText ||
              `Research request failed with status ${response.status}.`;

        throw new Error(
          apiMessage
        );
      }

      setMessage(
        `${countryName} Safety research completed successfully.`
      );

      router.refresh();
    } catch (error) {
      console.error(
        "Safety research failed:",
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : "Unknown research error";

      setErrorMessage(
        `Could not run Safety research: ${message}`
      );
    } finally {
      setResearching(false);
    }
  }

  async function saveChanges() {
    setSaving(true);
    setMessage("");
    setErrorMessage("");

    try {
      const updates =
        factors.map(
          async (factor) => {
            const { error } =
              await supabase
                .from(
                  "country_intelligence_factors"
                )
                .update({
                  score:
                    factor.score,

                  weight:
                    factor.weight,

                  source_type:
                    factor.source_type,

                  source_name:
                    factor.source_name ||
                    null,

                  source_url:
                    factor.source_url ||
                    null,

                  explanation:
                    factor.explanation ||
                    null,

                  updated_at:
                    new Date().toISOString(),
                })
                .eq(
                  "id",
                  factor.id
                );

            if (error) {
              throw error;
            }
          }
        );

      await Promise.all(
        updates
      );

      setMessage(
        `${countryName} intelligence saved successfully.`
      );

      router.refresh();
    } catch (error) {
      console.error(
        "Failed to save intelligence:",
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : "Unknown database error";

      setErrorMessage(
        `Could not save changes: ${message}`
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      {/* COUNTRY HEADER */}

      <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-7">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">
              {countryCode}
            </div>

            <h2 className="mt-2 text-3xl font-black">
              {countryName}
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {factors.length} intelligence factors
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:items-end">
            <div className="rounded-xl border border-emerald-400/15 bg-emerald-400/5 px-4 py-3 text-sm font-semibold text-emerald-300">
              Live database
            </div>

            {safetyRegistryEntry ? (
              <div className="text-right text-xs text-slate-500">
                Safety methodology:{" "}
                <span className="font-semibold text-slate-300">
                  {
                    safetyRegistryEntry.methodology
                  }
                </span>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* RESEARCH CONTROLS */}

      <div className="mt-6 rounded-3xl border border-emerald-400/15 bg-emerald-400/[0.035] p-6">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.18em] text-emerald-300">
              Automated Research
            </div>

            <h3 className="mt-2 text-xl font-black">
              Safety Research Runner
            </h3>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              {safetyRegistryEntry
                ? safetyRegistryEntry.description
                : `No automated Safety research runner is registered for ${countryName}.`}
            </p>

            {safetyRegistryEntry &&
              !safetyRegistryEntry.enabled && (
                <p className="mt-2 text-sm font-semibold text-amber-300">
                  {
                    safetyRegistryEntry.disabledReason
                  }
                </p>
              )}
          </div>

          <button
            type="button"
            disabled={
              researching ||
              !safetyRegistryEntry ||
              !safetyRegistryEntry.enabled
            }
            onClick={
              runSafetyResearch
            }
            className="rounded-xl bg-emerald-300 px-6 py-3 font-black text-slate-950 transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {researching
              ? "Running Safety Research..."
              : "Run Safety Research"}
          </button>
        </div>
      </div>

      {/* FACTOR EDITORS */}

      <div className="mt-6 space-y-5">
        {factors.map(
          (factor) => (
            <div
              key={factor.id}
              className="rounded-3xl border border-white/10 bg-white/[0.025] p-6"
            >
              <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-center">
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.16em] text-blue-300">
                    {
                      factor.factor_key
                    }
                  </div>

                  <h3 className="mt-2 text-2xl font-black">
                    {
                      factor.factor_label
                    }
                  </h3>
                </div>

                <div className="rounded-xl border border-white/10 bg-black/20 px-5 py-3">
                  <div className="text-xs uppercase tracking-[0.14em] text-slate-500">
                    Current Score
                  </div>

                  <div className="mt-1 text-3xl font-black text-blue-300">
                    {
                      factor.score
                    }
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <div>
                  <label className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
                    Score
                  </label>

                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={
                      factor.score
                    }
                    onChange={(
                      event
                    ) =>
                      updateFactor(
                        factor.id,
                        "score",
                        Math.max(
                          0,
                          Math.min(
                            100,
                            Number(
                              event
                                .target
                                .value
                            )
                          )
                        )
                      )
                    }
                    className="mt-2 w-full rounded-xl border border-white/10 bg-[#0b1527] px-4 py-3 font-bold text-white outline-none transition focus:border-blue-400/40"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
                    Weight
                  </label>

                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={
                      factor.weight
                    }
                    onChange={(
                      event
                    ) =>
                      updateFactor(
                        factor.id,
                        "weight",
                        Math.max(
                          0,
                          Number(
                            event
                              .target
                              .value
                          )
                        )
                      )
                    }
                    className="mt-2 w-full rounded-xl border border-white/10 bg-[#0b1527] px-4 py-3 font-bold text-white outline-none transition focus:border-blue-400/40"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
                    Source Type
                  </label>

                  <select
                    value={
                      factor.source_type
                    }
                    onChange={(
                      event
                    ) =>
                      updateFactor(
                        factor.id,
                        "source_type",
                        event
                          .target
                          .value as SourceType
                      )
                    }
                    className="mt-2 w-full rounded-xl border border-white/10 bg-[#0b1527] px-4 py-3 font-bold text-white outline-none transition focus:border-blue-400/40"
                  >
                    <option value="estimated">
                      Estimated
                    </option>

                    <option value="research">
                      Research
                    </option>

                    <option value="market">
                      Market
                    </option>

                    <option value="official">
                      Official
                    </option>

                    <option value="community">
                      Community
                    </option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
                    Source Name
                  </label>

                  <input
                    type="text"
                    value={
                      factor.source_name ??
                      ""
                    }
                    onChange={(
                      event
                    ) =>
                      updateFactor(
                        factor.id,
                        "source_name",
                        event.target
                          .value
                      )
                    }
                    placeholder="e.g. Statistics Sweden"
                    className="mt-2 w-full rounded-xl border border-white/10 bg-[#0b1527] px-4 py-3 text-white outline-none transition placeholder:text-slate-700 focus:border-blue-400/40"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
                    Source URL
                  </label>

                  <input
                    type="url"
                    value={
                      factor.source_url ??
                      ""
                    }
                    onChange={(
                      event
                    ) =>
                      updateFactor(
                        factor.id,
                        "source_url",
                        event.target
                          .value
                      )
                    }
                    placeholder="https://..."
                    className="mt-2 w-full rounded-xl border border-white/10 bg-[#0b1527] px-4 py-3 text-white outline-none transition placeholder:text-slate-700 focus:border-blue-400/40"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
                    Explanation
                  </label>

                  <textarea
                    rows={4}
                    value={
                      factor.explanation ??
                      ""
                    }
                    onChange={(
                      event
                    ) =>
                      updateFactor(
                        factor.id,
                        "explanation",
                        event.target
                          .value
                      )
                    }
                    placeholder="Explain why this factor received this score..."
                    className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-[#0b1527] px-4 py-3 leading-7 text-white outline-none transition placeholder:text-slate-700 focus:border-blue-400/40"
                  />
                </div>
              </div>
            </div>
          )
        )}
      </div>

      {/* SAVE BAR */}

      <div className="sticky bottom-5 mt-8 rounded-2xl border border-white/10 bg-[#0b1527]/95 p-5 shadow-2xl backdrop-blur">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            {message && (
              <div className="font-semibold text-emerald-300">
                ✓ {message}
              </div>
            )}

            {errorMessage && (
              <div className="font-semibold text-red-400">
                {
                  errorMessage
                }
              </div>
            )}

            {!message &&
              !errorMessage && (
                <div className="text-sm text-slate-500">
                  Changes are not live until you save.
                </div>
              )}
          </div>

          <button
            type="button"
            disabled={saving}
            onClick={
              saveChanges
            }
            className="rounded-xl bg-white px-7 py-3 font-black text-slate-950 transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}