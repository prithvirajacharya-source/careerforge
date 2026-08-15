import SiteHeader from "@/components/SiteHeader";
import OpportunityReportGate from "@/components/user/OpportunityReportGate";
import { careerProfiles } from "@/lib/careerProfiles";
import { getCareerCountryProfiles } from "@/lib/careerCountryProfiles";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Opportunity Report | SEKUR", robots: { index: false, follow: false } };

const supported = ["mechanical-engineer", "cybersecurity-analyst", "software-engineer", "electrical-engineer", "data-scientist", "registered-nurse", "accountant"];

export default function OpportunityReportPage() {
  const careers = Object.values(careerProfiles).filter(career => supported.includes(career.slug));
  const markets = careers.flatMap(career => getCareerCountryProfiles(career.slug));
  return <main className="sekur-intelligence min-h-screen text-white"><SiteHeader /><section className="mx-auto max-w-7xl px-5 py-12 sm:px-6 sm:py-16"><OpportunityReportGate careers={careers} markets={markets} /></section></main>;
}
