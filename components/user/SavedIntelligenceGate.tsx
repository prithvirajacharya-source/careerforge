"use client";

import SavedIntelligenceClient from "./SavedIntelligenceClient";
import UserSessionGate from "./UserSessionGate";

export default function SavedIntelligenceGate({ names }: { names: Record<string, string> }) {
  return <UserSessionGate>{user => <SavedIntelligenceClient user={user} names={names} />}</UserSessionGate>;
}
