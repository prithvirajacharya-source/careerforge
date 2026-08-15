"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Choice = { slug: string; name: string };

export default function HomeCareerSearch({ careers, countries }: { careers: Choice[]; countries: Choice[] }) {
  const router = useRouter();
  const [career, setCareer] = useState("");
  const [country, setCountry] = useState("");

  function explore(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!career) return;
    router.push(country ? `/careers/${career}?country=${country}` : `/careers/${career}`);
  }

  return (
    <form onSubmit={explore} className="home-career-search glass-panel mt-8 max-w-3xl rounded-2xl border p-4 sm:p-5">
      <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
        <label className="text-sm font-bold text-slate-200">
          What job are you interested in?
          <select value={career} onChange={(event) => setCareer(event.target.value)} className="glass-control mt-2 w-full rounded-xl px-4 py-3.5 text-white" required>
            <option value="">Choose a career</option>
            {careers.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}
          </select>
        </label>
        <label className="text-sm font-bold text-slate-200">
          Where do you want to work?
          <select value={country} onChange={(event) => setCountry(event.target.value)} className="glass-control mt-2 w-full rounded-xl px-4 py-3.5 text-white">
            <option value="">Choose a country</option>
            {countries.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}
          </select>
        </label>
        <button className="rounded-xl bg-emerald-300 px-6 py-3.5 font-black text-slate-950 disabled:opacity-50" disabled={!career}>
          Show opportunities
        </button>
      </div>
      <p className="mt-3 text-xs leading-5 text-slate-400">Choose a career first. Country-specific intelligence appears wherever verified data is available.</p>
    </form>
  );
}
