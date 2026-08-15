"use client";

import { useState } from "react";

export default function HomeCareerSearch({ categories }: { categories: string[] }) {
  const [open, setOpen] = useState(false);
  const [key, setKey] = useState(0);

  return (
    <form key={key} action="/careers" className="home-career-search glass-panel mt-8 max-w-2xl rounded-2xl border p-2">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input name="q" aria-label="Search careers" placeholder="Search careers..." className="glass-control min-w-0 flex-1 rounded-xl px-4 py-3.5 text-white outline-none placeholder:text-slate-400" />
        <button type="button" aria-expanded={open} onClick={() => setOpen((value) => !value)} className="rounded-xl border border-white/15 bg-white/[0.06] px-5 py-3 font-bold text-white">Filters</button>
        <button type="button" onClick={() => { setKey((value) => value + 1); setOpen(false); }} className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-300">Reset</button>
        <button className="rounded-xl bg-emerald-300 px-6 py-3 font-black text-slate-950">Search</button>
      </div>
      {open && <div className="mt-2 rounded-xl border border-white/15 bg-[#061421]/95 p-5 shadow-xl">
        <h2 className="text-lg font-black">Refine your search</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="text-xs font-black uppercase tracking-[.14em] text-slate-300">Country<select disabled className="glass-control mt-2 w-full rounded-lg px-3 py-3 text-sm text-white disabled:opacity-70"><option>All countries</option></select></label>
          <label className="text-xs font-black uppercase tracking-[.14em] text-slate-300">Career category<select name="category" defaultValue="All" className="glass-control mt-2 w-full rounded-lg px-3 py-3 text-sm text-white"><option value="All">All categories</option>{categories.map((category) => <option key={category}>{category}</option>)}</select></label>
          <label className="text-xs font-black uppercase tracking-[.14em] text-slate-300">Experience level<select disabled className="glass-control mt-2 w-full rounded-lg px-3 py-3 text-sm text-white disabled:opacity-70"><option>All levels</option></select></label>
          <label className="text-xs font-black uppercase tracking-[.14em] text-slate-300">AI risk level<select name="aiRisk" defaultValue="All" className="glass-control mt-2 w-full rounded-lg px-3 py-3 text-sm text-white"><option value="All">All risk levels</option>{["Very Low","Low","Medium","High"].map((risk) => <option key={risk}>{risk}</option>)}</select></label>
        </div>
        <button className="mt-5 rounded-lg bg-emerald-300 px-5 py-3 font-black text-slate-950">Apply filters</button>
      </div>}
    </form>
  );
}
