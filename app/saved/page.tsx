import SiteHeader from "@/components/SiteHeader";
import SavedIntelligenceGate from "@/components/user/SavedIntelligenceGate";
import { careerProfiles } from "@/lib/careerProfiles";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Saved Intelligence | SEKUR", robots: { index: false, follow: false } };

export default function SavedPage() {
  const names: Record<string, string> = { "united-states": "United States", sweden: "Sweden", germany: "Germany", ...Object.fromEntries(Object.values(careerProfiles).map(career => [career.slug, career.title])) };
  return <main className="sekur-intelligence min-h-screen text-white"><SiteHeader /><section className="mx-auto max-w-7xl px-5 py-12 sm:px-6 sm:py-16"><SavedIntelligenceGate names={names} /></section></main>;
}
