import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import BillingActions from "@/components/billing/BillingActions";
import CareerPathArt from "@/components/brand/CareerPathArt";

export const metadata: Metadata = { title: "SEKUR Pro" };

export default async function ProPage({ searchParams }: { searchParams: Promise<{ checkout?: string }> }) {
  const { checkout } = await searchParams;
  return <main className="sekur-intelligence min-h-screen"><SiteHeader /><section className="mx-auto max-w-5xl px-5 py-14">
    <div className="grid gap-10 border-b border-slate-200 pb-10 md:grid-cols-[1fr_340px] md:items-center"><div><p className="product-eyebrow">SEKUR Pro</p><h1 className="mt-3 text-4xl font-bold sm:text-5xl">Make better career decisions.</h1><p className="mt-4 max-w-2xl leading-7 text-slate-600">Know your strongest opportunities, why they fit, what is holding you back, and when the evidence changes.</p></div><CareerPathArt variant="path" className="w-full" /></div>
    {checkout === "success" && <p className="status-positive mx-auto mt-8 max-w-2xl rounded-lg p-4 text-center text-sm">Checkout returned successfully. Access activates only after Stripe confirms the subscription securely.</p>}{checkout === "canceled" && <p className="status-info mx-auto mt-8 max-w-2xl rounded-lg p-4 text-center text-sm">Checkout was canceled. Your current plan has not changed.</p>}
    <div className="mt-10 grid gap-10 md:grid-cols-[1fr_1fr]"><article><h2 className="text-2xl font-bold">Free</h2><p className="mt-3 text-slate-600">Explore careers and countries, browse jobs, use basic comparisons, and preview opportunities.</p><Link href="/careers" className="product-button product-button-secondary mt-7">Start exploring</Link></article><article className="border-l border-slate-200 pl-0 md:pl-8"><p className="product-eyebrow">Deeper intelligence</p><h2 className="mt-2 text-2xl font-bold">Pro</h2><ul className="mt-4 divide-y divide-slate-200 border-y border-slate-200 text-sm text-slate-700">{["Know your strongest opportunities","Understand why they fit","See your barriers and action plan","Track evidence changes","Get deeper job intelligence"].map(item=><li key={item} className="py-3">{item}</li>)}</ul><p className="mt-5 text-sm text-slate-600">The configured Stripe price is shown securely at checkout. No fake price is displayed when billing is unavailable.</p><BillingActions /></article></div>
  </section></main>;
}
