"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function SaveComparisonControl({ left, right, leftName, rightName }: { left: string; right: string; leftName: string; rightName: string }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  useEffect(() => { supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null)); }, []);
  if (!userId) return <Link href="/profile" className="text-sm font-bold text-cyan-200">Sign in to save comparison</Link>;
  async function save() {
    const ordered = [{ countrySlug: left, name: leftName }, { countrySlug: right, name: rightName }].sort((a, b) => a.countrySlug.localeCompare(b.countrySlug));
    const comparisonKey = ordered.map(target => `country:${target.countrySlug}`).join("|");
    const { error } = await supabase.from("saved_career_comparisons").insert({ user_id: userId, comparison_key: comparisonKey, name: `${ordered[0].name} vs ${ordered[1].name}`, targets: ordered.map(({ countrySlug }) => ({ countrySlug })) });
    setMessage(error?.code === "23505" ? "Comparison already saved." : error ? error.message : "Comparison saved.");
  }
  return <div className="flex items-center gap-3"><button type="button" onClick={save} className="rounded-lg border border-white/15 px-3 py-2 text-xs font-bold">Save comparison</button>{message && <span className="text-xs text-slate-400">{message}</span>}</div>;
}
