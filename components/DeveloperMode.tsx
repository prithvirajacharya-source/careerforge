"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import VisualThemeToggle from "@/components/VisualThemeToggle";

export default function DeveloperMode() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    let active = true;
    void supabase.auth.getUser().then(({ data }) => {
      if (active) setIsAdmin(data.user?.app_metadata?.role === "admin");
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAdmin(session?.user.app_metadata?.role === "admin");
    });
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, []);

  if (!isAdmin) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      {enabled && <div className="glass-elevated w-64 rounded-2xl p-4 text-sm text-white">
        <div className="flex items-center justify-between"><span className="font-black">Intelligence overlay</span><span className="signal-chip rounded-full px-2 py-1 text-[10px] font-bold">ADMIN</span></div>
        <p className="mt-2 text-xs leading-5 text-slate-300">Research and publishing remain protected by existing server authorization.</p>
        <div className="mt-3"><VisualThemeToggle /></div>
        <div className="mt-3 grid grid-cols-2 gap-2"><Link href="/admin/career-research" className="rounded-xl border border-white/15 bg-black/25 px-3 py-2 text-center font-bold text-emerald-200">Research</Link><Link href="/admin" className="rounded-xl border border-white/15 bg-black/25 px-3 py-2 text-center font-bold text-cyan-200">Admin</Link></div>
      </div>}
      <button type="button" aria-pressed={enabled} onClick={() => setEnabled((value) => !value)} className="glass-elevated flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold uppercase tracking-[0.08em] text-white">Developer mode <span className={`h-2 w-2 rounded-full ${enabled ? "bg-emerald-300" : "bg-slate-500"}`} /></button>
    </div>
  );
}
