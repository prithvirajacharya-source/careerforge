"use client";

import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { resolveEntitlements } from "@/lib/personalization/entitlements";

type SavedItem = { id: number; item_type: "career" | "country" | "career_market"; career_slug: string | null; country_slug: string | null; favorite: boolean; alerts_enabled: boolean };
type SavedComparison = { id: number; name: string; targets: Array<{ countrySlug?: string; careerSlug?: string }> };

export default function SavedIntelligenceClient({ user, names }: { user: User; names: Record<string, string> }) {
  const [items, setItems] = useState<SavedItem[]>([]);
  const [comparisons, setComparisons] = useState<SavedComparison[]>([]);
  const [alertsAllowed, setAlertsAllowed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([
      supabase.from("saved_career_markets").select("*").eq("user_id", user.id).order("updated_at", { ascending: false }),
      supabase.from("saved_career_comparisons").select("*").eq("user_id", user.id).order("updated_at", { ascending: false }),
      supabase.from("user_entitlements").select("plan_key,feature_overrides,valid_until").eq("user_id", user.id).maybeSingle(),
    ]).then(([saved, comparisonRows, entitlement]) => {
      if (!active) return;
      if (saved.error || comparisonRows.error) setMessage(saved.error?.message ?? comparisonRows.error?.message ?? "Could not load saved intelligence.");
      setItems((saved.data ?? []) as SavedItem[]);
      setComparisons((comparisonRows.data ?? []) as SavedComparison[]);
      const activePlan = entitlement.data?.valid_until && new Date(entitlement.data.valid_until) < new Date() ? "free" : entitlement.data?.plan_key;
      setAlertsAllowed(resolveEntitlements(activePlan, entitlement.data?.feature_overrides ?? {}).alerts);
      setLoading(false);
    });
    return () => { active = false; };
  }, [user.id]);

  async function removeItem(id: number) { await supabase.from("saved_career_markets").delete().eq("id", id).eq("user_id", user.id); setItems(items.filter(item => item.id !== id)); }
  async function toggleFavorite(item: SavedItem) { const favorite = !item.favorite; const { error } = await supabase.from("saved_career_markets").update({ favorite, updated_at: new Date().toISOString() }).eq("id", item.id).eq("user_id", user.id); if (!error) setItems(items.map(row => row.id === item.id ? { ...row, favorite } : row)); }
  async function toggleAlerts(item: SavedItem) { if (!alertsAllowed || item.item_type !== "career_market") return; const alerts_enabled = !item.alerts_enabled; const { error } = await supabase.from("saved_career_markets").update({ alerts_enabled, updated_at: new Date().toISOString() }).eq("id", item.id).eq("user_id", user.id); if (!error) setItems(items.map(row => row.id === item.id ? { ...row, alerts_enabled } : row)); }
  async function removeComparison(id: number) { await supabase.from("saved_career_comparisons").delete().eq("id", id).eq("user_id", user.id); setComparisons(comparisons.filter(item => item.id !== id)); }

  if (loading) return <div className="glass-panel rounded-2xl border p-8 text-slate-300">Loading saved intelligence...</div>;
  const href = (item: SavedItem) => item.item_type === "career" ? `/careers/${item.career_slug}` : item.item_type === "country" ? `/countries/${item.country_slug}` : `/careers/${item.career_slug}?country=${item.country_slug}`;
  const title = (item: SavedItem) => item.item_type === "career" ? names[item.career_slug ?? ""] : item.item_type === "country" ? names[item.country_slug ?? ""] : `${names[item.career_slug ?? ""]} · ${names[item.country_slug ?? ""]}`;
  return <div><div className="flex flex-wrap items-end justify-between gap-4"><div><h1 className="text-4xl font-black">Saved intelligence</h1><p className="mt-3 text-slate-400">Your private career, country and market watchlist.</p></div><Link href="/opportunity-report" className="rounded-xl bg-emerald-300 px-5 py-3 font-black text-slate-950">Build report</Link></div>{message && <div className="mt-5 rounded-xl border border-red-300/20 bg-red-300/5 p-4 text-sm text-red-100">{message}</div>}<section className="mt-8"><h2 className="text-xl font-black">Careers and markets</h2>{items.length ? <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{items.map(item => <article key={item.id} className="glass-card rounded-2xl border p-5"><div className="flex items-start justify-between gap-3"><div><div className="text-xs font-black uppercase tracking-wider text-emerald-300">{item.item_type.replace("_", " ")}</div><Link href={href(item)} className="mt-2 block text-lg font-black hover:text-emerald-200">{title(item) || "Saved intelligence"}</Link></div><button type="button" onClick={() => toggleFavorite(item)} aria-pressed={item.favorite} className="text-xl" aria-label="Toggle favorite">{item.favorite ? "★" : "☆"}</button></div><div className="mt-5 flex flex-wrap gap-3"><button type="button" onClick={() => removeItem(item.id)} className="text-xs font-bold text-slate-400">Unsave</button>{item.item_type === "career_market" && <button type="button" disabled={!alertsAllowed} onClick={() => toggleAlerts(item)} className="text-xs font-bold text-cyan-200 disabled:text-slate-600">{item.alerts_enabled ? "Alerts on" : alertsAllowed ? "Enable alerts" : "Alerts · Pro"}</button>}</div></article>)}</div> : <div className="glass-subtle mt-4 rounded-2xl border p-8 text-center"><h3 className="font-black">Nothing saved yet</h3><p className="mt-2 text-sm text-slate-400">Save a career, country or labour market while browsing SEKUR.</p><Link href="/careers" className="mt-4 inline-block font-bold text-emerald-300">Explore careers</Link></div>}</section><section className="mt-10"><h2 className="text-xl font-black">Saved comparisons</h2>{comparisons.length ? <div className="mt-4 grid gap-4 md:grid-cols-2">{comparisons.map(comparison => <article key={comparison.id} className="glass-subtle rounded-2xl border p-5"><h3 className="font-black">{comparison.name}</h3><div className="mt-4 flex gap-4"><Link href={`/compare?left=${comparison.targets[0]?.countrySlug}&right=${comparison.targets[1]?.countrySlug}`} className="text-sm font-bold text-emerald-300">Open comparison</Link><button type="button" onClick={() => removeComparison(comparison.id)} className="text-sm font-bold text-slate-400">Remove</button></div></article>)}</div> : <p className="mt-4 text-sm text-slate-500">No saved comparisons.</p>}</section></div>;
}
