"use client";
import Link from "next/link";
import { useMemo, useState } from "react";

const careers = [
  {
    title: "Cybersecurity Analyst",
    category: "Technology",
    salary: 125000,
    education: "Degree optional",
    aiRisk: "Low",
    hiring: "Very strong",
    remote: "High",
    visa: "High",
    score: 94,
  },
  {
    title: "Software Engineer",
    category: "Technology",
    salary: 133000,
    education: "Degree optional",
    aiRisk: "Medium",
    hiring: "Strong",
    remote: "High",
    visa: "High",
    score: 92,
  },
  {
    title: "Mechanical Engineer",
    category: "Engineering",
    salary: 102000,
    education: "Degree required",
    aiRisk: "Low",
    hiring: "Stable",
    remote: "Medium",
    visa: "High",
    score: 84,
  },
  {
    title: "Automation Engineer",
    category: "Engineering",
    salary: 118000,
    education: "Degree required",
    aiRisk: "Low",
    hiring: "Strong",
    remote: "Medium",
    visa: "High",
    score: 90,
  },
  {
    title: "Registered Nurse",
    category: "Healthcare",
    salary: 94000,
    education: "Degree required",
    aiRisk: "Very low",
    hiring: "Very strong",
    remote: "Low",
    visa: "High",
    score: 93,
  },
  {
    title: "Electrician",
    category: "Skilled Trades",
    salary: 71000,
    education: "No degree",
    aiRisk: "Very low",
    hiring: "Strong",
    remote: "Low",
    visa: "Medium",
    score: 89,
  },
  {
    title: "Plumber",
    category: "Skilled Trades",
    salary: 63000,
    education: "No degree",
    aiRisk: "Very low",
    hiring: "Strong",
    remote: "Low",
    visa: "Medium",
    score: 87,
  },
  {
    title: "Airline Pilot",
    category: "Aviation",
    salary: 227000,
    education: "No degree",
    aiRisk: "Low",
    hiring: "Stable",
    remote: "Low",
    visa: "Medium",
    score: 86,
  },
  {
    title: "Sales Engineer",
    category: "Sales",
    salary: 122000,
    education: "Degree optional",
    aiRisk: "Low",
    hiring: "Strong",
    remote: "High",
    visa: "High",
    score: 91,
  },
  {
    title: "Construction Manager",
    category: "Construction",
    salary: 107000,
    education: "Degree optional",
    aiRisk: "Very low",
    hiring: "Strong",
    remote: "Low",
    visa: "High",
    score: 90,
  },
];

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

export default function CareersPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [education, setEducation] = useState("All");
  const [aiRisk, setAiRisk] = useState("All");
  const [remote, setRemote] = useState("All");
  const [salary, setSalary] = useState("0");

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
        aiRisk === "All" || career.aiRisk === aiRisk;

      const matchesRemote =
        remote === "All" || career.remote === remote;

      const matchesSalary =
        career.salary >= Number(salary);

      return (
        matchesSearch &&
        matchesCategory &&
        matchesEducation &&
        matchesAi &&
        matchesRemote &&
        matchesSalary
      );
    });
  }, [search, category, education, aiRisk, remote, salary]);

  return (
    <main className="min-h-screen bg-[#07101f] text-white">
      <header className="border-b border-white/10 bg-[#07101f]/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <a href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-emerald-400 font-black text-slate-950">
              CF
            </div>

            <div>
              <div className="text-xl font-bold tracking-tight">
                Career<span className="text-blue-400">Forge</span>
              </div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-slate-500">
                Global Career Intelligence
              </div>
            </div>
          </a>

          <div className="flex items-center gap-4 text-sm">
            <a href="/" className="text-slate-400 hover:text-white">
              Home
            </a>
            <button className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 font-semibold">
              Sign in
            </button>
          </div>
        </div>
      </header>

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
            Search and compare careers by salary, education, AI exposure,
            remote flexibility and market opportunity.
          </p>
        </div>

        <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.035] p-5">
          <div className="grid gap-3 lg:grid-cols-6">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search careers..."
              className="rounded-xl border border-white/10 bg-[#0b1527] px-4 py-3 outline-none placeholder:text-slate-600 lg:col-span-2"
            />

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-xl border border-white/10 bg-[#0b1527] px-4 py-3"
            >
              {categories.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>

            <select
              value={education}
              onChange={(e) => setEducation(e.target.value)}
              className="rounded-xl border border-white/10 bg-[#0b1527] px-4 py-3"
            >
              <option>All</option>
              <option>No degree</option>
              <option>Degree optional</option>
              <option>Degree required</option>
            </select>

            <select
              value={aiRisk}
              onChange={(e) => setAiRisk(e.target.value)}
              className="rounded-xl border border-white/10 bg-[#0b1527] px-4 py-3"
            >
              <option>All</option>
              <option>Very low</option>
              <option>Low</option>
              <option>Medium</option>
            </select>

            <select
              value={remote}
              onChange={(e) => setRemote(e.target.value)}
              className="rounded-xl border border-white/10 bg-[#0b1527] px-4 py-3"
            >
              <option>All</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span className="text-sm text-slate-500">Minimum salary</span>

            {[
              ["0", "Any"],
              ["80000", "$80k+"],
              ["100000", "$100k+"],
              ["120000", "$120k+"],
              ["150000", "$150k+"],
            ].map(([value, label]) => (
              <button
                key={value}
                onClick={() => setSalary(value)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  salary === value
                    ? "bg-blue-400 text-slate-950"
                    : "border border-white/10 bg-white/5 text-slate-400 hover:text-white"
                }`}
              >
                {label}
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
              setSalary("0");
            }}
            className="text-sm font-semibold text-blue-300 hover:text-blue-200"
          >
            Reset filters
          </button>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredCareers.map((career) => (
            <article
              key={career.title}
              className="group rounded-2xl border border-white/10 bg-white/[0.035] p-6 transition hover:-translate-y-1 hover:border-blue-400/30"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
                    {career.category}
                  </div>

                  <h2 className="mt-2 text-xl font-bold">
                    {career.title}
                  </h2>
                </div>

                <div className="rounded-xl bg-blue-400/10 px-3 py-2 text-sm font-black text-blue-300">
                  {career.score}
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-black/20 p-4">
                  <div className="text-xs text-slate-500">Salary</div>
                  <div className="mt-1 font-bold">
                    ${Math.round(career.salary / 1000)}k
                  </div>
                </div>

                <div className="rounded-xl bg-black/20 p-4">
                  <div className="text-xs text-slate-500">Hiring</div>
                  <div className="mt-1 font-bold text-emerald-300">
                    {career.hiring}
                  </div>
                </div>

                <div className="rounded-xl bg-black/20 p-4">
                  <div className="text-xs text-slate-500">AI risk</div>
                  <div className="mt-1 font-bold">{career.aiRisk}</div>
                </div>

                <div className="rounded-xl bg-black/20 p-4">
                  <div className="text-xs text-slate-500">Remote</div>
                  <div className="mt-1 font-bold">{career.remote}</div>
                </div>
              </div>

              <div className="mt-5 border-t border-white/10 pt-5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Education</span>
                  <span className="font-semibold">
                    {career.education}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-slate-500">Visa friendliness</span>
                  <span className="font-semibold">{career.visa}</span>
                </div>
              </div>

              <Link
  href={`/careers/${career.title
    .toLowerCase()
    .replaceAll(" ", "-")}`}
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
            <h2 className="mt-4 text-xl font-bold">No careers found</h2>
            <p className="mt-2 text-slate-500">
              Try changing your filters.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}