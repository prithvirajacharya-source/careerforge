"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { OpportunityResponse } from "@/lib/opportunity/types";

export default function OpportunityPreview({ career, country, title }: { career?: string; country?: string; title: string }) {
  const [report, setReport] = useState<OpportunityResponse | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/opportunities/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ career, countries: country ? [country] : undefined, limit: 3, includeJobs: country === "sweden" }),
      signal: controller.signal,
    }).then((response) => response.ok ? response.json() : null).then((data) => { if (data) setReport(data); }).catch(() => undefined);
    return () => controller.abort();
  }, [career, country]);

  const recommendations = report?.recommendations.filter((item) => item.opportunityScore !== null) ?? [];
  if (!recommendations.length) return null;
  return <section className="mx-auto max-w-7xl px-6 pt-14"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-semibold text-emerald-300">Opportunity intelligence</p><h2 className="mt-2 text-2xl font-black sm:text-3xl">{title}</h2></div><Link href="/opportunity-report" className="text-sm font-bold text-blue-300">Personalize results →</Link></div><div className="mt-6 grid gap-4 md:grid-cols-3">{recommendations.map((item) => <Link key={`${item.countrySlug}:${item.careerSlug}`} href={`/careers/${item.careerSlug}?country=${item.countrySlug}`} className="rounded-2xl bg-white/[0.035] p-5 transition hover:bg-white/[0.06]"><div className="flex items-start justify-between gap-4"><div><strong className="block text-lg">{country ? item.careerName : item.countryName}</strong><span className="text-sm text-slate-400">{country ? item.countryName : item.careerName}</span></div><span className="text-2xl font-black text-emerald-300">{item.opportunityScore}</span></div><p className="mt-3 text-sm capitalize text-slate-500">{item.evidenceCoverage}% coverage · {item.confidence.replace("-", " ")} confidence</p></Link>)}</div></section>;
}
