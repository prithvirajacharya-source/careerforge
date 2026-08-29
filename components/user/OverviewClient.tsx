"use client";

import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { UserCareerProfile } from "@/lib/personalization/model";
import { calculateProfileCompleteness } from "@/lib/personalization/profileCompleteness";
import type { OpportunityResponse } from "@/lib/opportunity/types";

type SavedItem = { id: number; item_type: "career" | "country" | "career_market"; career_slug: string | null; country_slug: string | null };

const emptyProfile: UserCareerProfile = { currentCountry: null, targetCountries: [], currentCareer: null, yearsExperience: null, educationLevel: null, skills: [], desiredSalary: null, desiredSalaryCurrency: null, remotePreference: "neutral", relocationWillingness: "maybe", careerGoals: null };
const readable = (slug: string | null) => slug ? slug.split("-").map(word => word[0]?.toUpperCase() + word.slice(1)).join(" ") : "Opportunity";

export default function OverviewClient({ user }: { user: User }) {
  const [profile, setProfile] = useState<UserCareerProfile>(emptyProfile);
  const [report, setReport] = useState<OpportunityResponse | null>(null);
  const [saved, setSaved] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      const [profileResult, savedResult] = await Promise.all([
        supabase.from("user_career_profiles").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("saved_career_markets").select("id,item_type,career_slug,country_slug").eq("user_id", user.id).order("updated_at", { ascending: false }).limit(3),
      ]);
      if (!active) return;
      const row = profileResult.data;
      const nextProfile: UserCareerProfile = row ? { currentCountry: row.current_country, targetCountries: row.target_countries ?? [], currentCareer: row.current_career, yearsExperience: row.years_experience, educationLevel: row.education_level, educationField: row.education_field, skills: row.skills ?? [], languages: row.languages ?? [], citizenshipRegion: row.citizenship_region, workAuthorizationStatus: row.work_authorization_status ?? "unknown", desiredSalary: row.desired_salary, desiredSalaryCurrency: row.desired_salary_currency, remotePreference: row.remote_preference, relocationWillingness: row.relocation_willingness, careerGoals: row.career_goals } : emptyProfile;
      setProfile(nextProfile);
      setSaved((savedResult.data ?? []) as SavedItem[]);
      try {
        const response = await fetch("/api/opportunities/recommend", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ profile: nextProfile, limit: 5, includeJobs: true }) });
        if (response.ok && active) setReport(await response.json());
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, [user.id]);

  if (loading) return <div className="border-y border-slate-200 py-8 text-slate-600">Preparing your career overview…</div>;
  const completeness = calculateProfileCompleteness(profile);
  const ranked = report?.recommendations.filter(item => item.opportunityScore !== null) ?? [];
  const best = ranked[0];
  const jobs = best?.representativeJobs.slice(0, 3) ?? [];
  const nextAction = completeness.recommendation ?? best?.nextActions[0] ?? null;

  return <div>
    <header className="border-b border-slate-200 pb-7"><p className="product-eyebrow">Career status</p><h1 className="mt-2 text-4xl font-bold">Overview</h1><p className="mt-2 text-slate-600">Your strongest signal and the next action worth taking.</p></header>

    <section className="grid gap-7 border-b border-slate-200 py-8 md:grid-cols-[1fr_220px]">
      <div><p className="text-xs font-bold uppercase tracking-[.12em] text-slate-600">Your strongest opportunity</p>{best ? <><h2 className="mt-3 text-2xl font-bold">{best.careerName} · {best.countryName}</h2><p className="mt-2 text-sm text-slate-600">{best.evidenceCoverage}% evidence coverage · {best.confidence.replace("-", " ")} confidence</p><Link href={`/careers/${best.careerSlug}?country=${best.countrySlug}`} className="product-button product-button-primary mt-5">View opportunity</Link></> : <><h2 className="mt-3 text-xl font-bold">No ranked opportunity yet</h2><p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">Add career context so SEKUR can evaluate supported opportunities without inventing a result.</p><Link href="/profile" className="product-button product-button-primary mt-5">Complete My Career</Link></>}</div>
      <div className="border-l border-slate-200 pl-0 md:pl-6"><p className="text-sm font-semibold text-slate-600">Opportunity score</p><p className="mt-2 text-5xl font-bold">{best?.opportunityScore ?? "—"}</p><p className="mt-5 text-sm font-semibold text-slate-600">Profile strength</p><div className="mt-2 flex items-center gap-3"><div className="h-2 flex-1 bg-slate-200"><div className="h-full bg-blue-600" style={{ width: `${completeness.score}%` }} /></div><strong>{completeness.score}%</strong></div></div>
    </section>

    <section className="border-b border-slate-200 py-7"><div className="grid gap-4 sm:grid-cols-[180px_1fr_auto] sm:items-center"><h2 className="font-bold">Next best action</h2><p className="text-sm text-slate-600">{nextAction ?? "Your profile has enough context. Review your strongest opportunity next."}</p><Link href={completeness.recommendation ? "/profile" : best ? `/careers/${best.careerSlug}?country=${best.countrySlug}` : "/careers"} className="font-bold text-blue-700">{completeness.recommendation ? "Update profile" : "Review"} →</Link></div></section>

    <section className="border-b border-slate-200 py-7"><div className="flex items-center justify-between"><h2 className="text-lg font-bold">High-match jobs</h2><Link href="/jobs" className="text-sm font-bold text-blue-700">View jobs →</Link></div>{jobs.length ? <div className="mt-4 divide-y divide-slate-200 border-y border-slate-200">{jobs.map(job => <a key={job.id} href={job.sourceUrl} target="_blank" rel="noreferrer" className="grid gap-1 py-4 sm:grid-cols-[1fr_220px_auto] sm:items-center"><strong>{job.title}</strong><span className="text-sm text-slate-600">{job.company ?? "Employer not listed"}</span><span className="text-sm font-semibold text-blue-700">Open source ↗</span></a>)}</div> : <p className="mt-3 text-sm text-slate-600">No sourced high-match jobs are available for your strongest opportunity right now.</p>}</section>

    <section className="py-7"><div className="flex items-center justify-between"><h2 className="text-lg font-bold">Saved opportunities</h2><Link href="/saved" className="text-sm font-bold text-blue-700">View saved →</Link></div>{saved.length ? <div className="mt-3 divide-y divide-slate-200">{saved.map(item => <Link key={item.id} href={item.item_type === "country" ? `/countries/${item.country_slug}` : `/careers/${item.career_slug}${item.country_slug ? `?country=${item.country_slug}` : ""}`} className="flex items-center justify-between py-3"><span>{item.item_type === "country" ? readable(item.country_slug) : `${readable(item.career_slug)}${item.country_slug ? ` · ${readable(item.country_slug)}` : ""}`}</span><span className="text-blue-700">View →</span></Link>)}</div> : <p className="mt-3 text-sm text-slate-600">You have not saved any opportunities yet.</p>}</section>
  </div>;
}
