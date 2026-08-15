import { getCareers } from "@/lib/careers";
import CareersClient from "./CareersClient";

export default async function CareersPage({ searchParams }: { searchParams: Promise<{ q?: string; category?: string; aiRisk?: string }> }) {
  const careers = await getCareers();
  const { q = "", category = "All", aiRisk = "All" } = await searchParams;

  return <CareersClient careers={careers} initialSearch={q} initialCategory={category} initialAiRisk={aiRisk} />;
}
