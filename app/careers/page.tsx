import { getCareers } from "@/lib/careers";
import CareersClient from "./CareersClient";

export default async function CareersPage() {
  const careers = await getCareers();

  return <CareersClient careers={careers} />;
}