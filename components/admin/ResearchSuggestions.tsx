"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export type IntelligenceSuggestion = {
  id: number;
  country_slug: string;
  factor_key: string;
  current_score: number | null;
  suggested_score: number;
  source_type: string;
  source_name: string | null;
  source_url: string | null;
  evidence: string | null;
  reasoning: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
};

type Props = {
  suggestions: IntelligenceSuggestion[];
};

export default function ResearchSuggestions({
  suggestions,
}: Props) {
  const router = useRouter();

  const [workingId, setWorkingId] =
    useState<number | null>(null);

  const [message, setMessage] =
    useState("");

  const [errorMessage, setErrorMessage] =
    useState("");

  async function approveSuggestion(
    suggestion: IntelligenceSuggestion
  ) {
    setWorkingId(suggestion.id);
    setMessage("");
    setErrorMessage("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error(
          "You must be signed in as an administrator."
        );
      }

      /*
        1. Publish the proposed score and source
        to the live intelligence table.
      */
      const { error: publishError } =
        await supabase
          .from(
            "country_intelligence_factors"
          )
          .update({
            score:
              suggestion.suggested_score,

            source_type:
              suggestion.source_type,

            source_name:
              suggestion.source_name,

            source_url:
              suggestion.source_url,

            explanation:
              suggestion.reasoning ??
              suggestion.evidence ??
              null,

            verified_at:
              new Date().toISOString(),

            updated_at:
              new Date().toISOString(),
          })
          .eq(
            "country_slug",
            suggestion.country_slug
          )
          .eq(
            "factor_key",
            suggestion.factor_key
          );

      if (publishError) {
        throw publishError;
      }

      /*
        2. Mark the proposal as approved.
      */
      const { error: suggestionError } =
        await supabase
          .from(
            "intelligence_suggestions"
          )
          .update({
            status: "approved",
            reviewed_by: user.id,
            reviewed_at:
              new Date().toISOString(),
          })
          .eq("id", suggestion.id);

      if (suggestionError) {
        throw suggestionError;
      }

      setMessage(
        `${suggestion.country_slug} / ${suggestion.factor_key} published successfully.`
      );

      router.refresh();
    } catch (error) {
      console.error(
        "Approval failed:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Could not approve suggestion."
      );
    } finally {
      setWorkingId(null);
    }
  }

  async function rejectSuggestion(
    suggestion: IntelligenceSuggestion
  ) {
    setWorkingId(suggestion.id);
    setMessage("");
    setErrorMessage("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error(
          "You must be signed in as an administrator."
        );
      }

      const { error } =
        await supabase
          .from(
            "intelligence_suggestions"
          )
          .update({
            status: "rejected",
            reviewed_by: user.id,
            reviewed_at:
              new Date().toISOString(),
          })
          .eq("id", suggestion.id);

      if (error) {
        throw error;
      }

      setMessage(
        "Suggestion rejected."
      );

      router.refresh();
    } catch (error) {
      console.error(
        "Rejection failed:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Could not reject suggestion."
      );
    } finally {
      setWorkingId(null);
    }
  }

  if (suggestions.length === 0) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.025] px-8 py-20 text-center">
        <div className="text-4xl">
          ✓
        </div>

        <h2 className="mt-5 text-2xl font-black">
          Research queue clear
        </h2>

        <p className="mx-auto mt-3 max-w-xl leading-7 text-slate-500">
          There are currently no pending
          intelligence suggestions waiting
          for review.
        </p>
      </div>
    );
  }

  return (
    <div>
      {(message ||
        errorMessage) && (
        <div
          className={`mb-6 rounded-2xl border px-5 py-4 ${
            errorMessage
              ? "border-red-400/20 bg-red-400/10 text-red-300"
              : "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
          }`}
        >
          {errorMessage ||
            `✓ ${message}`}
        </div>
      )}

      <div className="space-y-6">
        {suggestions.map(
          (suggestion) => {
            const difference =
              suggestion.current_score !==
              null
                ? suggestion.suggested_score -
                  suggestion.current_score
                : null;

            return (
              <article
                key={suggestion.id}
                className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025]"
              >
                {/* HEADER */}
                <div className="flex flex-col justify-between gap-5 border-b border-white/10 p-7 sm:flex-row sm:items-start">
                  <div>
                    <div className="text-xs font-black uppercase tracking-[0.18em] text-emerald-300">
                      {
                        suggestion.country_slug
                      }
                    </div>

                    <h2 className="mt-2 text-3xl font-black capitalize">
                      {suggestion.factor_key.replaceAll(
                        "_",
                        " "
                      )}
                    </h2>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-center">
                      <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
                        Current
                      </div>

                      <div className="mt-1 text-2xl font-black">
                        {suggestion.current_score ??
                          "—"}
                      </div>
                    </div>

                    <div className="text-xl text-slate-600">
                      →
                    </div>

                    <div className="rounded-xl border border-blue-400/20 bg-blue-400/5 px-4 py-3 text-center">
                      <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-300">
                        Suggested
                      </div>

                      <div className="mt-1 text-2xl font-black text-blue-300">
                        {
                          suggestion.suggested_score
                        }
                      </div>
                    </div>

                    {difference !==
                      null && (
                      <div
                        className={`rounded-full px-3 py-1 text-xs font-black ${
                          difference > 0
                            ? "bg-emerald-400/10 text-emerald-300"
                            : difference < 0
                            ? "bg-red-400/10 text-red-300"
                            : "bg-white/5 text-slate-400"
                        }`}
                      >
                        {difference > 0
                          ? "+"
                          : ""}
                        {difference}
                      </div>
                    )}
                  </div>
                </div>

                {/* CONTENT */}
                <div className="grid gap-0 lg:grid-cols-2">
                  <div className="border-b border-white/10 p-7 lg:border-b-0 lg:border-r">
                    <div className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                      Evidence
                    </div>

                    <p className="mt-3 whitespace-pre-wrap leading-7 text-slate-300">
                      {suggestion.evidence ||
                        "No evidence summary provided."}
                    </p>
                  </div>

                  <div className="p-7">
                    <div className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                      SEKUR Reasoning
                    </div>

                    <p className="mt-3 whitespace-pre-wrap leading-7 text-slate-300">
                      {suggestion.reasoning ||
                        "No scoring reasoning provided."}
                    </p>
                  </div>
                </div>

                {/* SOURCE */}
                <div className="border-t border-white/10 bg-black/10 px-7 py-5">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <div className="text-xs text-slate-600">
                        Source Type
                      </div>

                      <div className="mt-1 font-semibold capitalize">
                        {
                          suggestion.source_type
                        }
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-slate-600">
                        Source
                      </div>

                      <div className="mt-1 font-semibold">
                        {suggestion.source_name ||
                          "Not provided"}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-slate-600">
                        Created
                      </div>

                      <div className="mt-1 font-semibold">
                        {new Date(
                          suggestion.created_at
                        ).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {suggestion.source_url && (
                    <a
                      href={
                        suggestion.source_url
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-block text-sm font-semibold text-blue-300 hover:text-blue-200"
                    >
                      Open source ↗
                    </a>
                  )}
                </div>

                {/* ACTIONS */}
                <div className="flex flex-col justify-between gap-4 border-t border-white/10 p-7 sm:flex-row sm:items-center">
                  <div className="text-sm text-slate-500">
                    Human approval is
                    required before this
                    becomes live SEKUR
                    intelligence.
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      disabled={
                        workingId ===
                        suggestion.id
                      }
                      onClick={() =>
                        rejectSuggestion(
                          suggestion
                        )
                      }
                      className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 font-bold text-slate-300 transition hover:bg-white/10 disabled:opacity-50"
                    >
                      Reject
                    </button>

                    <button
                      type="button"
                      disabled={
                        workingId ===
                        suggestion.id
                      }
                      onClick={() =>
                        approveSuggestion(
                          suggestion
                        )
                      }
                      className="rounded-xl bg-white px-6 py-3 font-black text-slate-950 transition hover:scale-[1.02] disabled:opacity-50"
                    >
                      {workingId ===
                      suggestion.id
                        ? "Working..."
                        : "Approve & Publish"}
                    </button>
                  </div>
                </div>
              </article>
            );
          }
        )}
      </div>
    </div>
  );
}