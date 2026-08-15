"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  CAREER_RESEARCH_CAREERS,
  CAREER_RESEARCH_COUNTRIES,
  getCareerResearchTarget,
} from "@/lib/careerResearch/registry";
import type { CareerResearchCandidate } from "@/lib/careerResearch/model";
import { getCareerResearchCountrySource } from "@/lib/careerResearch/countryRegistry";

type ResearchRun = {
  id: number;
  status: string;
  researched_at: string;
  created_at: string;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  review_notes?: string | null;
  published_by?: string | null;
  published_at?: string | null;
  publication_version_id?: number | null;
  candidate_profile: CareerResearchCandidate;
  live_profile_snapshot: { salary?: { low?: number | null; typical?: number | null; high?: number | null } };
};

type ResearchResponse = { message?: string; error?: string; run?: ResearchRun; runs?: ResearchRun[]; publication?: { versionId?: number } };
type BulkResearchResult = { careerSlug: string; countrySlug: string; status: string; error?: string; researchedAt?: string };

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
  const [bulkRunning, setBulkRunning] = useState(false);
  const [bulkResults, setBulkResults] = useState<BulkResearchResult[]>([]);
  const [reviewing, setReviewing] = useState(false);
  const [reviewNotes, setReviewNotes] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [confirmPublish, setConfirmPublish] = useState(false);
  const target = getCareerResearchTarget(careerSlug, countrySlug);
  const countrySource = getCareerResearchCountrySource(countrySlug);
  const supported = Boolean(target?.enabled);

  const request = useCallback(async (
    method: "GET" | "POST" | "PATCH" | "PUT",
    actionBody?: { runId: number; decision?: "approve" | "reject"; reviewNotes?: string }
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
          ? JSON.stringify(actionBody)
          : method === "PUT"
            ? JSON.stringify({ runId: actionBody?.runId })
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
    setMessage("Collecting official labour-market evidence...");
    try {
      const result = await request("POST");
      setMessage(result.message ?? "Research completed.");
      if (result.run) setSelected(result.run);
      await loadHistory();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Research failed.");
    } finally { setRunning(false); }
  }

  async function runSupportedBatch() {
    if (bulkRunning) return;
    setBulkRunning(true);
    setMessage("Running stale or unresearched supported targets sequentially...");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Admin session not found. Please sign in again.");
      const response = await fetch("/api/research/career-market", {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ bulk: true }),
      });
      const result = await response.json() as { error?: string; results?: BulkResearchResult[] };
      if (!response.ok) throw new Error(result.error ?? "Bulk research failed.");
      const results = result.results ?? [];
      setBulkResults(results);
      const created = results.filter((item) => item.status === "pending_review").length;
      const skipped = results.filter((item) => item.status === "skipped_fresh").length;
      const failed = results.filter((item) => item.status === "failed").length;
      setMessage(`Bulk research complete · ${created} pending review · ${skipped} fresh/skipped · ${failed} failed. Nothing was published.`);
      await loadHistory();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Bulk research failed.");
    } finally { setBulkRunning(false); }
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

  async function publishResearch() {
    if (!selected || selected.status !== "approved" || selected.published_at || publishing) return;
    setPublishing(true);
    setMessage("Publishing approved evidence atomically...");
    try {
      const result = await request("PUT", { runId: selected.id });
      setMessage(result.message ?? "Publication completed.");
      if (result.run) setSelected(result.run);
      setConfirmPublish(false);
      await loadHistory();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Publication failed.");
    } finally { setPublishing(false); }
  }

  const candidate = selected?.candidate_profile;
  const liveSalary = selected?.live_profile_snapshot?.salary;
  const publishingSupported = Boolean(
    candidate && getCareerResearchTarget(candidate.careerSlug, candidate.countrySlug)?.enabled
  );

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
      <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 sm:p-8">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.18em] text-emerald-300">Career-market target</div>
            <h2 className="mt-2 text-2xl font-black">Select automated research</h2>
            <p className="mt-3 max-w-2xl leading-7 text-slate-400">Choose a career and labour market. Supported targets collect the latest official national salary distribution and store a review candidate.</p>
          </div>
          <div className="flex shrink-0 flex-col gap-3"><button type="button" onClick={runResearch} disabled={running || bulkRunning || !supported} className="rounded-xl bg-emerald-300 px-6 py-3 font-black text-slate-950 disabled:cursor-not-allowed disabled:opacity-50">{running ? "Researching..." : "Run Research"}</button><button type="button" onClick={runSupportedBatch} disabled={running || bulkRunning} className="rounded-xl border border-blue-300/25 bg-blue-300/10 px-6 py-3 text-sm font-black text-blue-200 disabled:opacity-50">{bulkRunning ? "Running batch..." : "Research stale supported targets"}</button></div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-bold text-slate-300">Career<select value={careerSlug} onChange={(event) => changeCareer(event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-[#091426] px-4 py-3 text-white"><option value="" disabled>Select career</option>{CAREER_RESEARCH_CAREERS.map((career) => <option key={career.slug} value={career.slug}>{career.name}</option>)}</select></label>
          <label className="text-sm font-bold text-slate-300">Country<select value={countrySlug} onChange={(event) => changeCountry(event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-[#091426] px-4 py-3 text-white">{CAREER_RESEARCH_COUNTRIES.map((country) => <option key={country.slug} value={country.slug}>{country.name}</option>)}</select></label>
        </div>
        <div className={`mt-4 rounded-xl border px-4 py-3 text-sm ${supported ? "border-emerald-300/20 bg-emerald-300/[0.06] text-emerald-200" : "border-slate-400/15 bg-white/[0.025] text-slate-400"}`}>
          {supported ? `Automated research supported · ${target?.careerName} · ${target?.countryName} · ${target?.nativeCurrency} · ${countrySource?.sourceSystem}` : `Automated research ${countrySource?.automationStatus === "discovery" ? "is in source discovery" : "is not supported"} for this combination. ${countrySource?.disabledReason ?? "No fallback conversion or substitute market data will be used."}`}
        </div>
        <div className="mt-6 rounded-2xl border border-amber-300/15 bg-amber-300/[0.04] p-4 text-sm leading-6 text-amber-100/80">Research and review never change live data. Only the separate, explicit publishing confirmation below can update the supported live profile. Currency conversion is not accepted as local salary evidence.</div>
        {message && <div className="mt-4 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-300">{message}</div>}
        {bulkResults.length > 0 && <details className="mt-4 rounded-xl border border-white/10 bg-black/10 p-4"><summary className="cursor-pointer text-sm font-bold text-slate-300">Latest batch source-health results</summary><div className="mt-3 grid gap-2 sm:grid-cols-2">{bulkResults.map((result) => <div key={`${result.careerSlug}:${result.countrySlug}`} className="rounded-lg border border-white/10 px-3 py-2 text-xs"><div className="font-bold">{result.careerSlug} · {result.countrySlug}</div><div className={result.status === "failed" ? "mt-1 text-red-300" : result.status === "pending_review" ? "mt-1 text-emerald-300" : "mt-1 text-slate-500"}>{result.status.replaceAll("_", " ")}{result.error ? ` · ${result.error}` : ""}</div></div>)}</div></details>}

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
          {selected?.status === "approved" && <div className="mt-6 rounded-2xl border border-fuchsia-300/25 bg-fuchsia-300/[0.055] p-5">
            <div className="text-xs font-black uppercase tracking-[0.18em] text-fuchsia-200">Publishing decision</div>
            <h4 className="mt-2 text-xl font-black">Current live → approved candidate</h4>
            <p className="mt-2 text-sm leading-6 text-slate-400">Publishing is separate from approval. It writes a versioned Supabase live profile used by the public page; the TypeScript profile remains the fallback.</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">{(["low", "typical", "high"] as const).map((key) => {
              const changed = liveSalary?.[key] !== candidate.salary[key].value;
              return <div key={key} className={`rounded-xl border p-4 ${changed ? "border-fuchsia-300/30 bg-fuchsia-300/[0.07]" : "border-white/10 bg-black/10"}`}><div className="text-xs font-black uppercase text-slate-500">{key}{changed ? " · changed" : ""}</div><div className="mt-2 text-sm text-slate-500">Current: {formatMoney(liveSalary?.[key], candidate.salary.sourceCurrency)}</div><div className="mt-1 font-black">Candidate: {formatMoney(candidate.salary[key].value, candidate.salary.sourceCurrency)}</div></div>;
            })}</div>
            <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
              <div><dt className="font-bold text-slate-500">Native currency</dt><dd className="mt-1">{candidate.salary.sourceCurrency}</dd></div>
              <div><dt className="font-bold text-slate-500">Geography</dt><dd className="mt-1">{candidate.salary.typical.provenance?.geography}</dd></div>
              <div><dt className="font-bold text-slate-500">Observation period</dt><dd className="mt-1">{candidate.salary.typical.provenance?.observationPeriod}</dd></div>
              <div><dt className="font-bold text-slate-500">Verification</dt><dd className="mt-1">{candidate.salary.verificationStatus}</dd></div>
              <div className="sm:col-span-2"><dt className="font-bold text-slate-500">Source</dt><dd className="mt-1"><a className="text-blue-300 hover:underline" href={candidate.salary.typical.provenance?.sourceUrl} target="_blank" rel="noreferrer">{candidate.salary.typical.provenance?.sourceName}</a></dd></div>
              <div className="sm:col-span-2"><dt className="font-bold text-slate-500">Methodology</dt><dd className="mt-1 leading-6">{candidate.salary.methodology.lowMeasure} / {candidate.salary.methodology.typicalMeasure} / {candidate.salary.methodology.highMeasure}. {candidate.salary.methodology.normalization}</dd></div>
            </dl>
            {selected.published_at ? <div className="mt-5 rounded-xl border border-emerald-300/20 bg-emerald-300/[0.07] p-4 text-sm text-emerald-100"><div className="font-black">Published</div><div className="mt-1">Version #{selected.publication_version_id} · {new Date(selected.published_at).toLocaleString()}</div><div className="mt-1 break-all text-emerald-200/70">By {selected.published_by}</div></div> : publishingSupported ? confirmPublish ? <div className="mt-5 rounded-xl border border-red-300/25 bg-red-300/[0.07] p-4"><div className="font-black text-red-100">This WILL change public SEKUR career data.</div><p className="mt-2 text-sm text-slate-300">The approved candidate becomes the live {target.careerName} · {target.countryName} profile and an immutable before/after version is recorded.</p><div className="mt-4 flex flex-col gap-3 sm:flex-row"><button type="button" disabled={publishing} onClick={publishResearch} className="rounded-xl bg-red-300 px-5 py-3 font-black text-slate-950 disabled:opacity-50">{publishing ? "Publishing..." : "Confirm publication"}</button><button type="button" disabled={publishing} onClick={() => setConfirmPublish(false)} className="rounded-xl border border-white/15 px-5 py-3 font-bold">Cancel</button></div></div> : <button type="button" onClick={() => setConfirmPublish(true)} className="mt-5 rounded-xl bg-fuchsia-300 px-5 py-3 font-black text-slate-950">Publish approved evidence</button> : <p className="mt-5 text-sm text-slate-400">Publishing v1.1 is not enabled for this target.</p>}
          </div>}
        </div> : <p className="mt-8 text-slate-500">{supported ? "No stored candidate for this selection yet. Run the research pipeline to create the first reviewable snapshot." : "Automated research is not available for this career-market selection."}</p>}
      </section>

      <aside className="rounded-3xl border border-white/10 bg-[#091426] p-6">
        <h2 className="text-xl font-black">Research history</h2><p className="mt-2 text-sm leading-6 text-slate-500">Latest ten immutable snapshots for the selected career × country.</p>
        <div className="mt-5 space-y-3">{runs.map((run) => <button key={run.id} type="button" onClick={() => { setSelected(run); setConfirmPublish(false); }} className={`w-full rounded-xl border p-4 text-left ${selected?.id === run.id ? "border-blue-400/40 bg-blue-400/10" : "border-white/10 bg-white/[0.025]"}`}><div className="flex justify-between gap-3"><span className="font-bold">Run #{run.id}</span><span className="text-xs font-black uppercase text-amber-300">{run.status.replace("_", " ")}{run.published_at ? " · published" : ""}</span></div><div className="mt-2 text-xs text-slate-500">{new Date(run.researched_at || run.created_at).toLocaleString()}</div></button>)}{runs.length === 0 && <div className="rounded-xl border border-dashed border-white/10 p-5 text-sm text-slate-500">No research history.</div>}</div>
      </aside>
    </div>
  );
}
