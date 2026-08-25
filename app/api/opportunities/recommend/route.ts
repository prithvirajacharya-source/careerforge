import { NextResponse } from "next/server";
import { generateOpportunityRecommendations } from "@/lib/opportunity/generateOpportunityRecommendations";
import type { OpportunityProfile } from "@/lib/opportunity/types";

const allowedCountries = new Set(["sweden", "germany", "united-states"]);
function text(value: unknown, max: number) { return typeof value === "string" ? value.trim().slice(0, max) : ""; }
export async function POST(request: Request) {
  try {
    const body = await request.json(); const raw = body?.profile; const profile: OpportunityProfile | null = raw ? { currentCareer: text(raw.currentCareer, 80) || null, skills: Array.isArray(raw.skills) ? raw.skills.slice(0, 100).map((skill: unknown) => text(skill, 80)).filter(Boolean) : [], currentCountry: text(raw.currentCountry, 60) || null, targetCountries: Array.isArray(raw.targetCountries) ? raw.targetCountries.slice(0, 10).map((country: unknown) => text(country, 60)).filter((country: string) => allowedCountries.has(country)) : [], desiredSalary: Number.isFinite(raw.desiredSalary) && raw.desiredSalary > 0 ? Math.min(raw.desiredSalary, 10_000_000) : null, desiredSalaryCurrency: text(raw.desiredSalaryCurrency, 3).toUpperCase() || null, remotePreference: ["required", "preferred", "neutral"].includes(raw.remotePreference) ? raw.remotePreference : "neutral", yearsExperience: Number.isFinite(raw.yearsExperience) ? Math.min(80, Math.max(0, raw.yearsExperience)) : null, educationLevel: text(raw.educationLevel, 120) || null, relocationWillingness: ["yes", "maybe", "no"].includes(raw.relocationWillingness) ? raw.relocationWillingness : "maybe" } : null;
    const countries = Array.isArray(body?.countries) ? body.countries.slice(0, 3).map((country: unknown) => text(country, 60)).filter((country: string) => allowedCountries.has(country)) : undefined;
    const career = text(body?.career, 80) || null; const limit = Number.isInteger(body?.limit) ? Math.min(10, Math.max(1, body.limit)) : 5;
    return NextResponse.json(await generateOpportunityRecommendations({ profile, career, countries, limit, includeJobs: body?.includeJobs !== false }), { headers: { "Cache-Control": "private, no-store" } });
  } catch { return NextResponse.json({ error: "Could not generate opportunity recommendations." }, { status: 400 }); }
}
