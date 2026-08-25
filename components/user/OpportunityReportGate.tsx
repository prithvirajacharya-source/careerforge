"use client";
import type { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import type { CareerProfile } from "@/lib/careerModel";
import { supabase } from "@/lib/supabase";
import OpportunityReportClient from "./OpportunityReportClient";
export default function OpportunityReportGate({ careers }: { careers: CareerProfile[] }) { const [user, setUser] = useState<User | null>(null); const [checking, setChecking] = useState(true); useEffect(() => { supabase.auth.getUser().then(({ data }) => setUser(data.user)).finally(() => setChecking(false)); const { data } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null)); return () => data.subscription.unsubscribe(); }, []); if (checking) return <div className="glass-panel rounded-2xl border p-8 text-slate-300">Preparing your Opportunity Engine…</div>; return <OpportunityReportClient user={user} careers={careers} />; }
