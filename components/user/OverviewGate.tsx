"use client";

import OverviewClient from "./OverviewClient";
import UserSessionGate from "./UserSessionGate";

export default function OverviewGate() {
  return <UserSessionGate>{user => <OverviewClient user={user} />}</UserSessionGate>;
}
