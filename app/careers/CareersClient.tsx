"use client";
import SiteHeader from "@/components/SiteHeader";
import Link from "next/link";
import { useMemo, useState } from "react";

type Career = {
  id: number;
  slug: string;
  title: string;
  category: string | null;
  description: string | null;
  education: string | null;
  ai_risk: string | null;
  remote_work: string | null;
  career_score: number | null;
};

const categories = [
  "All",
  "Technology",
  "Engineering",
  "Healthcare",
  "Skilled Trades",
  "Aviation",
  "Sales",
  "Construction",
];

export default function CareersClient({
  careers,
}: {
  careers: Career[];
}) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [education, setEducation] = useState("All");
  const [aiRisk, setAiRisk] = useState("All");
  const [remote, setRemote] = useState("All");

  const filteredCareers = useMemo(() => {
    return careers.filter((career) => {
      const matchesSearch = career.title
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesCategory =
        category === "All" || career.category === category;

      const matchesEducation =
        education === "All" || career.education === education;

      const matchesAi =
        aiRisk === "All" || career.ai_risk === aiRisk;

      const matchesRemote =
        remote === "All" || career.remote_work === remote;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesEducation &&
        matchesAi &&
        matchesRemote
      );
    });
  }, [careers, search, category, education, aiRisk, remote]);

  return (
    <main className="min-h-screen bg-[#07101f] text-white">
      <SiteHeader />

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-400">
            Career Explorer
          </p>

          <h1 className="mt-4 text-5xl font-black tracking-tight md:text-6xl">
            Find a career that fits
            <span className="block bg-gradient-to-r from-blue-400 to-emerald-300 bg-clip-text text-transparent">
              your goals.
            </span>
          </h1>

          <p className="mt-6 text-lg leading-8 text-slate-400">
            Search and compare careers by education, AI exposure,
            remote flexibility and SEKUR Opportunity Score.
          </p>
        </div>

        <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.035] p-5">
          <div className="grid gap-3 lg:grid-cols-5">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search careers..."
              className="rounded-xl border border-white/10 bg-[#0b1527] px-4 py-3 outline-none placeholder:text-slate-600 lg:col-span-2"
            />

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-xl border border-white/10 bg-[#0b1527] px-4 py-3 outline-none"
            >
              {categories.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>

            <select
              value={education}
              onChange={(e) => setEducation(e.target.value)}
              className="rounded-xl border border-white/10 bg-[#0b1527] px-4 py-3 outline-none"
            >
              <option>All</option>
              <option>Bachelor Degree</option>
              <option>Degree Optional</option>
              <option>No Degree</option>
            </select>

            <select
              value={aiRisk}
              onChange={(e) => setAiRisk(e.target.value)}
              className="rounded-xl border border-white/10 bg-[#0b1527] px-4 py-3 outline-none"
            >
              <option>All</option>
              <option>Very Low</option>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>

          <div className="mt-3 flex items-center gap-3">
            <span className="text-sm text-slate-500">
              Remote flexibility
            </span>

            {["All", "High", "Medium", "Low"].map((item) => (
              <button
                key={item}
                onClick={() => setRemote(item)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  remote === item
                    ? "bg-blue-400 text-slate-950"
                    : "border border-white/10 bg-white/5 text-slate-400 hover:text-white"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <div className="text-sm text-slate-500">
            {filteredCareers.length} careers found
          </div>

          <button
            onClick={() => {
              setSearch("");
              setCategory("All");
              setEducation("All");
              setAiRisk("All");
              setRemote("All");
            }}
            className="text-sm font-semibold text-blue-300 hover:text-blue-200"
          >
            Reset filters
          </button>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredCareers.map((career) => (
            <article
              key={career.id}
              className="group rounded-2xl border border-white/10 bg-white/[0.035] p-6 transition hover:-translate-y-1 hover:border-blue-400/30"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
                    {career.category ?? "Career"}
                  </div>

                  <h2 className="mt-2 text-xl font-bold">
                    {career.title}
                  </h2>
                </div>

                <div className="rounded-xl bg-blue-400/10 px-3 py-2 text-sm font-black text-blue-300">
                  {career.career_score ?? "—"}
                </div>
              </div>

              {career.description && (
                <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-400">
                  {career.description}
                </p>
              )}

              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-black/20 p-4">
                  <div className="text-xs text-slate-500">AI risk</div>
                  <div className="mt-1 font-bold">
                    {career.ai_risk ?? "Not rated"}
                  </div>
                </div>

                <div className="rounded-xl bg-black/20 p-4">
                  <div className="text-xs text-slate-500">Remote</div>
                  <div className="mt-1 font-bold">
                    {career.remote_work ?? "Not rated"}
                  </div>
                </div>
              </div>

              <div className="mt-5 border-t border-white/10 pt-5">
                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className="text-slate-500">Education</span>

                  <span className="text-right font-semibold">
                    {career.education ?? "Not specified"}
                  </span>
                </div>
              </div>

              <Link
                href={`/careers/${career.slug}`}
                className="mt-6 block w-full rounded-xl border border-white/10 bg-white/5 py-3 text-center text-sm font-bold transition group-hover:border-blue-400/30 group-hover:bg-blue-400/10"
              >
                View career intelligence →
              </Link>
            </article>
          ))}
        </div>

        {filteredCareers.length === 0 && (
          <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.025] px-6 py-16 text-center">
            <div className="text-3xl">🔍</div>

            <h2 className="mt-4 text-xl font-bold">
              No careers found
            </h2>

            <p className="mt-2 text-slate-500">
              Try changing your filters.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}