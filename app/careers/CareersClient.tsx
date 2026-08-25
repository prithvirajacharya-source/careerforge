"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import SalaryRange from "@/components/SalaryRange";
import SiteHeader from "@/components/SiteHeader";
import { CareerListRecord, educationSummary } from "@/lib/careerModel";
import { CAREER_CATEGORIES } from "@/lib/careerCatalog";

const categories = ["All", ...CAREER_CATEGORIES];

export default function CareersClient({ careers, initialSearch = "", initialCategory = "All", initialAiRisk = "All" }: { careers: CareerListRecord[]; initialSearch?: string; initialCategory?: string; initialAiRisk?: string }) {
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [aiRisk, setAiRisk] = useState(initialAiRisk);
  const [remote, setRemote] = useState("All");

  const filteredCareers = useMemo(() => careers.filter((career) => (
    career.title.toLowerCase().includes(search.toLowerCase()) &&
    (category === "All" || career.category === category) &&
    (aiRisk === "All" || career.ai_risk === aiRisk) &&
    (remote === "All" || career.remote_work === remote)
  )), [careers, search, category, aiRisk, remote]);

  function resetFilters() {
    setSearch("");
    setCategory("All");
    setAiRisk("All");
    setRemote("All");
  }

  return (
    <main className="sekur-discovery min-h-screen bg-[#07101f] text-white">
      <SiteHeader />
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-400">Explore</p>
          <h1 className="mt-4 text-5xl font-black tracking-tight md:text-6xl">
            Find a career that fits
            <span className="block bg-gradient-to-r from-blue-400 to-emerald-300 bg-clip-text text-transparent">your goals.</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-400">Choose a career. You can select where you want to work on the next screen.</p>
        </div>

        <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.035] p-5">
          <div className="grid gap-4 md:grid-cols-[1fr_240px]">
            <label className="text-xs font-bold uppercase tracking-[.12em] text-slate-400">What job are you interested in?
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Job title or keyword" className="mt-2 w-full rounded-xl border border-white/10 bg-[#0b1527] px-4 py-3 text-base font-normal normal-case tracking-normal text-white outline-none placeholder:text-slate-600" />
            </label>
            <label className="text-xs font-bold uppercase tracking-[.12em] text-slate-400">Career category
              <select value={category} onChange={(event) => setCategory(event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-[#0b1527] px-4 py-3 text-base font-normal normal-case tracking-normal text-white outline-none">
                {categories.map((item) => <option key={item} value={item}>{item === "All" ? "All categories" : item}</option>)}
              </select>
            </label>
          </div>
          <details className="mt-5 border-t border-white/10 pt-4"><summary className="cursor-pointer text-sm font-bold text-slate-300">More filters</summary><div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="text-xs font-bold uppercase tracking-[.12em] text-slate-400">AI risk level
              <select value={aiRisk} onChange={(event) => setAiRisk(event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-[#0b1527] px-4 py-3 text-base font-normal normal-case tracking-normal text-white outline-none">
                {["All", "Very Low", "Low", "Medium", "High"].map((item) => <option key={item} value={item}>{item === "All" ? "All risk levels" : item}</option>)}
              </select>
            </label><div><div className="text-xs font-bold uppercase tracking-[.12em] text-slate-400">Remote flexibility</div><div className="mt-2 flex flex-wrap items-center gap-2">
            {["All", "High", "Medium", "Low"].map((item) => (
              <button key={item} type="button" onClick={() => setRemote(item)} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${remote === item ? "bg-emerald-300 text-slate-950" : "border border-white/10 bg-white/5 text-slate-400 hover:text-white"}`}>{item}</button>
            ))}
          </div></div></div><button type="button" onClick={resetFilters} className="mt-4 text-sm font-semibold text-blue-300 hover:text-blue-200">Reset filters</button></details>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <div className="text-sm text-slate-500">{filteredCareers.length} careers found</div>
        </div>

        <div className="career-results-grid mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredCareers.map((career) => (
            <Link href={`/careers/${career.slug}`} key={career.id} className="glass-hover group rounded-2xl border border-white/10 bg-white/[0.035] p-6 transition hover:-translate-y-1 hover:border-emerald-300/35">
              <div className="flex items-start justify-between gap-4">
                <div><div className="text-xs uppercase tracking-[0.16em] text-slate-500">{career.category ?? "Career"}</div><h2 className="mt-2 text-xl font-bold">{career.title}</h2></div>
                {career.career_score !== null && <div className="signal-chip rounded-xl px-3 py-2 text-sm font-black">{career.career_score}</div>}
              </div>
              {career.description && <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-400">{career.description}</p>}
              {(career.ai_risk || career.remote_work) && <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-black/20 p-4"><div className="text-xs text-slate-500">AI risk</div><div className="mt-1 font-bold">{career.ai_risk ?? "Not rated"}</div></div>
                <div className="rounded-xl bg-black/20 p-4"><div className="text-xs text-slate-500">Remote</div><div className="mt-1 font-bold">{career.remote_work ?? "Not rated"}</div></div>
              </div>}
              {career.profile && <div className="mt-5 space-y-4 border-t border-white/10 pt-5 text-sm">
                {career.profile?.salary && <div className="flex items-start justify-between gap-4"><span className="text-slate-500">U.S. base salary</span><span className="text-right font-semibold"><SalaryRange salary={career.profile.salary} showTypical={false} /></span></div>}
                <div className="flex items-start justify-between gap-4"><span className="text-slate-500">Education</span><span className="text-right font-semibold">{educationSummary(career.profile?.education ?? null, career.education)}</span></div>
              </div>}
            </Link>
          ))}
        </div>

        {filteredCareers.length === 0 && (
          <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.025] px-6 py-16 text-center">
            <div className="text-3xl" aria-hidden="true">&#128269;</div>
            <h2 className="mt-4 text-xl font-bold">No careers found</h2>
            <p className="mt-2 text-slate-500">Try changing your filters.</p>
          </div>
        )}
      </section>
    </main>
  );
}
