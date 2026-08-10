"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  SAFETY_COUNTRY_REGISTRY,
} from "@/lib/intelligence/safetyCountryRegistry";

type RunnerStatus =
  | "idle"
  | "running"
  | "success"
  | "failed"
  | "disabled";

type ResultRow = {
  slug: string;
  name: string;
  status: RunnerStatus;
  message: string;
};

export default function BulkSafetyResearch() {
  const [running, setRunning] =
    useState(false);

  const [results, setResults] =
    useState<ResultRow[]>([]);

  const enabledCountries =
    SAFETY_COUNTRY_REGISTRY.filter(
      (country) =>
        country.enabled
    );

  async function runAll() {
    if (running) {
      return;
    }

    setRunning(true);

    setResults(
      SAFETY_COUNTRY_REGISTRY.map(
        (country) => ({
          slug: country.slug,
          name: country.name,
          status:
            country.enabled
              ? "idle"
              : "disabled",
          message:
            country.enabled
              ? "Waiting"
              : country.disabledReason ??
                "Disabled",
        })
      )
    );

    try {
      const {
        data: {
          session,
        },
        error:
          sessionError,
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

      for (
        const country of
        enabledCountries
      ) {
        setResults(
          (current) =>
            current.map(
              (row) =>
                row.slug ===
                country.slug
                  ? {
                      ...row,
                      status:
                        "running",
                      message:
                        "Running research...",
                    }
                  : row
            )
        );

        try {
          const response =
            await fetch(
              country.endpoint,
              {
                method:
                  "POST",

                headers: {
                  Authorization:
                    `Bearer ${session.access_token}`,
                },
              }
            );

          const rawText =
            await response.text();

          let result:
            | Record<
                string,
                unknown
              >
            | null = null;

          if (
            rawText.trim()
          ) {
            try {
              result =
                JSON.parse(
                  rawText
                );
            } catch {
              result =
                null;
            }
          }

          if (
            !response.ok
          ) {
            const message =
              result &&
              typeof result.error ===
                "string"
                ? result.error
                : rawText ||
                  `HTTP ${response.status}`;

            throw new Error(
              message
            );
          }

          setResults(
            (current) =>
              current.map(
                (row) =>
                  row.slug ===
                  country.slug
                    ? {
                        ...row,
                        status:
                          "success",
                        message:
                          "Research completed",
                      }
                    : row
              )
          );
        } catch (
          error
        ) {
          const message =
            error instanceof Error
              ? error.message
              : "Unknown error";

          setResults(
            (current) =>
              current.map(
                (row) =>
                  row.slug ===
                  country.slug
                    ? {
                        ...row,
                        status:
                          "failed",
                        message,
                      }
                    : row
              )
          );
        }
      }
    } catch (
      error
    ) {
      console.error(
        "Bulk Safety research failed:",
        error
      );
    } finally {
      setRunning(false);
    }
  }

  const successCount =
    results.filter(
      (result) =>
        result.status ===
        "success"
    ).length;

  const failureCount =
    results.filter(
      (result) =>
        result.status ===
        "failed"
    ).length;

  return (
    <section className="mt-10 rounded-3xl border border-emerald-400/15 bg-emerald-400/[0.035] p-7">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div>
          <div className="text-xs font-black uppercase tracking-[0.18em] text-emerald-300">
            Automated Research
          </div>

          <h2 className="mt-2 text-2xl font-black">
            Global Safety Research
          </h2>

          <p className="mt-2 max-w-2xl leading-7 text-slate-400">
            Run all enabled SEKUR
            Safety research pipelines
            from one place.
          </p>

          <p className="mt-2 text-sm text-slate-500">
            {
              enabledCountries.length
            } enabled countries ·{" "}
            {
              SAFETY_COUNTRY_REGISTRY.length -
              enabledCountries.length
            } disabled
          </p>
        </div>

        <button
          type="button"
          disabled={running}
          onClick={runAll}
          className="rounded-xl bg-emerald-300 px-7 py-4 font-black text-slate-950 transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {running
            ? "Research Running..."
            : "Run All Safety Research"}
        </button>
      </div>

      {results.length >
        0 && (
        <div className="mt-7">
          <div className="mb-4 flex flex-wrap gap-4 text-sm">
            <span className="text-emerald-300">
              Success:{" "}
              {
                successCount
              }
            </span>

            <span className="text-red-300">
              Failed:{" "}
              {
                failureCount
              }
            </span>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {results.map(
              (result) => (
                <div
                  key={
                    result.slug
                  }
                  className="rounded-2xl border border-white/10 bg-[#091426] p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-bold">
                      {
                        result.name
                      }
                    </div>

                    <div
                      className={`text-xs font-black uppercase tracking-[0.12em] ${
                        result.status ===
                        "success"
                          ? "text-emerald-300"
                          : result.status ===
                            "failed"
                          ? "text-red-300"
                          : result.status ===
                            "running"
                          ? "text-blue-300"
                          : result.status ===
                            "disabled"
                          ? "text-amber-300"
                          : "text-slate-500"
                      }`}
                    >
                      {
                        result.status
                      }
                    </div>
                  </div>

                  <div className="mt-2 text-xs leading-5 text-slate-500">
                    {
                      result.message
                    }
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </section>
  );
}