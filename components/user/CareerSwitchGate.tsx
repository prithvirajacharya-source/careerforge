"use client";
import type { CareerProfile } from "@/lib/careerModel"; import type { CareerCountryProfile } from "@/lib/careerCountryModel"; import UserSessionGate from "./UserSessionGate"; import CareerSwitchClient from "./CareerSwitchClient";
export default function CareerSwitchGate(props: { careers: CareerProfile[]; markets: CareerCountryProfile[] }) { return <UserSessionGate>{user => <CareerSwitchClient user={user} {...props} />}</UserSessionGate>; }
