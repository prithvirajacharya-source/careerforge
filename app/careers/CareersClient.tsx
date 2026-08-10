"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import SalaryRange from "@/components/SalaryRange";
import SiteHeader from "@/components/SiteHeader";
import { CareerListRecord, educationSummary } from "@/lib/careerModel";

const categories = ["All", "Technology", "Engineering", "Healthcare", "Skilled Trades", "Aviation", "Sales", "Construction"];

export default function CareersClient({ careers }: { careers: CareerListRecord[] }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [aiRisk, setAiRisk] = useState("All");
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
    <main className="min-h-screen bg-[#07101f] text-white">
      <SiteHeader />
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-400">Career Explorer</p>
          <h1 className="mt-4 text-5xl font-black tracking-tight md:text-6xl">
            Find a career that fits
            <span className="block bg-gradient-to-r from-blue-400 to-emerald-300 bg-clip-text text-transparent">your goals.</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-400">Search and compare careers by education pathways, AI exposure, remote flexibility and SEKUR Opportunity Score.</p>
        </div>

        <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.035] p-5">
          <div className="grid gap-3 lg:grid-cols-4">
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search careers..." className="rounded-xl border border-white/10 bg-[#0b1527] px-4 py-3 outline-none placeholder:text-slate-600 lg:col-span-2" />
            <select value={category} onChange={(event) => setCategory(event.target.value)} className="rounded-xl border border-white/10 bg-[#0b1527] px-4 py-3 outline-none">
              {categories.map((item) => <option key={item}>{item}</option>)}
            </select>
            <select value={aiRisk} onChange={(event) => setAiRisk(event.target.value)} className="rounded-xl border border-white/10 bg-[#0b1527] px-4 py-3 outline-none">
              {["All", "Very Low", "Low", "Medium", "High"].map((item) => <option key={item}>{item}</option>)}
            </select>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="text-sm text-slate-500">Remote flexibility</span>
            {["All", "High", "Medium", "Low"].map((item) => (
              <button key={item} type="button" onClick={() => setRemote(item)} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${remote === item ? "bg-blue-400 text-slate-950" : "border border-white/10 bg-white/5 text-slate-400 hover:text-white"}`}>{item}</button>
            ))}
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <div className="text-sm text-slate-500">{filteredCareers.length} careers found</div>
          <button type="button" onClick={resetFilters} className="text-sm font-semibold text-blue-300 hover:text-blue-200">Reset filters</button>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredCareers.map((career) => (
            <article key={career.id} className="group rounded-2xl border border-white/10 bg-white/[0.035] p-6 transition hover:-translate-y-1 hover:border-blue-400/30">
              <div className="flex items-start justify-between gap-4">
                <div><div className="text-xs uppercase tracking-[0.16em] text-slate-500">{career.category ?? "Career"}</div><h2 className="mt-2 text-xl font-bold">{career.title}</h2></div>
                <div className="rounded-xl bg-blue-400/10 px-3 py-2 text-sm font-black text-blue-300">{career.career_score ?? "\u2014"}</div>
              </div>
              {career.description && <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-400">{career.description}</p>}
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-black/20 p-4"><div className="text-xs text-slate-500">AI risk</div><div className="mt-1 font-bold">{career.ai_risk ?? "Not rated"}</div></div>
                <div className="rounded-xl bg-black/20 p-4"><div className="text-xs text-slate-500">Remote</div><div className="mt-1 font-bold">{career.remote_work ?? "Not rated"}</div></div>
              </div>
              <div className="mt-5 space-y-4 border-t border-white/10 pt-5 text-sm">
                {career.profile?.salary && <div className="flex items-start justify-between gap-4"><span className="text-slate-500">U.S. base salary</span><span className="text-right font-semibold"><SalaryRange salary={career.profile.salary} showTypical={false} /></span></div>}
                <div className="flex items-start justify-between gap-4"><span className="text-slate-500">Education</span><span className="text-right font-semibold">{educationSummary(career.profile?.education ?? null, career.education)}</span></div>
              </div>
              <Link href={`/careers/${career.slug}`} className="mt-6 block w-full rounded-xl border border-white/10 bg-white/5 py-3 text-center text-sm font-bold transition group-hover:border-blue-400/30 group-hover:bg-blue-400/10">View career intelligence {"\u2192"}</Link>
            </article>
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
