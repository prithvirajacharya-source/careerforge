"use client";

import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { CareerCountryProfile } from "@/lib/careerCountryModel";
import type { CareerProfile } from "@/lib/careerModel";
import type { UserCareerProfile } from "@/lib/personalization/model";
import { resolveEntitlements } from "@/lib/personalization/entitlements";
import { generateOpportunityReport, opportunityRankLabel } from "@/lib/personalization/report";
import { validateUserCareerProfile } from "@/lib/personalization/validation";
import { trackMonetizationEvent } from "@/lib/personalization/analytics";

const countryNames: Record<string, string> = { "united-states": "United States", sweden: "Sweden", germany: "Germany" };
const emptyProfile: UserCareerProfile = { currentCountry: null, targetCountries: ["sweden", "united-states"], currentCareer: "mechanical-engineer", yearsExperience: null, educationLevel: null, skills: [], desiredSalary: null, desiredSalaryCurrency: null, remotePreference: "neutral", relocationWillingness: "maybe", careerGoals: null };

function formatNativeSalary(value: number | null, currency: string | null) {
  if (value === null || currency === null) return "Unavailable";
  return new Intl.NumberFormat("en", { style: "currency", currency, maximumFractionDigits: 0 }).format(value);
}

export default function OpportunityReportClient({ user, careers, markets }: { user: User; careers: CareerProfile[]; markets: CareerCountryProfile[] }) {
  const [input, setInput] = useState(emptyProfile);
  const [report, setReport] = useState<ReturnType<typeof generateOpportunityReport> | null>(null);
  const [advanced, setAdvanced] = useState(false);
  const [deepFactors, setDeepFactors] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    Promise.all([
      supabase.from("user_career_profiles").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("user_entitlements").select("plan_key,feature_overrides,valid_until").eq("user_id", user.id).maybeSingle(),
    ]).then(([profileResult, entitlement]) => {
      if (profileResult.data) setInput({ currentCountry: profileResult.data.current_country, targetCountries: profileResult.data.target_countries?.length ? profileResult.data.target_countries : emptyProfile.targetCountries, currentCareer: profileResult.data.current_career ?? emptyProfile.currentCareer, yearsExperience: profileResult.data.years_experience, educationLevel: profileResult.data.education_level, skills: profileResult.data.skills ?? [], desiredSalary: profileResult.data.desired_salary, desiredSalaryCurrency: profileResult.data.desired_salary_currency, remotePreference: profileResult.data.remote_preference, relocationWillingness: profileResult.data.relocation_willingness, careerGoals: profileResult.data.career_goals });
      const plan = entitlement.data?.valid_until && new Date(entitlement.data.valid_until) < new Date() ? "free" : entitlement.data?.plan_key;
      const capabilities = resolveEntitlements(plan, entitlement.data?.feature_overrides ?? {});
      setAdvanced(capabilities.advancedReport);
      setDeepFactors(capabilities.deepFactorBreakdown);
      setLoading(false);
    });
  }, [user.id]);

  async function generate() {
    setMessage("");
    trackMonetizationEvent("opportunity_report_started", { careerSlug: input.currentCareer ?? "" });
    try {
      validateUserCareerProfile(input);
      const career = careers.find(item => item.slug === input.currentCareer);
      if (!career) throw new Error("Select a supported career.");
      if (!input.targetCountries.length) throw new Error("Select at least one target country.");
      const output = generateOpportunityReport(input, career, markets.filter(market => market.careerSlug === career.slug));
      setReport(output);
      trackMonetizationEvent("opportunity_report_completed", { careerSlug: career.slug, coverage: output.markets[0]?.ranking.coverage ?? 0 });
      const { error } = await supabase.from("career_opportunity_reports").insert({ user_id: user.id, status: "ready", input_snapshot: input, output_snapshot: output, methodology_version: output.methodologyVersion, evidence_researched_at: new Date().toISOString() });
      setMessage(error ? `Report generated, but its private snapshot could not be saved: ${error.message}` : "Report generated and saved to your private account.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not generate report.");
    }
  }

  if (loading) return <div className="glass-panel rounded-2xl border p-8 text-slate-300">Preparing your report inputs...</div>;
  const field = "glass-control mt-2 w-full rounded-xl px-4 py-3 text-white";

  return <div>
    <div className="max-w-3xl"><p className="text-xs font-black uppercase tracking-[.18em] text-emerald-300">Personal intelligence</p><h1 className="mt-3 text-4xl font-black sm:text-5xl">SEKUR Opportunity Report</h1><p className="mt-4 leading-7 text-slate-400">Compare target labour markets using verified SEKUR evidence. Missing evidence lowers coverage instead of being estimated.</p></div>
    <section className="glass-panel mt-8 rounded-3xl border p-6 sm:p-8">
      <h2 className="text-xl font-black">Adjust report inputs</h2>
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <label className="text-sm font-bold text-slate-300">Career<select value={input.currentCareer ?? ""} onChange={event => setInput({ ...input, currentCareer: event.target.value })} className={field}>{careers.map(career => <option key={career.slug} value={career.slug}>{career.title}</option>)}</select></label>
        <label className="text-sm font-bold text-slate-300">Years of experience<input type="number" min="0" max="80" value={input.yearsExperience ?? ""} onChange={event => setInput({ ...input, yearsExperience: event.target.value ? Number(event.target.value) : null })} className={field} /></label>
        <label className="text-sm font-bold text-slate-300">Education<input value={input.educationLevel ?? ""} onChange={event => setInput({ ...input, educationLevel: event.target.value || null })} className={field} /></label>
        <label className="text-sm font-bold text-slate-300">Remote preference<select value={input.remotePreference} onChange={event => setInput({ ...input, remotePreference: event.target.value as UserCareerProfile["remotePreference"] })} className={field}><option value="neutral">Neutral</option><option value="preferred">Preferred</option><option value="required">Required</option></select></label>
        <label className="text-sm font-bold text-slate-300">Desired annual salary<input type="number" min="0" value={input.desiredSalary ?? ""} onChange={event => setInput({ ...input, desiredSalary: event.target.value ? Number(event.target.value) : null })} className={field} /></label>
        <label className="text-sm font-bold text-slate-300">Goal currency<select value={input.desiredSalaryCurrency ?? ""} onChange={event => setInput({ ...input, desiredSalaryCurrency: event.target.value || null })} className={field}><option value="">Not selected</option><option>USD</option><option>SEK</option><option>EUR</option></select></label>
        <fieldset className="sm:col-span-2"><legend className="text-sm font-bold text-slate-300">Target countries</legend><div className="mt-3 grid gap-2 sm:grid-cols-3">{Object.entries(countryNames).map(([slug, name]) => <label key={slug} className="glass-subtle flex items-center gap-3 rounded-xl border p-3 text-sm"><input type="checkbox" checked={input.targetCountries.includes(slug)} onChange={event => setInput({ ...input, targetCountries: event.target.checked ? [...input.targetCountries, slug] : input.targetCountries.filter(item => item !== slug) })} />{name}</label>)}</div></fieldset>
      </div>
      <button type="button" onClick={generate} className="mt-7 rounded-xl bg-emerald-300 px-6 py-3 font-black text-slate-950">Generate report</button>
      {message && <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-slate-300">{message}</div>}
    </section>
    {report && <section className="mt-10">
      <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-3xl font-black">Ranked target markets</h2><p className="mt-2 text-sm text-slate-400">Methodology: {report.methodologyVersion}</p></div><span className="rounded-full border border-amber-300/20 bg-amber-300/5 px-3 py-2 text-xs text-amber-100">Not immigration or legal advice</span></div>
      {report.markets.length ? <div className="mt-6 space-y-5">{report.markets.map((market, index) => <article key={market.countrySlug} className="glass-card rounded-3xl border p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4"><div><div className="text-xs font-black uppercase tracking-wider text-emerald-300">{opportunityRankLabel(report.markets, index)}</div><h3 className="mt-2 text-2xl font-black">{countryNames[market.countrySlug]}</h3></div><div className="text-right">{market.ranking.score === null ? <div className="text-lg font-black text-amber-200">Insufficient evidence</div> : <div className="text-4xl font-black text-emerald-300">{market.ranking.score}</div>}<div className="mt-1 text-xs uppercase text-slate-400">{market.ranking.confidence} confidence · {market.ranking.coverage}% coverage</div></div></div>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">{(["low", "typical", "high"] as const).map(key => <div key={key} className="glass-metric rounded-xl border p-4"><div className="text-xs capitalize text-slate-400">{key}</div><div className="mt-1 font-black">{formatNativeSalary(market.salary[key], market.salary.sourceCurrency)}</div></div>)}</div>
        <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2"><div><dt className="font-bold text-slate-400">Hiring outlook</dt><dd className="mt-1">{market.hiringOutlook.value ?? "Unavailable"}</dd></div><div><dt className="font-bold text-slate-400">Demand</dt><dd className="mt-1">{market.demand.value ?? "Unavailable"}</dd></div><div><dt className="font-bold text-slate-400">Evidence freshness</dt><dd className="mt-1">Observation period: {market.salary.observationDate ?? "Unavailable"}</dd></div><div><dt className="font-bold text-slate-400">Factor breakdown</dt><dd className="mt-1">{deepFactors ? Object.entries(market.factorBreakdown).map(([factor, value]) => `${factor}: ${value}`).join(" · ") || "No scoreable factors" : "Requires Pro"}</dd></div></dl>
        <div className="mt-6"><div className="mb-2 text-xs font-black uppercase tracking-wider text-emerald-300">{market.dataOrigin === "published" ? "Verified published live profile" : "Verified live fallback profile"}</div>{market.salary.sourceUrl ? <a href={market.salary.sourceUrl} target="_blank" rel="noreferrer" className="font-bold text-cyan-200">{market.salary.sourceName}</a> : <span className="font-bold text-slate-300">Source unavailable</span>}<p className="mt-1 text-xs text-slate-400">Observation period: {market.salary.observationDate ?? "Unavailable"}</p><p className="mt-2 text-xs leading-5 text-slate-500">{market.salary.methodology ?? "Methodology unavailable"}</p><p className="mt-2 text-xs text-slate-500">Pending or unapproved research is never included in this report.</p></div>
        {advanced && <div className="mt-6 grid gap-5 md:grid-cols-2"><div><h4 className="font-black">Limitations</h4><ul className="mt-2 space-y-2 text-sm text-slate-400">{market.limitations.map(item => <li key={item}>• {item}</li>)}</ul></div><div><h4 className="font-black">Next actions</h4><ul className="mt-2 space-y-2 text-sm text-slate-400">{market.nextActions.map(item => <li key={item}>• {item}</li>)}</ul></div></div>}
        {!advanced && <div className="mt-6 rounded-xl border border-amber-300/15 bg-black/15 p-4 text-sm text-slate-400"><span className="font-black text-amber-100">Detailed recommendations and factor evidence require Pro.</span> The Free preview keeps verified benchmarks, confidence and coverage visible. <Link href="/pro" onClick={() => trackMonetizationEvent("pro_feature_viewed", { feature: "advancedReport", route: "opportunity-report" })} className="font-bold text-emerald-300">See Pro features</Link></div>}
      </article>)}</div> : <div className="glass-subtle mt-6 rounded-2xl border p-8 text-center"><h3 className="font-black">No verified market profile matches these inputs</h3><p className="mt-2 text-sm text-slate-400">Choose the United States, Sweden or Germany for one of the seven supported careers.</p></div>}
    </section>}
  </div>;
}
