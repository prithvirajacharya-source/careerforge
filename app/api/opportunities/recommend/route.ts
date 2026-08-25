import { NextResponse } from "next/server";
import { generateOpportunityRecommendations } from "@/lib/opportunity/generateOpportunityRecommendations";
import type { OpportunityProfile } from "@/lib/opportunity/types";
import { authenticateRequest } from "@/lib/supabaseServer";
import { resolveEntitlements } from "@/lib/personalization/entitlements";
import { careerProfiles } from "@/lib/careerProfiles";

const allowedCountries = new Set(["sweden", "germany", "united-states"]);
function text(value: unknown, max: number) { return typeof value === "string" ? value.trim().slice(0, max) : ""; }
export async function POST(request: Request) {
  try {
    const body = await request.json(); const raw = body?.profile; const rawCareer = text(raw?.currentCareer, 80); const rawCurrentCountry = text(raw?.currentCountry, 60); const profile: OpportunityProfile | null = raw ? { currentCareer: rawCareer && careerProfiles[rawCareer] ? rawCareer : null, skills: Array.isArray(raw.skills) ? raw.skills.slice(0, 100).map((skill: unknown) => text(skill, 80)).filter(Boolean) : [], currentCountry: allowedCountries.has(rawCurrentCountry) ? rawCurrentCountry : null, targetCountries: Array.isArray(raw.targetCountries) ? raw.targetCountries.slice(0, 10).map((country: unknown) => text(country, 60)).filter((country: string) => allowedCountries.has(country)) : [], desiredSalary: Number.isFinite(raw.desiredSalary) && raw.desiredSalary > 0 ? Math.min(raw.desiredSalary, 10_000_000) : null, desiredSalaryCurrency: text(raw.desiredSalaryCurrency, 3).toUpperCase() || null, remotePreference: ["required", "preferred", "neutral"].includes(raw.remotePreference) ? raw.remotePreference : "neutral", yearsExperience: Number.isFinite(raw.yearsExperience) ? Math.min(80, Math.max(0, raw.yearsExperience)) : null, educationLevel: text(raw.educationLevel, 120) || null, relocationWillingness: ["yes", "maybe", "no"].includes(raw.relocationWillingness) ? raw.relocationWillingness : "maybe", languages: Array.isArray(raw.languages) ? raw.languages.slice(0, 20).map((language: unknown) => text(language, 80)).filter(Boolean) : [], citizenshipRegion: text(raw.citizenshipRegion, 80) || null, workAuthorizationStatus: ["authorized", "requires-permit", "unknown"].includes(raw.workAuthorizationStatus) ? raw.workAuthorizationStatus : "unknown" } : null;
    const countries = Array.isArray(body?.countries) ? body.countries.slice(0, 3).map((country: unknown) => text(country, 60)).filter((country: string) => allowedCountries.has(country)) : undefined;
    const requestedCareer = text(body?.career, 80); if (requestedCareer && !careerProfiles[requestedCareer]) return NextResponse.json({ error: "A supported career is required." }, { status: 400 }); const career = requestedCareer || null; const limit = Number.isInteger(body?.limit) ? Math.min(10, Math.max(1, body.limit)) : 5;
    const authenticated = await authenticateRequest(request);
    let canUseAdvancedReport = false;
    if (authenticated) {
      const { data } = await authenticated.client.from("user_entitlements").select("plan_key,feature_overrides,valid_until").eq("user_id", authenticated.user.id).maybeSingle();
      const plan = data?.valid_until && new Date(data.valid_until) < new Date() ? "free" : data?.plan_key;
      canUseAdvancedReport = resolveEntitlements(plan, data?.feature_overrides ?? {}).advancedReport;
    }
    const generated = await generateOpportunityRecommendations({ profile, career, countries, limit: canUseAdvancedReport ? limit : Math.min(limit, 3), includeJobs: canUseAdvancedReport && body?.includeJobs !== false });
    const response = canUseAdvancedReport ? { ...generated, accessLevel: "pro" as const } : { ...generated, accessLevel: "preview" as const, recommendations: generated.recommendations.map((candidate) => ({ ...candidate, scoreBreakdown: { ...candidate.scoreBreakdown, components: candidate.scoreBreakdown.components.slice(0, 3), explanations: candidate.scoreBreakdown.explanations.slice(0, 2) }, missingSkills: [], studyRecommendations: [], representativeJobs: [], nextActions: [], actionPlan: [] })) };
    return NextResponse.json(response, { headers: { "Cache-Control": "private, no-store" } });
  } catch { return NextResponse.json({ error: "Could not generate opportunity recommendations." }, { status: 400 }); }
}
