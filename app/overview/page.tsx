import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import OverviewGate from "@/components/user/OverviewGate";

export const metadata: Metadata = { title: "Overview | SEKUR", robots: { index: false, follow: false } };

export default function OverviewPage() {
  return <main className="sekur-intelligence min-h-screen"><SiteHeader /><section className="mx-auto max-w-5xl px-5 py-10 sm:px-6 sm:py-12"><OverviewGate /></section></main>;
}
