"use client";

import ProfileClient from "./ProfileClient";
import UserSessionGate from "./UserSessionGate";

export default function ProfileGate({ careers, countries }: { careers: Array<{ slug: string; title: string }>; countries: Array<{ slug: string; name: string; currency: string }> }) {
  return <UserSessionGate>{user => <ProfileClient user={user} careers={careers} countries={countries} />}</UserSessionGate>;
}
