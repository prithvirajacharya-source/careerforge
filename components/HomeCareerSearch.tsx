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
    <form onSubmit={explore} className="home-career-search w-full border-t-2 border-blue-600 bg-white p-6 shadow-[0_12px_34px_rgba(15,32,58,.08)] sm:p-8">
      <div className="grid gap-5">
        <label className="text-sm font-semibold text-slate-700">
          Career
          <select value={career} onChange={(event) => setCareer(event.target.value)} className="mt-2 w-full rounded-lg border bg-white px-4 py-3.5 text-slate-950" required>
            <option value="">Choose a career</option>
            {careers.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}
          </select>
        </label>
        <label className="text-sm font-semibold text-slate-700">
          Country
          <select value={country} onChange={(event) => setCountry(event.target.value)} className="mt-2 w-full rounded-lg border bg-white px-4 py-3.5 text-slate-950" required>
            <option value="">Choose a country</option>
            {countries.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}
          </select>
        </label>
        <button className="product-button product-button-primary disabled:cursor-not-allowed disabled:bg-slate-300" disabled={!career || !country}>
          View Career Opportunity
        </button>
      </div>
      <p className="mt-3 text-xs leading-5 text-slate-500">Results are shown only where SEKUR has sufficient career-market evidence.</p>
    </form>
  );
}
