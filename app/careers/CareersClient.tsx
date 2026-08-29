"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import SalaryRange from "@/components/SalaryRange";
import SiteHeader from "@/components/SiteHeader";
import { CareerListRecord, educationSummary } from "@/lib/careerModel";
import { CAREER_CATEGORIES } from "@/lib/careerCatalog";
import CareerPathArt from "@/components/brand/CareerPathArt";

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
    <main className="sekur-discovery min-h-screen">
      <SiteHeader />
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-center">
          <div className="max-w-3xl">
          <p className="product-eyebrow">Career paths</p>
          <h1 className="mt-4 text-5xl font-black tracking-tight md:text-6xl">
            Find the path that fits your goals.
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-400">Explore demand, salary, required skills, education and country-specific opportunity evidence.</p>
          </div><CareerPathArt variant="compass" className="hidden w-full lg:block" />
        </div>

        <div className="mt-10 rounded-xl border border-slate-200 bg-white p-5">
          <div className="grid gap-4 md:grid-cols-[1fr_240px]">
            <label className="text-xs font-bold uppercase tracking-[.12em] text-slate-400">What job are you interested in?
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Job title or keyword" className="mt-2 w-full border border-slate-300 bg-white px-4 py-3 text-base font-normal normal-case tracking-normal text-slate-950 outline-none placeholder:text-slate-600" />
            </label>
            <label className="text-xs font-bold uppercase tracking-[.12em] text-slate-400">Career category
              <select value={category} onChange={(event) => setCategory(event.target.value)} className="mt-2 w-full border border-slate-300 bg-white px-4 py-3 text-base font-normal normal-case tracking-normal text-slate-950 outline-none">
                {categories.map((item) => <option key={item} value={item}>{item === "All" ? "All categories" : item}</option>)}
              </select>
            </label>
          </div>
          <details className="mt-5 border-t border-white/10 pt-4"><summary className="cursor-pointer text-sm font-bold text-slate-300">More filters</summary><div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="text-xs font-bold uppercase tracking-[.12em] text-slate-400">AI risk level
              <select value={aiRisk} onChange={(event) => setAiRisk(event.target.value)} className="mt-2 w-full border border-slate-300 bg-white px-4 py-3 text-base font-normal normal-case tracking-normal text-slate-950 outline-none">
                {["All", "Very Low", "Low", "Medium", "High"].map((item) => <option key={item} value={item}>{item === "All" ? "All risk levels" : item}</option>)}
              </select>
            </label><div><div className="text-xs font-bold uppercase tracking-[.12em] text-slate-400">Remote flexibility</div><div className="mt-2 flex flex-wrap items-center gap-2">
            {["All", "High", "Medium", "Low"].map((item) => (
              <button key={item} type="button" onClick={() => setRemote(item)} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${remote === item ? "bg-blue-600 text-white" : "border border-slate-300 bg-white text-slate-700 hover:border-blue-400 hover:text-blue-700"}`}>{item}</button>
            ))}
          </div></div></div><button type="button" onClick={resetFilters} className="mt-4 text-sm font-semibold text-blue-700 hover:text-blue-800">Reset filters</button></details>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <div className="text-sm text-slate-500">{filteredCareers.length} careers found</div>
        </div>

        <div className="career-results-grid mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredCareers.map((career) => (
            <Link href={`/careers/${career.slug}`} key={career.id} className="group rounded-xl border border-slate-200 bg-white p-6 transition hover:border-blue-300 hover:shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div><div className="text-xs uppercase tracking-[0.16em] text-slate-500">{career.category ?? "Career"}</div><h2 className="mt-2 text-xl font-bold">{career.title}</h2></div>
                {career.career_score !== null && <div className="signal-chip rounded-xl px-3 py-2 text-sm font-black">{career.career_score}</div>}
              </div>
              {career.description && <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-400">{career.description}</p>}
              {(career.ai_risk || career.remote_work) && <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-slate-50 p-4"><div className="text-xs text-slate-600">AI risk</div><div className="mt-1 font-bold">{career.ai_risk ?? "Not rated"}</div></div>
                <div className="rounded-lg bg-slate-50 p-4"><div className="text-xs text-slate-600">Remote</div><div className="mt-1 font-bold">{career.remote_work ?? "Not rated"}</div></div>
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
