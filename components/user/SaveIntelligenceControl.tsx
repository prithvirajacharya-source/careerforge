"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type SaveTarget = { itemType: "career" | "country" | "career_market"; careerSlug?: string; countrySlug?: string; label?: string };

export default function SaveIntelligenceControl({ itemType, careerSlug, countrySlug, label = "Save" }: SaveTarget) {
  const [userId, setUserId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      setUserId(data.user.id);
      let query = supabase.from("saved_career_markets").select("id").eq("user_id", data.user.id).eq("item_type", itemType);
      query = careerSlug ? query.eq("career_slug", careerSlug) : query.is("career_slug", null);
      query = countrySlug ? query.eq("country_slug", countrySlug) : query.is("country_slug", null);
      const { data: row } = await query.maybeSingle();
      setSavedId(row?.id ?? null);
    });
  }, [careerSlug, countrySlug, itemType]);

  if (!userId) return <Link href="/profile" className="rounded-lg border border-white/15 bg-black/15 px-3 py-2 text-xs font-bold text-slate-300 hover:text-white">{label}</Link>;
  async function toggle() {
    if (busy) return;
    setBusy(true);
    if (savedId) {
      const { error } = await supabase.from("saved_career_markets").delete().eq("id", savedId).eq("user_id", userId);
      if (!error) setSavedId(null);
    } else {
      const { data, error } = await supabase.from("saved_career_markets").insert({ user_id: userId, item_type: itemType, career_slug: careerSlug ?? null, country_slug: countrySlug ?? null }).select("id").single();
      if (!error) setSavedId(data.id);
    }
    setBusy(false);
  }
  return <button type="button" onClick={toggle} disabled={busy} aria-pressed={Boolean(savedId)} className={`rounded-lg border px-3 py-2 text-xs font-bold transition disabled:opacity-50 ${savedId ? "border-emerald-300/30 bg-emerald-300/10 text-emerald-200" : "border-white/15 bg-black/15 text-slate-300 hover:text-white"}`}>{savedId ? "Saved" : label}</button>;
}
