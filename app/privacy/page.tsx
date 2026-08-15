import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = { title: "Privacy Notice | SEKUR" };

const sections = [
  ["Information SEKUR handles", "SEKUR handles account identifiers supplied through authentication, optional career-profile details, saved careers and markets, alert preferences, and reports you request. Research evidence shown publicly is not derived from private user profiles."],
  ["Why it is used", "This information is used to authenticate you, save your preferences, generate requested career-intelligence features, enforce feature access, protect the service, and diagnose failures."],
  ["Storage and access", "Authentication and private application records are stored using Supabase. Row-level security is designed to restrict private profile, saved-item, alert, comparison, and report records to the signed-in user. Authorized administrators can access separate research and governance tools; those tools do not expose private user records in the public experience."],
  ["Alerts and payments", "Alert preferences may be stored, but no email, SMS, or push delivery provider is connected. SEKUR does not currently accept payments or store payment-card information."],
  ["Your choices", "You can update profile details, disable alert preferences, and remove saved intelligence in the product. For account deletion, data-access, or correction requests during the private beta, contact the beta administrator who invited you."],
  ["Local browser storage", "SEKUR stores your Original or Glass UHD visual preference in your browser. Authentication libraries may also use browser storage required to maintain your signed-in session."],
  ["Beta notice", "This notice describes the current private-beta implementation and must be reviewed against the final operating entity, hosting region, retention schedule, subprocessors, and contact details before public launch."],
] as const;

export default function PrivacyPage() {
  return <main className="sekur-intelligence min-h-screen text-white"><SiteHeader /><article className="mx-auto max-w-3xl px-5 py-14"><p className="text-xs font-black uppercase tracking-[.18em] text-emerald-300">Private beta</p><h1 className="mt-3 text-4xl font-black">Privacy notice</h1><p className="mt-4 text-sm text-slate-400">Effective August 2026</p><div className="mt-10 space-y-8">{sections.map(([title, body]) => <section key={title}><h2 className="text-xl font-black">{title}</h2><p className="mt-3 leading-7 text-slate-400">{body}</p></section>)}</div></article></main>;
}
