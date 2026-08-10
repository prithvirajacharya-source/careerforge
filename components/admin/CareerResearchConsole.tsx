"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  CAREER_RESEARCH_CAREERS,
  CAREER_RESEARCH_COUNTRIES,
  getCareerResearchTarget,
} from "@/lib/careerResearch/registry";
import type { CareerResearchCandidate } from "@/lib/careerResearch/model";

type ResearchRun = {
  id: number;
  status: string;
  researched_at: string;
  created_at: string;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  review_notes?: string | null;
  candidate_profile: CareerResearchCandidate;
  live_profile_snapshot: { salary?: { low?: number | null; typical?: number | null; high?: number | null } };
};

type ResearchResponse = { message?: string; error?: string; run?: ResearchRun; runs?: ResearchRun[] };

function formatMoney(value: number | null | undefined, currency: string) {
  return value == null ? "Unavailable" : new Intl.NumberFormat("en", { style: "currency", currency, maximumFractionDigits: 0 }).format(value);
}

export default function CareerResearchConsole() {
  const [careerSlug, setCareerSlug] = useState("mechanical-engineer");
  const [countrySlug, setCountrySlug] = useState("sweden");
  const [runs, setRuns] = useState<ResearchRun[]>([]);
  const [selected, setSelected] = useState<ResearchRun | null>(null);
  const [message, setMessage] = useState("");
  const [running, setRunning] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [reviewNotes, setReviewNotes] = useState("");
  const target = getCareerResearchTarget(careerSlug, countrySlug);
  const supported = Boolean(target?.enabled);

  const request = useCallback(async (
    method: "GET" | "POST" | "PATCH",
    reviewBody?: { runId: number; decision: "approve" | "reject"; reviewNotes: string }
  ) => {
    if (!target?.enabled) throw new Error("Automated research is not supported for this career-market combination.");
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Admin session not found. Please sign in again.");
    const query = new URLSearchParams({ careerSlug: target.careerSlug, countrySlug: target.countrySlug });
    const response = await fetch(`/api/research/career-market?${query}`, {
      method,
      headers: { Authorization: `Bearer ${session.access_token}`, ...(method !== "GET" ? { "Content-Type": "application/json" } : {}) },
      body: method === "POST"
        ? JSON.stringify({ careerSlug: target.careerSlug, countrySlug: target.countrySlug })
        : method === "PATCH"
          ? JSON.stringify(reviewBody)
          : undefined,
    });
    const result = (await response.json()) as ResearchResponse;
    if (!response.ok) throw new Error(result.error ?? `Research request failed with HTTP ${response.status}.`);
    return result;
  }, [target]);

  const loadHistory = useCallback(async () => {
    try {
      const result = await request("GET");
      const history = result.runs ?? [];
      setRuns(history);
      setSelected((current) => current ?? history[0] ?? null);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not load research history.");
    }
  }, [request]);

  useEffect(() => {
    if (!target?.enabled) return;
    let active = true;
    request("GET")
      .then((result) => {
        if (!active) return;
        const history = result.runs ?? [];
        setRuns(history);
        setSelected(history[0] ?? null);
      })
      .catch((error: unknown) => {
        if (active) setMessage(error instanceof Error ? error.message : "Could not load research history.");
      });
    return () => { active = false; };
  }, [request, target]);

  function changeCareer(value: string) {
    setCareerSlug(value);
    setRuns([]);
    setSelected(null);
    setMessage("");
  }

  function changeCountry(value: string) {
    setCountrySlug(value);
    setRuns([]);
    setSelected(null);
    setMessage("");
  }

  async function runResearch() {
    if (running || !supported) return;
    setRunning(true);
    setMessage("Collecting official SCB evidence...");
    try {
      const result = await request("POST");
      setMessage(result.message ?? "Research completed.");
      if (result.run) setSelected(result.run);
      await loadHistory();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Research failed.");
    } finally { setRunning(false); }
  }

  async function reviewResearch(decision: "approve" | "reject") {
    if (!selected || selected.status !== "pending_review" || reviewing) return;
    setReviewing(true);
    setMessage(decision === "approve" ? "Approving research review..." : "Rejecting research review...");
    try {
      const result = await request("PATCH", { runId: selected.id, decision, reviewNotes });
      setMessage(result.message ?? "Review completed.");
      if (result.run) setSelected(result.run);
      setReviewNotes("");
      await loadHistory();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Review failed.");
    } finally { setReviewing(false); }
  }

  const candidate = selected?.candidate_profile;
  const liveSalary = selected?.live_profile_snapshot?.salary;

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
      <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 sm:p-8">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.18em] text-emerald-300">Career-market target</div>
            <h2 className="mt-2 text-2xl font-black">Select automated research</h2>
            <p className="mt-3 max-w-2xl leading-7 text-slate-400">Choose a career and labour market. Supported Swedish targets collect the latest official national SCB salary distribution and store a review candidate.</p>
          </div>
          <button type="button" onClick={runResearch} disabled={running || !supported} className="shrink-0 rounded-xl bg-emerald-300 px-6 py-3 font-black text-slate-950 disabled:cursor-not-allowed disabled:opacity-50">{running ? "Researching..." : "Run Research"}</button>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-bold text-slate-300">Career<select value={careerSlug} onChange={(event) => changeCareer(event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-[#091426] px-4 py-3 text-white"><option value="" disabled>Select career</option>{CAREER_RESEARCH_CAREERS.map((career) => <option key={career.slug} value={career.slug}>{career.name}</option>)}</select></label>
          <label className="text-sm font-bold text-slate-300">Country<select value={countrySlug} onChange={(event) => changeCountry(event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-[#091426] px-4 py-3 text-white">{CAREER_RESEARCH_COUNTRIES.map((country) => <option key={country.slug} value={country.slug}>{country.name}</option>)}</select></label>
        </div>
        <div className={`mt-4 rounded-xl border px-4 py-3 text-sm ${supported ? "border-emerald-300/20 bg-emerald-300/[0.06] text-emerald-200" : "border-slate-400/15 bg-white/[0.025] text-slate-400"}`}>
          {supported ? `Automated research supported · ${target?.careerName} · ${target?.countryName} · ${target?.nativeCurrency}` : "Automated research is not yet supported for this combination. No fallback conversion or substitute market data will be used."}
        </div>
        <div className="mt-6 rounded-2xl border border-amber-300/15 bg-amber-300/[0.04] p-4 text-sm leading-6 text-amber-100/80">Review only: this runner cannot publish or overwrite verified live data. Currency conversion is not accepted as local salary evidence.</div>
        {message && <div className="mt-4 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-300">{message}</div>}

        {candidate && target ? <div className="mt-8">
          <div className="flex flex-wrap items-center justify-between gap-3"><h3 className="text-xl font-black">Candidate vs current live profile</h3><span className={`rounded-full border px-3 py-1 text-xs font-black uppercase tracking-wider ${selected?.status === "approved" ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-200" : selected?.status === "rejected" ? "border-red-300/20 bg-red-300/10 text-red-200" : "border-amber-300/20 bg-amber-300/10 text-amber-200"}`}>{selected?.status.replace("_", " ")}</span></div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">{(["low", "typical", "high"] as const).map((key) => <div key={key} className="rounded-2xl border border-white/10 bg-[#091426] p-5"><div className="text-xs font-black uppercase tracking-wider text-slate-500">{key}</div><div className="mt-2 text-xl font-black">{formatMoney(candidate.salary[key].value, target.nativeCurrency)}</div><div className="mt-2 text-xs text-slate-500">Live: {formatMoney(liveSalary?.[key], target.nativeCurrency)}</div></div>)}</div>
          <dl className="mt-6 grid gap-5 text-sm sm:grid-cols-2">
            <div><dt className="font-bold text-slate-500">Native currency</dt><dd className="mt-1">{candidate.salary.sourceCurrency}</dd></div>
            <div><dt className="font-bold text-slate-500">Observation period</dt><dd className="mt-1">{candidate.salary.typical.provenance?.observationPeriod ?? "Unavailable"}</dd></div>
            <div><dt className="font-bold text-slate-500">Geography</dt><dd className="mt-1">{candidate.salary.typical.provenance?.geography ?? "Unavailable"}</dd></div>
            <div><dt className="font-bold text-slate-500">Researched</dt><dd className="mt-1">{new Date(candidate.researchedAt).toLocaleString()}</dd></div>
            <div className="sm:col-span-2"><dt className="font-bold text-slate-500">Methodology</dt><dd className="mt-1 leading-6">{candidate.salary.methodology.lowMeasure} / {candidate.salary.methodology.typicalMeasure} / {candidate.salary.methodology.highMeasure}. {candidate.salary.methodology.normalization}</dd></div>
            <div className="sm:col-span-2"><dt className="font-bold text-slate-500">Source</dt><dd className="mt-1"><a className="text-blue-300 hover:underline" href={candidate.salary.typical.provenance?.sourceUrl} target="_blank" rel="noreferrer">{candidate.salary.typical.provenance?.sourceName}</a></dd></div>
          </dl>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">{["Hiring outlook", "Demand", "Employment risk", "Education/pathway"].map((label) => <div key={label} className="rounded-xl border border-white/10 bg-white/[0.025] p-4"><div className="font-bold">{label}</div><div className="mt-1 text-sm text-slate-500">Unavailable — no evidence inferred</div></div>)}</div>
          <div className="mt-6 rounded-2xl border border-blue-300/20 bg-blue-300/[0.05] p-5">
            <div className="font-black text-blue-200">Approval is review only — it does not publish</div>
            <p className="mt-2 text-sm leading-6 text-slate-400">Approving records that an admin accepts this evidence for a future publishing workflow. It cannot change source files, Supabase live career data, or public career pages.</p>
            {selected?.status === "pending_review" ? <div className="mt-5">
              <label className="text-sm font-bold text-slate-300">Review notes <span className="font-normal text-slate-500">(optional)</span><textarea value={reviewNotes} onChange={(event) => setReviewNotes(event.target.value)} maxLength={2000} rows={3} placeholder="Why are you approving or rejecting this evidence?" className="mt-2 w-full resize-y rounded-xl border border-white/10 bg-[#07101f] px-4 py-3 text-white outline-none focus:border-blue-300/40" /></label>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <button type="button" disabled={reviewing} onClick={() => reviewResearch("approve")} className="rounded-xl bg-emerald-300 px-5 py-3 font-black text-slate-950 disabled:opacity-50">{reviewing ? "Reviewing..." : "Approve evidence"}</button>
                <button type="button" disabled={reviewing} onClick={() => reviewResearch("reject")} className="rounded-xl border border-red-300/30 bg-red-300/10 px-5 py-3 font-black text-red-200 disabled:opacity-50">Reject evidence</button>
              </div>
            </div> : <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2"><div><dt className="font-bold text-slate-500">Reviewed at</dt><dd className="mt-1">{selected?.reviewed_at ? new Date(selected.reviewed_at).toLocaleString() : "Unavailable"}</dd></div><div><dt className="font-bold text-slate-500">Reviewed by</dt><dd className="mt-1 break-all">{selected?.reviewed_by ?? "Unavailable"}</dd></div>{selected?.review_notes && <div className="sm:col-span-2"><dt className="font-bold text-slate-500">Review notes</dt><dd className="mt-1 leading-6">{selected.review_notes}</dd></div>}</dl>}
          </div>
        </div> : <p className="mt-8 text-slate-500">{supported ? "No stored candidate for this selection yet. Run the research pipeline to create the first reviewable snapshot." : "Select Sweden to use the supported official SCB adapter for this career."}</p>}
      </section>

      <aside className="rounded-3xl border border-white/10 bg-[#091426] p-6">
        <h2 className="text-xl font-black">Research history</h2><p className="mt-2 text-sm leading-6 text-slate-500">Latest ten immutable snapshots for the selected career × country.</p>
        <div className="mt-5 space-y-3">{runs.map((run) => <button key={run.id} type="button" onClick={() => setSelected(run)} className={`w-full rounded-xl border p-4 text-left ${selected?.id === run.id ? "border-blue-400/40 bg-blue-400/10" : "border-white/10 bg-white/[0.025]"}`}><div className="flex justify-between gap-3"><span className="font-bold">Run #{run.id}</span><span className="text-xs font-black uppercase text-amber-300">{run.status.replace("_", " ")}</span></div><div className="mt-2 text-xs text-slate-500">{new Date(run.researched_at || run.created_at).toLocaleString()}</div></button>)}{runs.length === 0 && <div className="rounded-xl border border-dashed border-white/10 p-5 text-sm text-slate-500">No research history.</div>}</div>
      </aside>
    </div>
  );
}
