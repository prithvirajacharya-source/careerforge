"use client";

import type { CareerCountryProfile } from "@/lib/careerCountryModel";
import type { CareerProfile } from "@/lib/careerModel";
import OpportunityReportClient from "./OpportunityReportClient";
import UserSessionGate from "./UserSessionGate";

export default function OpportunityReportGate({ careers, markets }: { careers: CareerProfile[]; markets: CareerCountryProfile[] }) {
  return <UserSessionGate>{user => <OpportunityReportClient user={user} careers={careers} markets={markets} />}</UserSessionGate>;
}
