import { NextResponse } from "next/server";
import { authenticateCareerResearchAdmin } from "@/lib/careerResearch/auth";
import { getCareerResearchTarget } from "@/lib/careerResearch/registry";
import { collectCareerResearch } from "@/lib/careerResearch/runner";
import { getCareerCountryProfile } from "@/lib/careerCountryProfiles";
import {
  createCareerResearchReviewUpdate,
  type CareerResearchDecision,
} from "@/lib/careerResearch/review";
import type { CareerResearchRunStatus } from "@/lib/careerResearch/model";
import {
  validateCareerResearchPublication,
  type PublishableResearchRun,
} from "@/lib/careerResearch/publishing";

type ResearchRequest = { careerSlug?: string; countrySlug?: string };
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
    return NextResponse.json({ target, runs: data ?? [] });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown career research error.";
    return NextResponse.json({ error: message }, { status: errorStatus(message) });
  }
}

export async function POST(request: Request) {
  try {
    const { supabase, user } = await authenticateCareerResearchAdmin(request);
    const body = (await request.json().catch(() => ({}))) as ResearchRequest;
    const careerSlug = body.careerSlug ?? "";
    const countrySlug = body.countrySlug ?? "";
    const target = getCareerResearchTarget(careerSlug, countrySlug);

    if (!target?.enabled) {
      return NextResponse.json({ error: "Career-market research target is not enabled." }, { status: 404 });
    }

    const candidate = await collectCareerResearch(target);
    const liveProfile = getCareerCountryProfile(careerSlug, countrySlug);
    if (!liveProfile) throw new Error("The live career-market profile does not exist.");

    const { data, error } = await supabase
      .from("career_research_runs")
      .insert({
        career_slug: careerSlug,
        country_slug: countrySlug,
        status: "pending_review",
        schema_version: candidate.schemaVersion,
        candidate_profile: candidate,
        live_profile_snapshot: liveProfile,
        source_name: candidate.salary.typical.provenance?.sourceName ?? null,
        source_url: candidate.salary.typical.provenance?.sourceUrl ?? null,
        researched_at: candidate.researchedAt,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) throw new Error(`Could not store career research run: ${error.message}`);

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
