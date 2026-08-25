"use client";

import ProfileClient from "./ProfileClient";
import UserSessionGate from "./UserSessionGate";

export default function ProfileGate({ careers, countries, returnTo }: { careers: Array<{ slug: string; title: string }>; countries: Array<{ slug: string; name: string; currency: string }>; returnTo?: string }) {
  return <UserSessionGate returnTo={returnTo}>{user => <ProfileClient user={user} careers={careers} countries={countries} />}</UserSessionGate>;
}
