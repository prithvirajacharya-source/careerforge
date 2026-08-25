import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = { title: "Private Beta Terms | SEKUR" };

const sections = [
  ["Private-beta service", "SEKUR is currently an evaluation service. Features, evidence coverage, availability, and access may change, and unsupported or unavailable fields are intentionally left blank rather than estimated."],
  ["Informational use", "Salary, outlook, education, licensing, safety, and opportunity information is supplied for general research. It is not a guarantee or a substitute for professional legal, immigration, licensing, tax, financial, employment, or compensation advice."],
  ["Source and currency limitations", "SEKUR preserves source provenance and local-market evidence. Display-currency conversion does not turn one country's evidence into another country's labour-market data and does not change hourly, monthly, or annual salary periods."],
  ["Accounts", "You are responsible for safeguarding your sign-in credentials and for the accuracy of information you add. Do not attempt to access another user's records or administrative functions."],
  ["Research governance", "Unreviewed research candidates are not public evidence. Approval and publication are separate administrative actions, and unsupported-market evidence must not be inferred or published."],
  ["Pro, billing, and alerts", "Pro checkout and subscription management are available only when the payment provider is configured. Payments are processed by the provider; SEKUR does not store raw card details. Alert preferences can be saved, but notifications are not currently delivered."],
  ["Public-launch requirement", "These private-beta terms are an operational placeholder. The final operating entity, jurisdiction, support contact, liability terms, acceptable-use rules, and dispute terms require legal review before public launch."],
] as const;

export default function TermsPage() {
  return <main className="sekur-intelligence min-h-screen text-white"><SiteHeader /><article className="mx-auto max-w-3xl px-5 py-14"><p className="text-xs font-black uppercase tracking-[.18em] text-emerald-300">Private beta</p><h1 className="mt-3 text-4xl font-black">Terms of use</h1><p className="mt-4 text-sm text-slate-400">Effective August 2026</p><div className="mt-10 space-y-8">{sections.map(([title, body]) => <section key={title}><h2 className="text-xl font-black">{title}</h2><p className="mt-3 leading-7 text-slate-400">{body}</p></section>)}</div></article></main>;
}
