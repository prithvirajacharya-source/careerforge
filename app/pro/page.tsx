import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import BillingActions from "@/components/billing/BillingActions";

export const metadata: Metadata = { title: "SEKUR Pro" };

export default async function ProPage({ searchParams }: { searchParams: Promise<{ checkout?: string }> }) {
  const { checkout } = await searchParams;
  return <main className="sekur-intelligence min-h-screen text-white"><SiteHeader /><section className="mx-auto max-w-5xl px-5 py-16">
    <div className="mx-auto max-w-2xl text-center"><p className="text-xs font-black uppercase tracking-[.18em] text-emerald-300">SEKUR Pro</p><h1 className="mt-3 text-4xl font-black sm:text-5xl">Move from information to a decision</h1><p className="mt-4 leading-7 text-slate-400">Explore freely. Pro adds personalized recommendations and deeper planning tools when you need them.</p></div>
    {checkout === "success" && <p className="mx-auto mt-8 max-w-2xl rounded-xl bg-emerald-300/10 p-4 text-center text-sm text-emerald-100">Checkout returned successfully. Access activates only after Stripe confirms the subscription securely.</p>}{checkout === "canceled" && <p className="mx-auto mt-8 max-w-2xl rounded-xl bg-white/5 p-4 text-center text-sm text-slate-300">Checkout was canceled. Your current plan has not changed.</p>}
    <div className="mt-10 grid gap-5 md:grid-cols-2"><article className="glass-card rounded-3xl border p-7"><h2 className="text-2xl font-black">Free</h2><p className="mt-3 text-slate-300">Explore careers and countries, browse jobs, use basic comparisons, and preview opportunities.</p><Link href="/careers" className="mt-8 inline-block rounded-xl border border-white/15 px-5 py-3 font-bold">Start exploring</Link></article><article className="glass-card rounded-3xl border border-emerald-300/25 p-7"><h2 className="text-2xl font-black text-emerald-200">Pro</h2><p className="mt-3 text-slate-300">Unlock full personalized reports, advanced comparisons, job matching, detailed action plans, monitoring and alerts.</p><p className="mt-5 text-sm text-slate-400">The configured Stripe price is shown securely at checkout. No fake price is displayed when billing is unavailable.</p><BillingActions /></article></div>
  </section></main>;
}
