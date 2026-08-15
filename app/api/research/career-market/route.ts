import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { authenticateCareerResearchAdmin } from "@/lib/careerResearch/auth";
import {
  CAREER_RESEARCH_TARGETS,
  getCareerResearchTarget,
  type CareerResearchTarget,
} from "@/lib/careerResearch/registry";
import { planBulkCareerResearch } from "@/lib/careerResearch/freshness";
import { getCareerResearchCountrySource } from "@/lib/careerResearch/countryRegistry";
import { likelySourceFormatDrift, sourceHealthStatus } from "@/lib/careerResearch/sourceHealth";
import { collectCareerResearch } from "@/lib/careerResearch/runner";
import { getCareerCountryProfile } from "@/lib/careerCountryProfiles";
import { researchPendingSalary } from "@/lib/careerModel";
import { unavailableMarketField } from "@/lib/careerCountryModel";
import {
  createCareerResearchReviewUpdate,
  type CareerResearchDecision,
} from "@/lib/careerResearch/review";
import type { CareerResearchRunStatus } from "@/lib/careerResearch/model";
import {
  validateCareerResearchPublication,
  type PublishableResearchRun,
} from "@/lib/careerResearch/publishing";

type ResearchRequest = { careerSlug?: string; countrySlug?: string; bulk?: boolean; force?: boolean };
type ReviewRequest = {
  runId?: number;
  decision?: CareerResearchDecision;
  reviewNotes?: string | null;
};

function errorStatus(message: string) {
  if (message.includes("Authenticated")) return 401;
  if (message.includes("admin access")) return 403;
  if (message.includes("already been reviewed")) return 409;
  return 400;
}

async function recordSourceHealth(supabase: SupabaseClient, target: CareerResearchTarget, error?: unknown) {
  try {
    const countrySource = getCareerResearchCountrySource(target.countrySlug);
    if (!countrySource) return;
    const { data: previous } = await supabase.from("career_research_source_health")
      .select("consecutive_failures,last_successful_fetch")
      .eq("source_key", target.sourceType).maybeSingle();
    const now = new Date().toISOString();
    const failureMessage = error instanceof Error ? error.message : error ? String(error) : null;
    const failures = failureMessage ? Number(previous?.consecutive_failures ?? 0) + 1 : 0;
    const refreshDays = countrySource.refreshAfterDays;
    const successfulAt = failureMessage ? previous?.last_successful_fetch ?? null : now;
    const nextExpectedRefresh = successfulAt && refreshDays ? new Date(new Date(successfulAt).getTime() + refreshDays * 86_400_000).toISOString() : null;
    await supabase.from("career_research_source_health").upsert({
      source_key: target.sourceType,
      source_system: countrySource.sourceSystem,
      source_url: countrySource.sourceUrl,
      status: sourceHealthStatus(failures, failureMessage ? previous?.last_successful_fetch : now),
      last_successful_fetch: failureMessage ? previous?.last_successful_fetch ?? null : now,
      last_failure: failureMessage ? now : null,
      last_failure_reason: failureMessage,
      consecutive_failures: failures,
      format_drift_detected: failureMessage ? likelySourceFormatDrift(failureMessage) : false,
      expected_refresh_days: refreshDays,
      next_expected_refresh: nextExpectedRefresh,
      stale: Boolean(nextExpectedRefresh && new Date(nextExpectedRefresh) < new Date(now)),
      checked_at: now,
      updated_at: now,
    });
  } catch (healthError) {
    console.error("Career research source-health recording failed:", healthError);
  }
}

async function collectAndStoreResearch(
  target: CareerResearchTarget,
  supabase: SupabaseClient,
  userId: string
) {
  let candidate;
  try {
    candidate = await collectCareerResearch(target);
    await recordSourceHealth(supabase, target);
  } catch (error) {
    await recordSourceHealth(supabase, target, error);
    throw error;
  }
  const liveProfile = getCareerCountryProfile(target.careerSlug, target.countrySlug) ?? {
    careerSlug: target.careerSlug,
    countrySlug: target.countrySlug,
    salary: researchPendingSalary(),
    hiringOutlook: unavailableMarketField(),
    demand: unavailableMarketField(),
    employmentRisk: unavailableMarketField(),
    education: null,
    notes: ["No verified live profile is published for this research-only target."],
  };

  const { data, error } = await supabase
    .from("career_research_runs")
    .insert({
      career_slug: target.careerSlug,
      country_slug: target.countrySlug,
      status: "pending_review",
      schema_version: candidate.schemaVersion,
      candidate_profile: candidate,
      live_profile_snapshot: liveProfile,
      source_name: candidate.salary.typical.provenance?.sourceName ?? null,
      source_url: candidate.salary.typical.provenance?.sourceUrl ?? null,
      researched_at: candidate.researchedAt,
      created_by: userId,
    })
    .select()
    .single();
  if (error) throw new Error(`Could not store career research run: ${error.message}`);
  return { run: data, candidate, liveProfile };
}

