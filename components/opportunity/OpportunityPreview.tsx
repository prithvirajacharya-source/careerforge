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
  return <section className="mx-auto max-w-7xl px-6 pt-14"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-semibold text-blue-700">Opportunity intelligence</p><h2 className="mt-2 text-2xl font-bold sm:text-3xl">{title}</h2></div><Link href="/opportunity-report" className="text-sm font-bold text-blue-700">Personalize results →</Link></div><div className="mt-5 divide-y divide-slate-200 border-y border-slate-200">{recommendations.map((item) => <Link key={`${item.countrySlug}:${item.careerSlug}`} href={`/careers/${item.careerSlug}?country=${item.countrySlug}`} className="grid gap-3 py-4 sm:grid-cols-[1fr_auto_auto] sm:items-center"><div><strong className="block">{country ? item.careerName : item.countryName}</strong><span className="text-sm text-slate-600">{country ? item.countryName : item.careerName}</span></div><span className="text-sm capitalize text-slate-600">{item.evidenceCoverage}% coverage · {item.confidence.replace("-", " ")}</span><span className="text-2xl font-bold text-blue-700">{item.opportunityScore}</span></Link>)}</div></section>;
}
