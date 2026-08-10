import { NextResponse } from "next/server";
import { authenticateCareerResearchAdmin } from "@/lib/careerResearch/auth";
import { getCareerResearchTarget } from "@/lib/careerResearch/registry";
import { collectCareerResearch } from "@/lib/careerResearch/runner";
import { getCareerCountryProfile } from "@/lib/careerCountryProfiles";

type ResearchRequest = { careerSlug?: string; countrySlug?: string };

function errorStatus(message: string) {
  if (message.includes("Authenticated")) return 401;
  if (message.includes("admin access")) return 403;
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