export async function GET(request: Request) {
  try {
    const { supabase } = await authenticateCareerResearchAdmin(request);
    const url = new URL(request.url);
    const careerSlug = url.searchParams.get("careerSlug") ?? "mechanical-engineer";
    const countrySlug = url.searchParams.get("countrySlug") ?? "sweden";
    const target = getCareerResearchTarget(careerSlug, countrySlug);

    if (!target) {
      return NextResponse.json({ error: "Career-market research target is not enabled." }, { status: 404 });
    }

    const { data, error } = await supabase
      .from("career_research_runs")
      .select("*")
      .eq("career_slug", careerSlug)
      .eq("country_slug", countrySlug)
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) throw new Error(`Could not load career research history: ${error.message}`);
    const { data: versions, error: versionsError } = await supabase
      .from("career_market_profile_versions")
      .select("id,career_slug,country_slug,event_type,before_profile,after_profile,source_run_id,published_by,published_at")
      .eq("career_slug", careerSlug)
      .eq("country_slug", countrySlug)
      .order("published_at", { ascending: false })
      .limit(20);
    const { data: sourceHealth } = await supabase.from("career_research_source_health")
      .select("*").eq("source_key", target.sourceType).maybeSingle();
    return NextResponse.json({
      target,
      runs: data ?? [],
      versions: versionsError ? [] : versions ?? [],
      sourceHealth: sourceHealth ?? null,
      governanceAvailable: !versionsError,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown career research error.";
    return NextResponse.json({ error: message }, { status: errorStatus(message) });
  }
}

export async function POST(request: Request) {
  try {
    const { supabase, user } = await authenticateCareerResearchAdmin(request);
    const body = (await request.json().catch(() => ({}))) as ResearchRequest;

    if (body.bulk) {
      const { data: recentRuns, error: historyError } = await supabase
        .from("career_research_runs")
        .select("career_slug,country_slug,researched_at")
        .order("researched_at", { ascending: false })
        .limit(200);
      if (historyError) throw new Error(`Could not plan bulk research: ${historyError.message}`);

      const latest = new Map<string, string>();
      for (const run of recentRuns ?? []) {
        const key = `${run.career_slug}:${run.country_slug}`;
        if (!latest.has(key) && run.researched_at) latest.set(key, run.researched_at);
      }
      const plan = planBulkCareerResearch(CAREER_RESEARCH_TARGETS, latest);
      const results: Array<Record<string, unknown>> = [];
      for (const item of plan) {
        if (!body.force && !item.shouldRun) {
          results.push({ careerSlug: item.target.careerSlug, countrySlug: item.target.countrySlug, status: "skipped_fresh", researchedAt: item.researchedAt });
          continue;
        }
        try {
          const result = await collectAndStoreResearch(item.target, supabase, user.id);
          results.push({ careerSlug: item.target.careerSlug, countrySlug: item.target.countrySlug, status: "pending_review", runId: result.run.id });
        } catch (error) {
          results.push({ careerSlug: item.target.careerSlug, countrySlug: item.target.countrySlug, status: "failed", error: error instanceof Error ? error.message : "Unknown collector failure" });
        }
      }
      return NextResponse.json({
        message: "Bulk research completed. Successful candidates are pending review; nothing was published.",
        results,
        safeguards: { liveDataChanged: false, published: false, sequential: true },
      });
    }

    const careerSlug = body.careerSlug ?? "";
    const countrySlug = body.countrySlug ?? "";
    const target = getCareerResearchTarget(careerSlug, countrySlug);

    if (!target?.enabled) {
      return NextResponse.json({ error: "Career-market research target is not enabled." }, { status: 404 });
    }

    const { run: data, candidate, liveProfile } = await collectAndStoreResearch(target, supabase, user.id);

    return NextResponse.json({
      message: "Research completed and stored for review. Live verified data was not changed.",
      target,
      run: data,
      candidate,
      liveProfile,
      safeguards: {
        liveDataChanged: false,
        publishAvailable: false,
        nativeCurrencyValidated: true,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown career research error.";
    console.error("Career research runner failed:", error);
    return NextResponse.json({ error: message }, { status: errorStatus(message) });
  }
}

export async function PATCH(request: Request) {
  try {
    const { supabase, user } = await authenticateCareerResearchAdmin(request);
    const body = (await request.json().catch(() => ({}))) as ReviewRequest;

    if (!Number.isInteger(body.runId) || Number(body.runId) <= 0) {
      throw new Error("A valid research run ID is required.");
    }
    if (body.decision !== "approve" && body.decision !== "reject") {
      throw new Error("Review decision must be approve or reject.");
    }

    const { data: currentRun, error: loadError } = await supabase
      .from("career_research_runs")
      .select("id,status")
      .eq("id", body.runId)
      .single();

    if (loadError || !currentRun) {
      throw new Error("Career research run was not found.");
    }

    const update = createCareerResearchReviewUpdate(
      { id: currentRun.id, status: currentRun.status as CareerResearchRunStatus },
      body.decision,
      user.id,
      body.reviewNotes
    );

    const { data: reviewedRun, error: updateError } = await supabase
      .from("career_research_runs")
      .update(update)
      .eq("id", currentRun.id)
      .eq("status", "pending_review")
      .select()
      .maybeSingle();

    if (updateError) {
      throw new Error(`Could not review career research run: ${updateError.message}`);
    }
    if (!reviewedRun) {
      throw new Error("This research run has already been reviewed.");
    }

    return NextResponse.json({
      message: body.decision === "approve"
        ? "Research approved for future publishing review. Live data was not changed."
        : "Research rejected. Live data was not changed.",
      run: reviewedRun,
      safeguards: { liveDataChanged: false, publishAvailable: false },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown career research review error.";
    return NextResponse.json({ error: message }, { status: errorStatus(message) });
  }
}

export async function PUT(request: Request) {
  try {
    const { supabase } = await authenticateCareerResearchAdmin(request);
    const body = (await request.json().catch(() => ({}))) as { runId?: number };
    if (!Number.isInteger(body.runId) || Number(body.runId) <= 0) {
      throw new Error("A valid research run ID is required.");
    }

    const { data: run, error: loadError } = await supabase
      .from("career_research_runs")
      .select("*")
      .eq("id", body.runId)
      .single();
    if (loadError || !run) throw new Error("Career research run was not found.");

    validateCareerResearchPublication(run as PublishableResearchRun);
    const fallbackLiveProfile = getCareerCountryProfile(run.career_slug, run.country_slug);
    if (!fallbackLiveProfile) throw new Error("Current live fallback profile was not found.");

    const { data: publication, error: publishError } = await supabase.rpc(
      "publish_career_market_research",
      { p_run_id: run.id, p_fallback_live_profile: fallbackLiveProfile }
    );
    if (publishError) {
      throw new Error(`Could not publish career research: ${publishError.message}`);
    }

    const { data: publishedRun, error: refreshError } = await supabase
      .from("career_research_runs")
      .select("*")
      .eq("id", run.id)
      .single();
    if (refreshError || !publishedRun) {
      throw new Error("Publication completed but the audit record could not be reloaded.");
    }

    return NextResponse.json({
      message: "Approved evidence published. Public data now resolves the Supabase version.",
      run: publishedRun,
      publication,
      safeguards: { explicitPublish: true, atomic: true },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown career research publishing error.";
    return NextResponse.json({ error: message }, { status: errorStatus(message) });
  }
}

export async function DELETE(request: Request) {
  try {
    const { supabase } = await authenticateCareerResearchAdmin(request);
    const body = (await request.json().catch(() => ({}))) as { versionId?: number };
    if (!Number.isInteger(body.versionId) || Number(body.versionId) <= 0) {
      throw new Error("A valid publication version ID is required.");
    }
    const { data: rollback, error } = await supabase.rpc("rollback_career_market_profile", {
      p_version_id: body.versionId,
    });
    if (error) throw new Error(`Could not roll back career market profile: ${error.message}`);
    return NextResponse.json({
      message: "Rollback completed as a new immutable publication version.",
      rollback,
      safeguards: { historyDeleted: false, explicitRollback: true, newVersionCreated: true },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown career market rollback error.";
    return NextResponse.json({ error: message }, { status: errorStatus(message) });
  }
}
