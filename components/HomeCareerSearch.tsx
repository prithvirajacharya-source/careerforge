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
    if (!career || !country) return;
    router.push(`/careers/${career}?country=${country}`);
  }

  return (
    <form onSubmit={explore} className="home-career-search glass-panel w-full rounded-2xl border p-5 sm:p-6">
      <div className="grid gap-5">
        <label className="text-sm font-bold text-slate-200">
          What job are you interested in?
          <select value={career} onChange={(event) => setCareer(event.target.value)} className="glass-control mt-2 w-full rounded-xl px-4 py-3.5 text-white" required>
            <option value="">Choose a career</option>
            {careers.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}
          </select>
        </label>
        <label className="text-sm font-bold text-slate-200">
          Where do you want to work?
          <select value={country} onChange={(event) => setCountry(event.target.value)} className="glass-control mt-2 w-full rounded-xl px-4 py-3.5 text-white" required>
            <option value="">Choose a country</option>
            {countries.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}
          </select>
        </label>
        <button className="rounded-xl bg-emerald-300 px-6 py-3.5 font-black text-slate-950 shadow-[0_10px_28px_rgba(110,231,183,.16)] transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400 disabled:opacity-70 disabled:shadow-none" disabled={!career || !country}>
          Show opportunities
        </button>
      </div>
      <p className="mt-3 text-xs leading-5 text-slate-400">Choose both to see the available intelligence for that opportunity.</p>
    </form>
  );
}
