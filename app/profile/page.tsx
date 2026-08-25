import SiteHeader from "@/components/SiteHeader";
import ProfileGate from "@/components/user/ProfileGate";
import { careerProfiles } from "@/lib/careerProfiles";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Profile | SEKUR", robots: { index: false, follow: false } };

const countries = [
  { slug: "united-states", name: "United States", currency: "USD" },
  { slug: "sweden", name: "Sweden", currency: "SEK" },
  { slug: "germany", name: "Germany", currency: "EUR" },
];

export default async function ProfilePage({ searchParams }: { searchParams: Promise<{ returnTo?: string }> }) {
  const { returnTo } = await searchParams;
  const careers = Object.values(careerProfiles).filter(career => ["mechanical-engineer", "cybersecurity-analyst", "software-engineer", "electrical-engineer", "data-scientist", "registered-nurse", "accountant"].includes(career.slug)).map(({ slug, title }) => ({ slug, title }));
  return <main className="sekur-intelligence min-h-screen text-white"><SiteHeader /><section className="mx-auto max-w-6xl px-5 py-12 sm:px-6 sm:py-16"><ProfileGate careers={careers} countries={countries} returnTo={returnTo} /></section></main>;
}
